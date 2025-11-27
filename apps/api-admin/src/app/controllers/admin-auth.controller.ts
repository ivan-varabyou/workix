import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Inject, Optional,Param, Post, Query, Req, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery,ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ADMIN_ROLES_KEY,
  AdminAuthService,
  AdminHealthCheckResponseDto,
  AdminIpWhitelistService,
  AdminJwtGuard,
  AdminLoginDto,
  AdminRefreshTokenDto,
  AdminRegisterDto,
  AdminRequest,
  AdminRoleGuard,
  AdminTokensResponse,
  ChangePasswordDto,
  ChangePasswordResponseDto,
  Enable2FADto,
  Enable2FAResponseDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  Generate2FASecretResponseDto,
  Get2FAStatusResponseDto,
  GetLoginHistoryQueryDto,
  GetLoginHistoryResponseDto,
  GetSessionsResponseDto,
  RegenerateBackupCodesResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  RevokeSessionResponseDto,
  Verify2FADto,
  Verify2FAResponseDto,
  VerifyResetTokenDto,
  VerifyResetTokenResponseDto,
} from '@workix/backend/domain/admin';
import type { Cache } from 'cache-manager';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';
import { Admin2FAService } from '../services/admin-2fa.service';
import { AdminAuth2FAService } from '../services/admin-auth-2fa.service';
import { AdminPasswordResetService } from '../services/admin-password-reset.service';

/**
 * Admin Auth Controller
 * Handles admin authentication and registration
 */
@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private adminAuthService: AdminAuthService,
    private adminAuth2FAService: AdminAuth2FAService,
    private admin2FAService: Admin2FAService,
    private adminPasswordResetService: AdminPasswordResetService,
    private ipWhitelistService: AdminIpWhitelistService,
    @Inject('PrismaService') private prisma: AdminPrismaService,
    private configService: ConfigService,
    @Optional() @Inject(CACHE_MANAGER) private cacheManager?: Cache,
  ) {}

  /**
   * Register new admin (only for super_admin)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminJwtGuard, AdminRoleGuard)
  @SetMetadata(ADMIN_ROLES_KEY, ['super_admin'])
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Register new admin', description: 'Creates a new admin account. Only super_admin can create other admins.' })
  @ApiBody({ type: AdminRegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Admin registered successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'admin_123' },
        email: { type: 'string', example: 'admin@workix.com' },
        role: { type: 'string', example: 'admin' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Only super_admin can create admins' })
  @ApiResponse({ status: 409, description: 'Admin with this email already exists' })
  async register(@Body() dto: AdminRegisterDto, @Request() req: { admin?: { id?: string } }): Promise<{ id: string; email: string; role: string }> {
    const adminId: string | undefined = req.admin?.id;
    return await this.adminAuthService.register(dto, adminId);
  }

  /**
   * Login admin
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Login admin', description: 'Authenticates admin and returns JWT tokens' })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        expiresIn: { type: 'number', example: 1800 },
        admin: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'admin_123' },
            email: { type: 'string', example: 'admin@workix.com' },
            role: { type: 'string', example: 'admin' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async login(
    @Body() dto: AdminLoginDto,
    @Req() req: AdminRequest
  ): Promise<AdminTokensResponse & { admin: { id: string; email: string; role: string } }> {
    // Extract IP address using type-safe approach
    const ipAddress: string = this.extractIpAddress(req);
    const userAgent: string | string[] | undefined = req.headers['user-agent'];
    let userAgentString: string = 'unknown';
    if (typeof userAgent === 'string') {
      userAgentString = userAgent;
    } else if (userAgent !== undefined && userAgent !== null && Array.isArray(userAgent)) {
      // Type guard: check if array has elements and first element is string
      const firstElementDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(userAgent, '0');
      if (firstElementDescriptor && 'value' in firstElementDescriptor) {
        const firstElement: unknown = firstElementDescriptor.value;
        if (typeof firstElement === 'string') {
          userAgentString = firstElement;
        }
      }
    }
    return await this.adminAuthService.login(dto, ipAddress, userAgentString);
  }

  /**
   * Extract IP address from request (type-safe)
   */
  private extractIpAddress(req: AdminRequest): string {
    // Check Express request properties
    if ('ip' in req && typeof req.ip === 'string' && req.ip) {
      return req.ip;
    }
    // Check x-forwarded-for header
    const forwardedFor: string | string[] | undefined = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor) {
      const firstIp: string | undefined = forwardedFor.split(',')[0];
      if (firstIp && typeof firstIp === 'string') {
        return firstIp.trim();
      }
    }
    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      const firstElement: string | undefined = forwardedFor[0];
      if (typeof firstElement === 'string' && firstElement) {
        const firstIp: string | undefined = firstElement.split(',')[0];
        if (firstIp && typeof firstIp === 'string') {
          return firstIp.trim();
        }
      }
    }
    // Check socket remote address
    if ('socket' in req && req.socket && 'remoteAddress' in req.socket) {
      const remoteAddress: string | undefined = req.socket.remoteAddress;
      if (typeof remoteAddress === 'string' && remoteAddress) {
        return remoteAddress;
      }
    }
    return 'unknown';
  }

  /**
   * Get current admin
   */
  @Get('me')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get current admin', description: 'Returns information about the authenticated admin' })
  @ApiResponse({
    status: 200,
    description: 'Admin data',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'admin_123' },
        email: { type: 'string', example: 'admin@workix.com' },
        role: { type: 'string', example: 'admin' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req: { admin?: unknown }): Promise<unknown> {
    return req.admin;
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token', description: 'Generates new access token using refresh token' })
  @ApiBody({ type: AdminRefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        expiresIn: { type: 'number', example: 1800 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: AdminRefreshTokenDto): Promise<unknown> {
    return await this.adminAuthService.refreshToken(dto.refreshToken);
  }

  /**
   * Generate 2FA secret and QR code
   */
  @Post('2fa/generate')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Generate 2FA secret and QR code', description: 'Generates a TOTP secret and QR code for setting up 2FA' })
  @ApiResponse({ status: 200, description: '2FA secret generated', type: Generate2FASecretResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generate2FASecret(@Req() req: AdminRequest): Promise<Generate2FASecretResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }
    const email: string = req.admin?.email || '';
    return await this.admin2FAService.generateSecret(adminId, email);
  }

  /**
   * Enable 2FA
   */
  @Post('2fa/enable')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Enable 2FA', description: 'Enables 2FA for the admin after verifying TOTP code' })
  @ApiBody({ type: Enable2FADto })
  @ApiResponse({ status: 200, description: '2FA enabled successfully', type: Enable2FAResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enable2FA(@Req() req: AdminRequest, @Body() dto: Enable2FADto): Promise<Enable2FAResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }
    return await this.admin2FAService.enable2FA(adminId, dto.secret, dto.totpCode);
  }

  /**
   * Verify 2FA code during login
   */
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify 2FA code during login',
    description: 'Verifies TOTP code or backup code to complete login for admins with 2FA enabled. This endpoint is called after initial login when 2FA is required. Accepts both 6-digit TOTP codes and backup codes.'
  })
  @ApiBody({
    type: Verify2FADto,
    description: 'TOTP code or backup code from authenticator app',
    examples: {
      totpCode: {
        value: {
          totpCode: '123456'
        },
        description: '6-digit TOTP code from authenticator app'
      },
      backupCode: {
        value: {
          totpCode: 'ABC12345'
        },
        description: 'Backup code (8 characters)'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '2FA verified, login successful',
    type: Verify2FAResponseDto,
    schema: {
      example: {
        verified: true,
        message: '2FA code verified successfully',
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 1800,
        admin: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@workix.com',
          role: 'admin'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code or expired login session' })
  @ApiResponse({ status: 400, description: '2FA code is required' })
  async verify2FA(@Body() dto: Verify2FADto, @Req() req: AdminRequest): Promise<AdminTokensResponse & { admin: { id: string; email: string; role: string } }> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }
    return await this.adminAuth2FAService.verify2FAAndLogin(adminId, dto.totpCode);
  }

  /**
   * Disable 2FA
   */
  @Post('2fa/disable')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Disable 2FA',
    description: 'Disables 2FA for the admin. After disabling, login will no longer require 2FA verification. All backup codes will be invalidated.'
  })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
    schema: {
      example: {
        message: '2FA has been disabled successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: '2FA is not enabled' })
  async disable2FA(@Req() req: AdminRequest): Promise<{ message: string }> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }
    return await this.admin2FAService.disable2FA(adminId);
  }

  /**
   * Get 2FA status
   */
  @Get('2fa/status')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Get 2FA status',
    description: 'Returns whether 2FA is enabled for the admin and if backup codes exist. Use this to check 2FA configuration before attempting to enable or disable.'
  })
  @ApiResponse({
    status: 200,
    description: '2FA status',
    type: Get2FAStatusResponseDto,
    schema: {
      example: {
        enabled: true,
        hasBackupCodes: true
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async get2FAStatus(@Req() req: AdminRequest): Promise<Get2FAStatusResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }
    return await this.admin2FAService.get2FAStatus(adminId);
  }

  /**
   * Request password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends password reset token to admin email. If the admin exists, a reset token will be sent. For security, the response is the same whether the admin exists or not. Rate limited to prevent abuse.'
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Admin email address',
    examples: {
      example1: {
        value: {
          email: 'admin@workix.com'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Reset token sent (if admin exists)',
    type: ForgotPasswordResponseDto,
    schema: {
      example: {
        message: 'If an admin with this email exists, a reset link has been sent'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Too many reset requests (rate limited)' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: AdminRequest
  ): Promise<ForgotPasswordResponseDto> {
    const ipAddress: string = this.extractIpAddress(req);
    const userAgentHeader: string | string[] | undefined = req.headers['user-agent'];
    let userAgent: string = 'unknown';
    if (typeof userAgentHeader === 'string') {
      userAgent = userAgentHeader;
    } else if (userAgentHeader !== undefined && userAgentHeader !== null && Array.isArray(userAgentHeader)) {
      // Type guard: check if array has elements and first element is string
      const firstElementDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(userAgentHeader, '0');
      if (firstElementDescriptor && 'value' in firstElementDescriptor) {
        const firstElement: unknown = firstElementDescriptor.value;
        if (typeof firstElement === 'string') {
          userAgent = firstElement;
        }
      }
    }
    return await this.adminPasswordResetService.requestPasswordReset(dto.email, ipAddress, userAgent);
  }

  /**
   * Verify reset token
   */
  @Post('reset-password/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify reset token',
    description: 'Verifies if password reset token from email is valid and not expired. Returns admin information if token is valid. Use this before showing the password reset form.'
  })
  @ApiBody({
    type: VerifyResetTokenDto,
    description: 'Password reset token from email',
    examples: {
      example1: {
        value: {
          token: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    type: VerifyResetTokenResponseDto,
    schema: {
      example: {
        adminId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@workix.com'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyResetToken(@Body() dto: VerifyResetTokenDto): Promise<VerifyResetTokenResponseDto> {
    return await this.adminPasswordResetService.verifyResetToken(dto.token);
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets admin password using reset token from email. Invalidates all existing sessions and tokens. Requires a strong password (minimum 12 characters).'
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset token and new password',
    examples: {
      example1: {
        value: {
          token: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
          newPassword: 'NewSecureP@ssw0rd123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ResetPasswordResponseDto,
    schema: {
      example: {
        message: 'Password reset successfully. All sessions have been invalidated.'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid token, expired token, or weak password (min 12 characters)' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: AdminRequest
  ): Promise<ResetPasswordResponseDto> {
    const ipAddress: string = this.extractIpAddress(req);
    const userAgentHeader: string | string[] | undefined = req.headers['user-agent'];
    let userAgent: string = 'unknown';
    if (typeof userAgentHeader === 'string') {
      userAgent = userAgentHeader;
    } else if (userAgentHeader !== undefined && userAgentHeader !== null && Array.isArray(userAgentHeader)) {
      // Type guard: check if array has elements and first element is string
      const firstElementDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(userAgentHeader, '0');
      if (firstElementDescriptor && 'value' in firstElementDescriptor) {
        const firstElement: unknown = firstElementDescriptor.value;
        if (typeof firstElement === 'string') {
          userAgent = firstElement;
        }
      }
    }
    return await this.adminPasswordResetService.resetPassword(dto.token, dto.newPassword, ipAddress, userAgent);
  }

  /**
   * Regenerate backup codes
   */
  @Post('2fa/regenerate-backup-codes')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Regenerate backup codes',
    description: 'Generates new backup codes for 2FA recovery. Old backup codes will be invalidated. Save the new codes securely - they can be used to login if you lose access to your authenticator app.'
  })
  @ApiResponse({
    status: 200,
    description: 'Backup codes regenerated',
    type: RegenerateBackupCodesResponseDto,
    schema: {
      example: {
        backupCodes: ['ABC12345', 'DEF67890', 'GHI11223', 'JKL44556', 'MNO77889', 'PQR00112', 'STU33445', 'VWX66778']
      }
    }
  })
  @ApiResponse({ status: 400, description: '2FA is not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async regenerateBackupCodes(@Req() req: AdminRequest): Promise<RegenerateBackupCodesResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }
    return await this.admin2FAService.regenerateBackupCodes(adminId);
  }

  /**
   * Change password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Change password',
    description: 'Changes admin password. Requires current password for verification. Invalidates all other sessions except the current one. Requires a strong password (minimum 12 characters).'
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Current and new password',
    examples: {
      example1: {
        value: {
          currentPassword: 'CurrentP@ssw0rd123',
          newPassword: 'NewSecureP@ssw0rd123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ChangePasswordResponseDto,
    schema: {
      example: {
        message: 'Password changed successfully. All other sessions have been invalidated.'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Weak new password (min 12 characters) or new password same as current' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid current password' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AdminRequest
  ): Promise<ChangePasswordResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    const currentToken: string | undefined = req.adminToken;
    if (!adminId || !currentToken) {
      throw new ForbiddenException('Admin not found');
    }
    const ipAddress: string = this.extractIpAddress(req);
    const userAgentHeader: string | string[] | undefined = req.headers['user-agent'];
    let userAgent: string = 'unknown';
    if (typeof userAgentHeader === 'string') {
      userAgent = userAgentHeader;
    } else if (userAgentHeader !== undefined && userAgentHeader !== null && Array.isArray(userAgentHeader)) {
      // Type guard: check if array has elements and first element is string
      const firstElementDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(userAgentHeader, '0');
      if (firstElementDescriptor && 'value' in firstElementDescriptor) {
        const firstElement: unknown = firstElementDescriptor.value;
        if (typeof firstElement === 'string') {
          userAgent = firstElement;
        }
      }
    }
    return await this.adminAuthService.changePassword(
      adminId,
      dto.currentPassword,
      dto.newPassword,
      currentToken,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Get all active sessions
   */
  @Get('sessions')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Get all active sessions', description: 'Returns list of all active sessions for the admin' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully', type: GetSessionsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSessions(@Req() req: AdminRequest): Promise<GetSessionsResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    const currentToken: string | undefined = req.adminToken;
    if (!adminId || !currentToken) {
      throw new ForbiddenException('Admin not found');
    }
    return await this.adminAuthService.getSessions(adminId, currentToken);
  }

  /**
   * Revoke specific session
   */
  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Revoke session',
    description: 'Revokes a specific session by ID. Cannot revoke the current session. All tokens for this session will be invalidated immediately.'
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID to revoke',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Session revoked successfully',
    type: RevokeSessionResponseDto,
    schema: {
      example: {
        message: 'Session revoked successfully'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Cannot revoke current session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: AdminRequest
  ): Promise<RevokeSessionResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    const currentToken: string | undefined = req.adminToken;
    if (!adminId || !currentToken) {
      throw new ForbiddenException('Admin not found');
    }
    await this.adminAuthService.revokeSession(adminId, sessionId, currentToken);
    return { message: 'Session revoked successfully' };
  }

  /**
   * Revoke all sessions except current
   */
  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Revoke all sessions',
    description: 'Revokes all active sessions except the current one. All tokens for other sessions will be invalidated immediately. Useful for security when you suspect unauthorized access.'
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked successfully',
    schema: {
      example: {
        message: 'All sessions revoked successfully. 3 session(s) revoked.',
        revokedCount: 3
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeAllSessions(@Req() req: AdminRequest): Promise<{ message: string; revokedCount: number }> {
    const adminId: string | undefined = req.admin?.id;
    const currentToken: string | undefined = req.adminToken;
    if (!adminId || !currentToken) {
      throw new ForbiddenException('Admin not found');
    }
    const result: { revokedCount: number } = await this.adminAuthService.revokeAllSessions(adminId, currentToken);
    return {
      message: `All sessions revoked successfully. ${result.revokedCount} session(s) revoked.`,
      revokedCount: result.revokedCount,
    };
  }

  /**
   * Logout admin
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Logout admin', description: 'Invalidates admin session and tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: { adminToken?: string; admin?: { id?: string } }): Promise<{ message: string }> {
    const adminToken: string | undefined = req.adminToken;
    const adminId: string | undefined = req.admin?.id;
    if (!adminToken || !adminId) {
      throw new ForbiddenException('Admin token or ID not found');
    }
    await this.adminAuthService.logout(adminToken, adminId);
    return { message: 'Logged out successfully' };
  }

  /**
   * Get login history
   */
  @Get('login-history')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Get login history',
    description: 'Returns detailed login history with filtering and pagination. Can filter by date range, IP address, and success status. Supports pagination with page and limit parameters.'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO 8601)', example: '2024-01-31T23:59:59Z' })
  @ApiQuery({ name: 'ipAddress', required: false, description: 'Filter by IP address', example: '192.168.1.1' })
  @ApiQuery({ name: 'success', required: false, description: 'Filter by success status', example: true, type: Boolean })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (1-100)', example: 20, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Login history retrieved successfully',
    type: GetLoginHistoryResponseDto,
    schema: {
      example: {
        entries: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            action: 'login',
            success: true,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
            createdAt: '2024-01-15T10:30:00Z',
            details: null
          }
        ],
        total: 50,
        page: 1,
        limit: 20,
        totalPages: 3
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoginHistory(
    @Query() query: GetLoginHistoryQueryDto,
    @Req() req: AdminRequest
  ): Promise<GetLoginHistoryResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }

    // Parse filters
    const filters: {
      startDate?: Date;
      endDate?: Date;
      ipAddress?: string;
      success?: boolean;
      page?: number;
      limit?: number;
    } = {};

    if (query.startDate) {
      filters.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.endDate = new Date(query.endDate);
    }
    if (query.ipAddress) {
      filters.ipAddress = query.ipAddress;
    }
    if (query.success !== undefined) {
      filters.success = query.success;
    }
    if (query.page) {
      filters.page = query.page;
    }
    if (query.limit) {
      filters.limit = query.limit;
    }

    return await this.adminAuthService.getLoginHistory(adminId, filters);
  }

  /**
   * Get IP whitelist for current admin
   */
  @Get('ip-whitelist')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Get IP whitelist',
    description: 'Returns list of whitelisted IP addresses for the admin. Includes IP address, description, and creation date. Only super_admin can view IP whitelist.'
  })
  @ApiResponse({
    status: 200,
    description: 'IP whitelist retrieved successfully',
    schema: {
      example: {
        ips: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            ipAddress: '192.168.1.1',
            description: 'Office network',
            createdAt: '2024-01-15T10:30:00Z'
          }
        ],
        enabled: true
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only super_admin can view IP whitelist' })
  async getIpWhitelist(@Request() req: { admin?: { id?: string } }): Promise<unknown> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin ID not found');
    }
    return this.ipWhitelistService.getWhitelistedIps(adminId);
  }

  /**
   * Add IP to whitelist
   */
  @Post('ip-whitelist')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({ summary: 'Add IP to whitelist', description: 'Adds an IP address to the admin\'s whitelist (super_admin only)' })
  @ApiResponse({ status: 201, description: 'IP added to whitelist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only super_admin can manage IP whitelist' })
  async addIpToWhitelist(
    @Body() dto: { ipAddress: string; description?: string },
    @Request() req: { admin?: { role?: string; id?: string } }
  ): Promise<unknown> {
    if (!req.admin || req.admin.role !== 'super_admin') {
      throw new ForbiddenException('Only super_admin can manage IP whitelist');
    }
    const adminId: string | undefined = req.admin.id;
    if (!adminId) {
      throw new ForbiddenException('Admin ID not found');
    }
    return this.ipWhitelistService.addIp(adminId, dto.ipAddress, dto.description);
  }

  /**
   * Remove IP from whitelist
   */
  @Delete('ip-whitelist/:ipId')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Remove IP from whitelist',
    description: 'Removes an IP address from the admin\'s whitelist. Only super_admin can manage IP whitelist. After removal, the admin will not be able to login from this IP if IP whitelist is enabled.'
  })
  @ApiParam({
    name: 'ipId',
    description: 'IP whitelist entry ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'IP removed from whitelist',
    schema: {
      example: {
        message: 'IP removed from whitelist'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only super_admin can manage IP whitelist' })
  @ApiResponse({ status: 404, description: 'IP not found in whitelist' })
  async removeIpFromWhitelist(
    @Param('ipId') ipId: string,
    @Request() req: { admin?: { id?: string } }
  ): Promise<{ message: string }> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin ID not found');
    }
    await this.ipWhitelistService.removeIp(adminId, ipId);
    return { message: 'IP removed from whitelist' };
  }

  /**
   * Enable/disable IP whitelist
   */
  @Post('ip-whitelist/toggle')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiOperation({
    summary: 'Toggle IP whitelist',
    description: 'Enables or disables IP whitelist for the admin. When enabled, only whitelisted IP addresses can login. Only super_admin can manage IP whitelist.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['enabled'],
      properties: {
        enabled: {
          type: 'boolean',
          example: true,
          description: 'Enable or disable IP whitelist'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'IP whitelist toggled',
    schema: {
      example: {
        message: 'IP whitelist enabled'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only super_admin can manage IP whitelist' })
  async toggleIpWhitelist(
    @Body() dto: { enabled: boolean },
    @Request() req: { admin?: { role?: string; id?: string } }
  ): Promise<{ message: string }> {
    if (!req.admin || req.admin.role !== 'super_admin') {
      throw new ForbiddenException('Only super_admin can manage IP whitelist');
    }
    const adminId: string | undefined = req.admin.id;
    if (!adminId) {
      throw new ForbiddenException('Admin ID not found');
    }
    await this.ipWhitelistService.setIpWhitelistEnabled(adminId, dto.enabled);
    return { message: `IP whitelist ${dto.enabled ? 'enabled' : 'disabled'}` };
  }

  /**
   * Health check for admin endpoints
   */
  @Get('health')
  @ApiOperation({
    summary: 'Admin health check',
    description: 'Checks health of admin service components: database connection (response time), Redis connection (if configured), and JWT secret configuration. Returns overall status: ok, degraded, or down.'
  })
  @ApiResponse({
    status: 200,
    description: 'Health check results',
    type: AdminHealthCheckResponseDto,
    schema: {
      example: {
        overall: {
          status: 'ok',
          timestamp: '2024-01-15T10:30:00Z',
          service: 'api-admin',
          component: 'admin'
        },
        database: {
          status: 'ok',
          responseTimeMs: 10,
          message: 'Database connection is healthy'
        },
        redis: {
          status: 'ok',
          responseTimeMs: 0,
          message: 'Redis connection is healthy'
        },
        jwt: {
          status: 'ok',
          message: 'JWT secret is configured and valid'
        },
        metadata: {
          version: '1.0.0'
        }
      }
    }
  })
  async healthCheck(): Promise<AdminHealthCheckResponseDto> {
    const timestamp: string = new Date().toISOString();
    const checks: {
      database: { status: 'ok' | 'error'; responseTimeMs?: number; message?: string };
      redis: { status: 'ok' | 'error' | 'not_configured'; responseTimeMs?: number; message?: string };
      jwt: { status: 'ok' | 'error'; message?: string };
    } = {
      database: { status: 'error' },
      redis: { status: 'not_configured' },
      jwt: { status: 'error' },
    };

    // Check database
    try {
      const dbStartTime: number = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const dbResponseTime: number = Date.now() - dbStartTime;
      checks.database = {
        status: 'ok',
        responseTimeMs: dbResponseTime,
        message: 'Database connection is healthy',
      };
    } catch (error) {
      checks.database = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database connection failed',
      };
    }

    // Check Redis (if configured)
    if (this.cacheManager) {
      try {
        const redisStartTime: number = Date.now();
        // Type guard for cacheManager.get method
        const cacheManagerGetDescriptor: PropertyDescriptor | undefined = typeof this.cacheManager === 'object' && this.cacheManager !== null ? Object.getOwnPropertyDescriptor(this.cacheManager, 'get') : undefined;
        if (cacheManagerGetDescriptor && 'value' in cacheManagerGetDescriptor && typeof cacheManagerGetDescriptor.value === 'function') {
          // eslint-disable-next-line no-restricted-syntax, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
          await (cacheManagerGetDescriptor.value as (key: string) => Promise<unknown>)('health_check');
        }
        const redisResponseTime: number = Date.now() - redisStartTime;
        checks.redis = {
          status: 'ok',
          responseTimeMs: redisResponseTime,
          message: 'Redis connection is healthy',
        };
      } catch (error) {
        checks.redis = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Redis connection failed',
        };
      }
    } else {
      checks.redis = {
        status: 'not_configured',
        message: 'Redis is not configured',
      };
    }

    // Check JWT secret
    try {
      const jwtSecret: string | undefined = this.configService.get<string>('GATEWAY_ADMIN_JWT_SECRET') ||
                       this.configService.get<string>('JWT_SECRET');
      if (jwtSecret && jwtSecret.length >= 32) {
        checks.jwt = {
          status: 'ok',
          message: 'JWT secret is configured and valid',
        };
      } else {
        checks.jwt = {
          status: 'error',
          message: 'JWT secret is missing or too short (minimum 32 characters)',
        };
      }
    } catch (error) {
      checks.jwt = {
        status: 'error',
        message: error instanceof Error ? error.message : 'JWT configuration check failed',
      };
    }

    // Determine overall status
    const hasErrors: boolean = checks.database.status === 'error' ||
                     (checks.redis.status === 'error') ||
                     checks.jwt.status === 'error';
    const hasWarnings: boolean = checks.redis.status === 'not_configured';

    const overallStatus: 'ok' | 'degraded' | 'down' = hasErrors
      ? 'down'
      : hasWarnings
        ? 'degraded'
        : 'ok';

    return {
      overall: {
        status: overallStatus,
        timestamp,
        service: 'api-admin',
        component: 'admin',
      },
      database: checks.database,
      redis: checks.redis,
      jwt: checks.jwt,
      metadata: {
        version: '1.0.0',
      },
    };
  }
}
