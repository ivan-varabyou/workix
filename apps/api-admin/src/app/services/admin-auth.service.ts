import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, Optional,UnauthorizedException } from '@nestjs/common';
import { AdminIpWhitelistService, AdminJwtService, AdminTokenCacheService,AdminTokensResponse } from '@workix/backend/domain/admin';
import * as bcrypt from 'bcrypt';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';
import { Admin2FAService } from './admin-2fa.service';
import { AdminNotificationService } from './admin-notification.service';

export interface AdminRegisterDto {
  email: string;
  password: string;
  name?: string;
  role?: string; // Only super_admin can create other admins
}

export interface AdminLoginDto {
  email: string;
  password: string;
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
    @Inject('PrismaService') private prisma: AdminPrismaService,
    private adminJwtService: AdminJwtService,
    private ipWhitelistService: AdminIpWhitelistService,
    @Optional() private admin2FAService?: Admin2FAService,
    @Optional() private tokenCacheService?: AdminTokenCacheService,
    @Optional() private notificationService?: AdminNotificationService,
  ) {}

  /**
   * Register new admin (only for super_admin)
   */
  async register(dto: AdminRegisterDto, createdBy?: string): Promise<{ id: string; email: string; role: string }> {
    // Check if admin with email already exists
    const existing = await this.prisma.admin.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
      },
    });

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
    const admin = await this.prisma.admin.create({
      data: createData,
    });

    // Log audit
    if (createdBy) {
      await this.prisma.auditLog.create({
        data: {
          adminId: createdBy,
          action: 'create',
          entityType: 'admin',
          
          resourceId: admin.id,
          metadata: { email: dto.email, role: dto.role || 'admin' },
        },
      });
    }

    this.logger.log(`Admin registered: ${dto.email}`);

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
    // Find admin
    const admin = await this.prisma.admin.findUnique({
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
    });

    if (!admin) {
      // Don't reveal if admin exists
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        entityType: string;
        metadata: { reason: string; success: boolean };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId: admin.id,
        action: 'login_failed',
        entityType: 'admin',
        metadata: {
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
      await this.prisma.auditLog.create({
        data: auditData,
      });
      throw new UnauthorizedException('Admin account is disabled');
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        entityType: string;
        metadata: { reason: string; success: boolean; minutesLeft: number };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId: admin.id,
        action: 'login_failed',
        entityType: 'admin',
        metadata: {
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
      await this.prisma.auditLog.create({
        data: auditData,
      });
      throw new UnauthorizedException(`Account is locked. Try again in ${minutesLeft} minute(s)`);
    }

    // Check IP whitelist for super_admin
    if (admin.role === 'super_admin' && ipAddress) {
      const isIpAllowed = await this.ipWhitelistService.isIpAllowed(admin.id, ipAddress);
      if (!isIpAllowed) {
        // Log suspicious attempt
        const auditData: {
          adminId: string;
          action: string;
          entityType: string;
          resourceType?: string;
          metadata: { reason: string };
          ipAddress?: string;
          userAgent?: string;
        } = {
          adminId: admin.id,
          action: 'login_blocked_ip',
          entityType: 'admin',
          metadata: { reason: 'IP not in whitelist' },
        };
        if (ipAddress) {
          auditData.ipAddress = ipAddress;
        }
        if (userAgent) {
          auditData.userAgent = userAgent;
        }
        await this.prisma.auditLog.create({
          data: auditData,
        });
        this.logger.warn(`Login blocked for super_admin ${admin.email} from IP ${ipAddress} (not in whitelist)`);
        throw new UnauthorizedException('Access denied from this IP address');
      }
    }

    // Verify password
    const isValid = await bcrypt.compare(dto.password, admin.passwordHash);

    if (!isValid) {
      // Increment failed login attempts
      const failedAttempts = (admin.failedLoginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;
      const LOCK_DURATION_MINUTES = 15;

      const updateData: {
        failedLoginAttempts: number;
        lockedUntil?: Date;
      } = {
        failedLoginAttempts: failedAttempts,
      };

      // Lock account after MAX_ATTEMPTS failed attempts
      if (failedAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCK_DURATION_MINUTES);
        updateData.lockedUntil = lockedUntil;
        this.logger.warn(`Admin account locked: ${dto.email} after ${failedAttempts} failed attempts`);
      }

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        entityType: string;
        metadata: { attempts: number; reason: string; success: boolean };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId: admin.id,
        action: 'login_failed',
        entityType: 'admin',
          
        metadata: {
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
      await this.prisma.auditLog.create({
        data: auditData,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled - if so, return requires2FA flag instead of tokens
    if (admin.twoFactorEnabled && this.admin2FAService) {
      // Reset failed attempts on successful password verification
      if (admin.failedLoginAttempts > 0 || admin.lockedUntil) {
        await this.prisma.admin.update({
          where: { id: admin.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });
      }

      // Return temporary token that requires 2FA verification
      const tempToken = await this.adminJwtService.generateTokens(admin.id, admin.email, admin.role);

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
    if (admin.failedLoginAttempts > 0 || admin.lockedUntil) {
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Generate tokens
    const tokens = await this.adminJwtService.generateTokens(admin.id, admin.email, admin.role);

    // Create session
    const tokenHash = await bcrypt.hash(tokens.accessToken, 10);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    const expiresAt = new Date();
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
    await this.prisma.adminSession.create({
      data: sessionData,
    });

    // Update last login
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    const auditData: {
      adminId: string;
      action: string;
      entityType: string;
      resourceType?: string;
      metadata: { success: boolean; method?: string };
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId: admin.id,
      action: 'login',
      entityType: 'admin',
      
      metadata: {
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
    await this.prisma.auditLog.create({
      data: auditData,
    });

    this.logger.log(`Admin logged in: ${admin.email}`);

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
      const cached = await this.tokenCacheService.getCachedVerifyResult(token);
      if (cached) {
        this.logger.debug(`Token verified from cache: ${cached.email}`);
        return cached;
      }
    }

    // Check Redis blacklist if available
    if (this.tokenCacheService) {
      const isBlacklisted = await this.tokenCacheService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        this.logger.warn(`Token is blacklisted in Redis: ${token.substring(0, 20)}...`);
        return null;
      }
    }

    const payload = await this.adminJwtService.verifyToken(token);
    if (!payload) {
      return null;
    }

    // Optimized: Get admin with active sessions in one query
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lockedUntil: true,
        sessions: {
          where: {
            expiresAt: { gt: new Date() },
          },
          select: {
            id: true,
            tokenHash: true,
          },
        },
      },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return null;
    }

    // Verify session exists and is valid
    // Use the sessions already loaded from the query above
    const activeSessions = admin.sessions;

    // Check if any session matches the token
    let foundSession = false;
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

    const adminInfo = {
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
      const payload = await this.adminJwtService.decodeToken(token);
      if (payload) {
        const expiresIn = 30 * 60; // 30 minutes
        await this.tokenCacheService.revokeAccessToken(token, expiresIn);
        // Invalidate verify cache
        await this.tokenCacheService.invalidateVerifyCache(token);
      }
    }

    // Find and delete session (optimized: only select needed fields)
    const sessions = await this.prisma.adminSession.findMany({
      where: { adminId },
      select: {
        id: true,
        tokenHash: true,
      },
    });

    // Find session by token hash
    for (const session of sessions) {
      const isValid = await bcrypt.compare(token, session.tokenHash);
      if (isValid) {
        await this.prisma.adminSession.delete({
          where: { id: session.id },
        });
        break;
      }
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'logout',
        entityType: 'admin',
          
      },
    });

    this.logger.log(`Admin logged out: ${adminId}`);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AdminTokensResponse> {
    const payload = await this.adminJwtService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

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
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is disabled');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentPasswordValid) {
      // Log failed attempt
      const auditData: {
        adminId: string;
        action: string;
        entityType: string;
        resourceType?: string;
        metadata: { reason: string };
        ipAddress?: string;
        userAgent?: string;
      } = {
        adminId,
        action: 'change_password_failed',
        entityType: 'admin',
        
        metadata: { reason: 'Invalid current password' },
      };
      if (ipAddress) {
        auditData.ipAddress = ipAddress;
      }
      if (userAgent) {
        auditData.userAgent = userAgent;
      }
      await this.prisma.auditLog.create({
        data: auditData,
      });
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password length
    if (newPassword.length < 12) {
      throw new BadRequestException('New password must be at least 12 characters long');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, admin.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Find current session to keep it active (optimized: only select needed fields)
    const sessions = await this.prisma.adminSession.findMany({
      where: { adminId },
      select: {
        id: true,
        tokenHash: true,
      },
    });

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
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        passwordHash: newPasswordHash,
        failedLoginAttempts: 0, // Reset failed attempts
        lockedUntil: null,
      },
    });

    // Delete all sessions except current one
    if (currentSessionId) {
      await this.prisma.adminSession.deleteMany({
        where: {
          adminId,
          id: { not: currentSessionId },
        },
      });
    } else {
      // If current session not found, delete all sessions
      await this.prisma.adminSession.deleteMany({
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
      entityType: string;
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId,
      action: 'password_changed',
      entityType: 'admin',
    };
    if (ipAddress) {
      auditData.ipAddress = ipAddress;
    }
    if (userAgent) {
      auditData.userAgent = userAgent;
    }
    await this.prisma.auditLog.create({
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
    const sessions = await this.prisma.adminSession.findMany({
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
    });

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

    const sessionsWithCurrent = sessions.map((session: { id: string; ipAddress: string | null; userAgent: string | null; createdAt: Date; expiresAt: Date }) => ({
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
    const session = await this.prisma.adminSession.findFirst({
      where: {
        id: sessionId,
        adminId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if trying to revoke current session
    try {
      const isCurrentSession = await bcrypt.compare(currentToken, session.tokenHash);
      if (isCurrentSession) {
        throw new BadRequestException('Cannot revoke current session. Use logout instead.');
      }
    } catch {
      // Not current session, continue
    }

    // Delete session
    await this.prisma.adminSession.delete({
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
      entityType: string;
      resourceId: string;
      metadata: { sessionId: string; ipAddress: string | null };
    } = {
      adminId,
      action: 'session_revoked',
      entityType: 'session',
      resourceId: sessionId,
      metadata: {
        sessionId,
        ipAddress: session.ipAddress,
      },
    };
    await this.prisma.auditLog.create({
      data: auditData,
    });

    this.logger.log(`Session revoked: ${sessionId} for admin: ${adminId}`);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(adminId: string, currentToken: string): Promise<{ revokedCount: number }> {
    // Find current session (optimized: only select needed fields)
    const sessions = await this.prisma.adminSession.findMany({
      where: { adminId },
      select: {
        id: true,
        tokenHash: true,
      },
    });

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
    const deleteResult = await this.prisma.adminSession.deleteMany({
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
      entityType: string;
      metadata: { revokedCount: number; currentSessionId: string | null };
    } = {
      adminId,
      action: 'all_sessions_revoked',
      entityType: 'session',
      metadata: {
        revokedCount: deleteResult.count,
        currentSessionId,
      },
    };
    await this.prisma.auditLog.create({
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
      metadata: Record<string, unknown> | null;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

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
    const total = await this.prisma.auditLog.count({ where });

    // Get entries
    const logs = await this.prisma.auditLog.findMany({
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
        metadata: true,
      },
    });

    // Map to response format
    const entries = logs.map((log: { id: string; action: string; metadata: unknown; ipAddress: string | null; userAgent: string | null; createdAt: Date }) => {
      const details = log.metadata as Record<string, unknown> | null;
      const success = details?.success === true || log.action === 'login' || log.action === 'login_2fa_success';

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
        metadata: log.metadata,
      };
    }).filter((entry: { id: string; action: string; success: boolean; ipAddress: string | null; userAgent: string | null; createdAt: Date; metadata: unknown } | null) => entry !== null) as Array<{
      id: string;
      action: string;
      success: boolean;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      metadata: Record<string, unknown> | null;
    }>;

    const totalPages = Math.ceil(total / limit);

    return {
      entries,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
