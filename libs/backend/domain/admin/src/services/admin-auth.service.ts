import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, Optional,UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AdminLoginDto,AdminRegisterDto } from '../dto';
import { AdminIpWhitelistService, GatewayPrismaServiceInterface } from './admin-ip-whitelist.service';
import { AdminJwtService, AdminTokenCacheServiceInterface,AdminTokensResponse } from './admin-jwt.service';

/**
 * Admin 2FA Service Interface
 */
export interface Admin2FAServiceInterface {
  verifyLoginTotp(adminId: string, totpCode: string): Promise<boolean>;
}

/**
 * Structured Logger Service Interface
 */
export interface StructuredLoggerServiceInterface {
  logAdminActivity(event: string, message: string, context?: Record<string, unknown>): void;
  logSecurityEvent(event: string, message: string, context?: Record<string, unknown>): void;
}

/**
 * Admin Notification Service Interface
 */
export interface AdminNotificationServiceInterface {
  notifyNewIpLogin(adminId: string, email: string, ipAddress: string, userAgent?: string): Promise<void>;
  notifyPasswordChanged(adminId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void>;
}

/**
 * Admin Metrics Service Interface
 */
export interface AdminMetricsServiceInterface {
  recordLoginAttempt(status: 'success' | 'failure', role?: string): void;
  recordSecurityEvent(event: string): void;
  recordOperationDuration(operation: string, duration: number): void;
  recordSessionRevoked(): void;
  recordPasswordReset(): void;
}

/**
 * Admin Auth Service
 * Handles admin authentication and registration
 */
@Injectable()
export class AdminAuthService {
  private readonly logger: Logger = new Logger(AdminAuthService.name);
  private readonly SALT_ROUNDS: number = 12;

  constructor(
    @Inject('PrismaService') private prisma: GatewayPrismaServiceInterface,
    private adminJwtService: AdminJwtService,
    private ipWhitelistService: AdminIpWhitelistService,
    @Optional() @Inject('Admin2FAService') private admin2FAService?: Admin2FAServiceInterface,
    @Optional() @Inject('StructuredLoggerService') private structuredLogger?: StructuredLoggerServiceInterface,
    @Optional() @Inject('AdminTokenCacheService') private tokenCacheService?: AdminTokenCacheServiceInterface,
    @Optional() @Inject('AdminNotificationService') private notificationService?: AdminNotificationServiceInterface,
    @Optional() @Inject('AdminMetricsService') private metricsService?: AdminMetricsServiceInterface,
  ) {}

  /**
   * Register new admin (only for super_admin)
   */
  async register(dto: AdminRegisterDto, createdBy?: string): Promise<{ id: string; email: string; role: string }> {
    // Check if admin with email already exists
    const existing: { id: string; email: string } | null = await this.prisma.gatewayAdmin.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
      },
    }) as { id: string; email: string } | null;

    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash password
    const passwordHash: string = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create admin
    const createData: {
      email: string;
      passwordHash: string;
      role: string;
      name?: string;
    } = {
      email: dto.email,
      passwordHash,
      role: dto.role || 'admin',
    };
    if (dto.name !== undefined && dto.name !== null) {
      createData.name = dto.name;
    }
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const admin: { id: string; email: string; role: string } = await this.prisma.gatewayAdmin.create({
      data: createData,
    }) as { id: string; email: string; role: string };

    // Log audit
    if (createdBy) {
      await this.prisma.gatewayAuditLog.create({
        data: {
          adminId: createdBy,
          action: 'create',
          resourceType: 'admin',
          resourceId: admin.id,
          details: { email: dto.email, role: dto.role || 'admin' },
        },
      });
    }

    this.logger.log(`Admin registered: ${dto.email}`);
    this.structuredLogger?.logAdminActivity(
      'admin_registered',
      `Admin registered: ${dto.email}`,
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        action: 'admin_registered',
        resourceType: 'admin',
        ...(createdBy && { createdBy }),
      },
    );

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
  }

  /**
   * Login admin
   */
  async login(dto: AdminLoginDto, ipAddress?: string, userAgent?: string): Promise<AdminTokensResponse & { admin: { id: string; email: string; role: string } }> {
    const loginStartTime: number = Date.now();
    // Find admin
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const admin: {
      id: string;
      email: string;
      passwordHash: string;
      role: string;
      isActive: boolean;
      failedLoginAttempts: number | null;
      lockedUntil: Date | null;
      ipWhitelistEnabled: boolean;
      twoFactorEnabled: boolean;
      twoFactorSecret: string | null;
    } | null = await this.prisma.gatewayAdmin.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        ipWhitelistEnabled: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    }) as {
      id: string;
      email: string;
      passwordHash: string;
      role: string;
      isActive: boolean;
      failedLoginAttempts: number | null;
      lockedUntil: Date | null;
      ipWhitelistEnabled: boolean;
      twoFactorEnabled: boolean;
      twoFactorSecret: string | null;
    } | null;

    if (!admin) {
      // Don't reveal if admin exists
      this.metricsService?.recordLoginAttempt('failure');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        resourceType: string;
        details: { reason: string; success: boolean };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId: admin.id,
        action: 'login_failed',
        resourceType: 'admin',
        details: {
          reason: 'Account disabled',
          success: false,
        },
      };
      if (ipAddress) {
        auditData.ipAddress = ipAddress;
      }
      if (userAgent) {
        auditData.userAgent = userAgent;
      }
      await this.prisma.gatewayAuditLog.create({
        data: auditData,
      });
      throw new UnauthorizedException('Admin account is disabled');
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutesLeft: number = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        resourceType: string;
        details: { reason: string; success: boolean; minutesLeft: number };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId: admin.id,
        action: 'login_failed',
        resourceType: 'admin',
        details: {
          reason: 'Account locked',
          success: false,
          minutesLeft,
        },
      };
      if (ipAddress) {
        auditData.ipAddress = ipAddress;
      }
      if (userAgent) {
        auditData.userAgent = userAgent;
      }
      await this.prisma.gatewayAuditLog.create({
        data: auditData,
      });
      throw new UnauthorizedException(`Account is locked. Try again in ${minutesLeft} minute(s)`);
    }

    // Check IP whitelist for super_admin
    if (admin.role === 'super_admin' && ipAddress) {
      const isIpAllowed: boolean = await this.ipWhitelistService.isIpAllowed(admin.id, ipAddress);
      if (!isIpAllowed) {
        // Log suspicious attempt
        const auditData: {
          adminId: string;
          action: string;
          resourceType: string;
          details: { reason: string };
          ipAddress?: string;
          userAgent?: string;
        } = {
          adminId: admin.id,
          action: 'login_blocked_ip',
          resourceType: 'admin',
          details: { reason: 'IP not in whitelist' },
        };
        if (ipAddress) {
          auditData.ipAddress = ipAddress;
        }
        if (userAgent) {
          auditData.userAgent = userAgent;
        }
        await this.prisma.gatewayAuditLog.create({
          data: auditData,
        });
        this.logger.warn(`Login blocked for super_admin ${admin.email} from IP ${ipAddress} (not in whitelist)`);
        this.structuredLogger?.logSecurityEvent(
          'ip_whitelist_blocked',
          `Login blocked for super_admin ${admin.email} from IP ${ipAddress}`,
          {
            adminId: admin.id,
            email: admin.email,
            role: admin.role,
            ...(ipAddress && { ipAddress }),
            ...(userAgent && { userAgent }),
            action: 'login_blocked',
            resourceType: 'admin',
          },
        );
        throw new UnauthorizedException('Access denied from this IP address');
      }
    }

    // Verify password
    const isValid: boolean = await bcrypt.compare(dto.password, admin.passwordHash);

    if (!isValid) {
      const loginDuration: number = (Date.now() - loginStartTime) / 1000;
      this.metricsService?.recordOperationDuration('login', loginDuration);
      this.metricsService?.recordLoginAttempt('failure', admin.role);
      // Increment failed login attempts
      const failedAttempts: number = (admin.failedLoginAttempts || 0) + 1;
      const MAX_ATTEMPTS: number = 5;
      const LOCK_DURATION_MINUTES: number = 15;

      const updateData: {
        failedLoginAttempts: number;
        lockedUntil?: Date;
      } = {
        failedLoginAttempts: failedAttempts,
      };

      // Lock account after MAX_ATTEMPTS failed attempts
      if (failedAttempts >= MAX_ATTEMPTS) {
        const lockedUntil: Date = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCK_DURATION_MINUTES);
        updateData.lockedUntil = lockedUntil;
        this.logger.warn(`Admin account locked: ${dto.email} after ${failedAttempts} failed attempts`);
        this.structuredLogger?.logSecurityEvent(
          'account_locked',
          `Admin account locked: ${dto.email} after ${failedAttempts} failed attempts`,
          {
            email: dto.email,
            failedAttempts,
            ...(ipAddress && { ipAddress }),
            ...(userAgent && { userAgent }),
            action: 'account_locked',
            resourceType: 'admin',
          },
        );
        this.metricsService?.recordSecurityEvent('account_locked');
        this.metricsService?.recordSecurityEvent('account_locked');
      }

      await this.prisma.gatewayAdmin.update({
        where: { id: admin.id },
        data: updateData,
      });

      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        resourceType: string;
        details: { attempts: number; reason: string; success: boolean };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId: admin.id,
        action: 'login_failed',
        resourceType: 'admin',
        details: {
          attempts: failedAttempts,
          reason: 'Invalid password',
          success: false,
        },
      };
      if (ipAddress) {
        auditData.ipAddress = ipAddress;
      }
      if (userAgent) {
        auditData.userAgent = userAgent;
      }
      await this.prisma.gatewayAuditLog.create({
        data: auditData,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled - if so, return requires2FA flag instead of tokens
    if (admin.twoFactorEnabled && this.admin2FAService) {
      // Reset failed attempts on successful password verification
      if ((admin.failedLoginAttempts ?? 0) > 0 || admin.lockedUntil) {
        await this.prisma.gatewayAdmin.update({
          where: { id: admin.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });
      }

      // Return temporary token that requires 2FA verification
      const tempToken: AdminTokensResponse = await this.adminJwtService.generateTokens(admin.id, admin.email, admin.role);

      // Type assertion needed for extended response type
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        ...tempToken,
        requires2FA: true,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
      } as AdminTokensResponse & { admin: { id: string; email: string; role: string }; requires2FA: boolean };
    }

    // Reset failed attempts on successful login
    if ((admin.failedLoginAttempts ?? 0) > 0 || admin.lockedUntil) {
      await this.prisma.gatewayAdmin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Generate tokens
    const tokens: AdminTokensResponse = await this.adminJwtService.generateTokens(admin.id, admin.email, admin.role);

    // Create session
    const tokenHash: string = await bcrypt.hash(tokens.accessToken, 10);
    const refreshTokenHash: string = await bcrypt.hash(tokens.refreshToken, 10);

    const expiresAt: Date = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes

    const sessionData: {
      adminId: string;
      tokenHash: string;
      refreshTokenHash: string;
      expiresAt: Date;
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId: admin.id,
      tokenHash,
      refreshTokenHash,
      expiresAt,
    };
    if (ipAddress) {
      sessionData.ipAddress = ipAddress;
    }
    if (userAgent) {
      sessionData.userAgent = userAgent;
    }
    await this.prisma.gatewayAdminSession.create({
      data: sessionData,
    });

    // Update last login
    await this.prisma.gatewayAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    const auditData: {
      adminId: string;
      action: string;
      resourceType: string;
      details: { success: boolean; method?: string };
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId: admin.id,
      action: 'login',
      resourceType: 'admin',
      details: {
        success: true,
        method: admin.twoFactorEnabled ? '2FA' : 'password',
      },
    };
    if (ipAddress) {
      auditData.ipAddress = ipAddress;
    }
    if (userAgent) {
      auditData.userAgent = userAgent;
    }
    await this.prisma.gatewayAuditLog.create({
      data: auditData,
    });

    const loginDuration: number = (Date.now() - loginStartTime) / 1000;
    this.metricsService?.recordOperationDuration('login', loginDuration);
    this.metricsService?.recordLoginAttempt('success', admin.role);
    this.logger.log(`Admin logged in: ${admin.email}`);
    this.structuredLogger?.logAdminActivity(
      'admin_login',
      `Admin logged in: ${admin.email}`,
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent }),
        action: 'admin_login',
        resourceType: 'admin',
      },
    );

    // Notify about new IP login if applicable
    if (this.notificationService && ipAddress) {
      await this.notificationService.notifyNewIpLogin(admin.id, admin.email, ipAddress, userAgent);
    }

    return {
      ...tokens,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Verify admin token and get admin info
   * Also checks if session exists and is valid
   * Also checks Redis blacklist if available
   * Uses Redis cache for performance (5 min TTL)
   */
  async verifyAdmin(token: string): Promise<{ id: string; email: string; role: string } | null> {
    // Check Redis cache first if available
    if (this.tokenCacheService) {
      const cached: { id: string; email: string; role: string } | null = await this.tokenCacheService.getCachedVerifyResult(token);
      if (cached) {
        this.logger.debug(`Token verified from cache: ${cached.email}`);
        return cached;
      }
    }

    // Check Redis blacklist if available
    if (this.tokenCacheService) {
      const isBlacklisted: boolean = await this.tokenCacheService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        this.logger.warn(`Token is blacklisted in Redis: ${token.substring(0, 20)}...`);
        return null;
      }
    }

    const payload: { adminId: string; email: string; role: string } | null = await this.adminJwtService.verifyToken(token);
    if (!payload) {
      return null;
    }

    // Optimized: Get admin with active sessions in one query
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const admin: {
      id: string;
      email: string;
      role: string;
      isActive: boolean;
      lockedUntil: Date | null;
      sessions: Array<{ id: string; tokenHash: string }>;
    } | null = await this.prisma.gatewayAdmin.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lockedUntil: true,
        sessions: {
          where: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expiresAt: { gt: new Date() } as any,
          },
          select: {
            id: true,
            tokenHash: true,
          },
        },
      },
    }) as {
      id: string;
      email: string;
      role: string;
      isActive: boolean;
      lockedUntil: Date | null;
      sessions: Array<{ id: string; tokenHash: string }>;
    } | null;

    if (!admin || !admin.isActive) {
      return null;
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return null;
    }

    // Verify session exists and is valid
    // Use the sessions already loaded from the query above
    const activeSessions: Array<{ id: string; tokenHash: string }> = admin.sessions;

    // Check if any session matches the token
    let foundSession: boolean = false;
    for (const session of activeSessions) {
      try {
        if (await bcrypt.compare(token, session.tokenHash)) {
          foundSession = true;
          break;
        }
      } catch {
        // Continue checking other sessions
      }
    }

    if (!foundSession) {
      this.logger.warn(`No valid session found for admin ${admin.id}`);
      return null;
    }

    const adminInfo: { id: string; email: string; role: string } = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    // Cache the result for 5 minutes
    if (this.tokenCacheService) {
      await this.tokenCacheService.cacheVerifyResult(token, adminInfo);
    }

    return adminInfo;
  }

  /**
   * Logout admin (invalidate session)
   */
  async logout(token: string, adminId: string): Promise<void> {
    // Revoke token in Redis if available
    if (this.tokenCacheService) {
      const payload: { adminId: string; email: string; role: string } | null = await this.adminJwtService.decodeToken(token);
      if (payload) {
        const expiresIn: number = 30 * 60; // 30 minutes
        await this.tokenCacheService.revokeAccessToken(token, expiresIn);
        // Invalidate verify cache
        await this.tokenCacheService.invalidateVerifyCache(token);
      }
    }

    // Find and delete session (optimized: only select needed fields)
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const sessions: Array<{ id: string; tokenHash: string }> = await this.prisma.gatewayAdminSession.findMany({
      where: { adminId },
      select: {
        id: true,
        tokenHash: true,
      },
    }) as Array<{ id: string; tokenHash: string }>;

    // Find session by token hash
    for (const session of sessions) {
      const isValid: boolean = await bcrypt.compare(token, session.tokenHash);
      if (isValid) {
        await this.prisma.gatewayAdminSession.delete({
          where: { id: session.id },
        });
        break;
      }
    }

    // Log audit
    await this.prisma.gatewayAuditLog.create({
      data: {
        adminId,
        action: 'logout',
        resourceType: 'admin',
      },
    });

    this.logger.log(`Admin logged out: ${adminId}`);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AdminTokensResponse> {
    const payload: { adminId: string; email: string; role: string } | null = await this.adminJwtService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const admin: { id: string; email: string; role: string; isActive: boolean } | null = await this.prisma.gatewayAdmin.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    }) as { id: string; email: string; role: string; isActive: boolean } | null;

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin not found or inactive');
    }

    // Generate new tokens
    return await this.adminJwtService.generateTokens(admin.id, admin.email, admin.role);
  }

  /**
   * Change admin password
   * Requires current password verification
   * Invalidates all sessions except current one
   */
  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
    currentToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // Find admin (optimized: only select needed fields)
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const admin: { id: string; email: string; passwordHash: string; isActive: boolean } | null = await this.prisma.gatewayAdmin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    }) as { id: string; email: string; passwordHash: string; isActive: boolean } | null;

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is disabled');
    }

    // Verify current password
    const isCurrentPasswordValid: boolean = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentPasswordValid) {
      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        resourceType: string;
        details: { reason: string };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId,
        action: 'change_password_failed',
        resourceType: 'admin',
        details: { reason: 'Invalid current password' },
      };
      if (ipAddress) {
        auditData.ipAddress = ipAddress;
      }
      if (userAgent) {
        auditData.userAgent = userAgent;
      }
      await this.prisma.gatewayAuditLog.create({
        data: auditData,
      });
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password length
    if (newPassword.length < 12) {
      throw new BadRequestException('New password must be at least 12 characters long');
    }

    // Check if new password is same as current
    const isSamePassword: boolean = await bcrypt.compare(newPassword, admin.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const newPasswordHash: string = await bcrypt.hash(newPassword, 12);

    // Find current session to keep it active (optimized: only select needed fields)
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const sessions: Array<{ id: string; tokenHash: string }> = await this.prisma.gatewayAdminSession.findMany({
      where: { adminId },
      select: {
        id: true,
        tokenHash: true,
      },
    }) as Array<{ id: string; tokenHash: string }>;

    let currentSessionId: string | null = null;
    for (const session of sessions) {
      try {
        if (await bcrypt.compare(currentToken, session.tokenHash)) {
          currentSessionId = session.id;
          break;
        }
      } catch {
        // Continue checking other sessions
      }
    }

    // Update password
    await this.prisma.gatewayAdmin.update({
      where: { id: adminId },
      data: {
        passwordHash: newPasswordHash,
        failedLoginAttempts: 0, // Reset failed attempts
        lockedUntil: null,
      },
    });

    // Delete all sessions except current one
    if (currentSessionId) {
      await this.prisma.gatewayAdminSession.deleteMany({
        where: {
          adminId,
          id: { not: currentSessionId },
        },
      });
    } else {
      // If current session not found, delete all sessions
      await this.prisma.gatewayAdminSession.deleteMany({
        where: { adminId },
      });
    }

    // Revoke all tokens in Redis except current (if available)
    if (this.tokenCacheService) {
      // Note: We can't easily identify current token in Redis without storing mapping
      // So we revoke all and let user re-login if needed
      // In production, you might want to maintain a token-to-admin mapping
      await this.tokenCacheService.revokeAllTokensForAdmin(adminId);
      // Invalidate verify cache for current token
      await this.tokenCacheService.invalidateVerifyCache(currentToken);
    }

    // Log audit
    const auditData: {
      adminId: string;
      action: string;
      resourceType: string;
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId,
      action: 'password_changed',
      resourceType: 'admin',
    };
    if (ipAddress) {
      auditData.ipAddress = ipAddress;
    }
    if (userAgent) {
      auditData.userAgent = userAgent;
    }
    await this.prisma.gatewayAuditLog.create({
      data: auditData,
    });

    this.logger.log(`Password changed for admin: ${admin.email}`);

    return {
      message: 'Password changed successfully. All other sessions have been invalidated.',
    };
  }

  /**
   * Get all active sessions for admin
   */
  async getSessions(adminId: string, currentToken: string): Promise<{
    sessions: Array<{
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      expiresAt: Date;
      isCurrent: boolean;
    }>;
    total: number;
    currentSessionId: string | null;
  }> {
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const sessions: Array<{
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      expiresAt: Date;
      tokenHash: string;
    }> = await this.prisma.gatewayAdminSession.findMany({
      where: {
        adminId,
        expiresAt: { gt: new Date() }, // Only active sessions
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
        tokenHash: true,
      },
      orderBy: { createdAt: 'desc' },
    }) as Array<{
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      expiresAt: Date;
      tokenHash: string;
    }>;

    // Find current session
    let currentSessionId: string | null = null;
    for (const session of sessions) {
      try {
        if (await bcrypt.compare(currentToken, session.tokenHash)) {
          currentSessionId = session.id;
          break;
        }
      } catch {
        // Continue checking other sessions
      }
    }

    const sessionsWithCurrent: Array<{
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      expiresAt: Date;
      isCurrent: boolean;
    }> = sessions.map((session: {
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      expiresAt: Date;
      tokenHash: string;
    }): {
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      expiresAt: Date;
      isCurrent: boolean;
    } => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.id === currentSessionId,
    }));

    return {
      sessions: sessionsWithCurrent,
      total: sessionsWithCurrent.length,
      currentSessionId,
    };
  }

  /**
   * Revoke specific session
   */
  async revokeSession(adminId: string, sessionId: string, currentToken: string): Promise<void> {
    // Find session
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const session: { id: string; tokenHash: string; ipAddress: string | null } | null = await this.prisma.gatewayAdminSession.findFirst({
      where: {
        id: sessionId,
        adminId,
      },
    }) as { id: string; tokenHash: string; ipAddress: string | null } | null;

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if trying to revoke current session
    try {
      const isCurrentSession: boolean = await bcrypt.compare(currentToken, session.tokenHash);
      if (isCurrentSession) {
        throw new BadRequestException('Cannot revoke current session. Use logout instead.');
      }
    } catch {
      // Not current session, continue
    }

    // Delete session
    await this.prisma.gatewayAdminSession.delete({
      where: { id: sessionId },
    });

    // Revoke token in Redis if available
    if (this.tokenCacheService) {
      // We need to find the token hash to revoke it
      // For now, we'll rely on session deletion
      // In production, you might want to maintain a session-to-token mapping
    }

    // Log audit
    const auditData: {
      adminId: string;
      action: string;
      resourceType: string;
      resourceId: string;
      details: { sessionId: string; ipAddress: string | null };
    } = {
      adminId,
      action: 'session_revoked',
      resourceType: 'session',
      resourceId: sessionId,
      details: {
        sessionId,
        ipAddress: session.ipAddress,
      },
    };
    await this.prisma.gatewayAuditLog.create({
      data: auditData,
    });

    this.logger.log(`Session revoked: ${sessionId} for admin: ${adminId}`);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(adminId: string, currentToken: string): Promise<{ revokedCount: number }> {
    // Find current session (optimized: only select needed fields)
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const sessions: Array<{ id: string; tokenHash: string }> = await this.prisma.gatewayAdminSession.findMany({
      where: { adminId },
      select: {
        id: true,
        tokenHash: true,
      },
    }) as Array<{ id: string; tokenHash: string }>;

    let currentSessionId: string | null = null;
    for (const session of sessions) {
      try {
        if (await bcrypt.compare(currentToken, session.tokenHash)) {
          currentSessionId = session.id;
          break;
        }
      } catch {
        // Continue checking other sessions
      }
    }

    // Delete all sessions except current
    const deleteResult: { count: number } = await this.prisma.gatewayAdminSession.deleteMany({
      where: {
        adminId,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
      },
    });

    // Revoke all tokens in Redis if available
    if (this.tokenCacheService) {
      await this.tokenCacheService.revokeAllTokensForAdmin(adminId);
    }

    // Log audit
    const auditData: {
      adminId: string;
      action: string;
      resourceType: string;
      details: { revokedCount: number; currentSessionId: string | null };
    } = {
      adminId,
      action: 'all_sessions_revoked',
      resourceType: 'session',
      details: {
        revokedCount: deleteResult.count,
        currentSessionId,
      },
    };
    await this.prisma.gatewayAuditLog.create({
      data: auditData,
    });

    this.logger.log(`All sessions revoked (except current) for admin: ${adminId}. Count: ${deleteResult.count}`);

    return { revokedCount: deleteResult.count };
  }

  /**
   * Get login history for admin
   * Supports filtering by date, IP, success status, and pagination
   */
  async getLoginHistory(
    adminId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      ipAddress?: string;
      success?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    entries: Array<{
      id: string;
      action: string;
      success: boolean;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page: number = filters.page || 1;
    const limit: number = filters.limit || 20;
    const skip: number = (page - 1) * limit;

    // Build where clause
    const where: {
      adminId: string;
      action: { in: string[] };
      createdAt?: { gte?: Date; lte?: Date };
      ipAddress?: string;
    } = {
      adminId,
      action: { in: ['login', 'login_failed', 'login_blocked_ip', 'login_2fa_success'] },
    };

    if (filters.startDate) {
      where.createdAt = { ...where.createdAt, gte: filters.startDate };
    }
    if (filters.endDate) {
      where.createdAt = { ...where.createdAt, lte: filters.endDate };
    }
    if (filters.ipAddress) {
      where.ipAddress = filters.ipAddress;
    }

    // Get total count
    const total: number = await this.prisma.gatewayAuditLog.count({ where });

    // Get entries
    // Type assertion needed because Prisma returns unknown
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const logs: Array<{
      id: string;
      action: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    }> = await this.prisma.gatewayAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        details: true,
      },
    }) as Array<{
      id: string;
      action: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    }>;

    // Map to response format
    // Type assertion needed for filtered array
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const entries: Array<{
      id: string;
      action: string;
      success: boolean;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    }> = logs.map((log: {
      id: string;
      action: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    }): {
      id: string;
      action: string;
      success: boolean;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    } | null => {
      // Type assertion needed for details
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const details: Record<string, unknown> | null = log.details as Record<string, unknown> | null;
      const success: boolean = details?.success === true || log.action === 'login' || log.action === 'login_2fa_success';

      // Filter by success if specified
      if (filters.success !== undefined && success !== filters.success) {
        return null;
      }

      return {
        id: log.id,
        action: log.action,
        success,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        details,
      };
    }).filter((entry: {
      id: string;
      action: string;
      success: boolean;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    } | null): entry is {
      id: string;
      action: string;
      success: boolean;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      details: Record<string, unknown> | null;
    } => entry !== null);

    const totalPages: number = Math.ceil(total / limit);

    return {
      entries,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
