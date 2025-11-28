import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ADMIN_ROLES_KEY,
  AdminAuthService,
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
  GetLoginHistoryQueryDto,
  GetLoginHistoryResponseDto,
  GetSessionsResponseDto,
  RevokeSessionResponseDto,
} from '@workix/backend/domain/admin';

/**
 * Auth Controller
 * Handles authentication using library services from @workix/backend/domain/admin
 * All business logic is in library, this controller only routes requests
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private adminAuthService: AdminAuthService,
    private ipWhitelistService: AdminIpWhitelistService,
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
  @Throttle({ short: { limit: 5, ttl: 60000 } })
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
    @Req() req: AdminRequest,
  ): Promise<AdminTokensResponse & { admin: { id: string; email: string; role: string } }> {
    const ipAddress: string = this.extractIpAddress(req);
    const userAgentHeader: string | string[] | undefined = req.headers['user-agent'];
    let userAgent: string = 'unknown';
    if (typeof userAgentHeader === 'string') {
      userAgent = userAgentHeader;
    } else if (userAgentHeader !== undefined && userAgentHeader !== null && Array.isArray(userAgentHeader)) {
      const firstElement: string | undefined = userAgentHeader[0];
      if (typeof firstElement === 'string') {
        userAgent = firstElement;
      }
    }
    return await this.adminAuthService.login(dto, ipAddress, userAgent);
  }

  /**
   * Extract IP address from request
   */
  private extractIpAddress(req: AdminRequest): string {
    if ('ip' in req && typeof req.ip === 'string' && req.ip) {
      return req.ip;
    }
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
  async refresh(@Body() dto: AdminRefreshTokenDto): Promise<AdminTokensResponse> {
    return await this.adminAuthService.refreshToken(dto.refreshToken);
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
    description: 'Changes admin password. Requires current password for verification. Invalidates all other sessions except the current one.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ChangePasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Weak new password (min 12 characters) or new password same as current' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid current password' })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: AdminRequest,
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
      const firstElement: string | undefined = userAgentHeader[0];
      if (typeof firstElement === 'string') {
        userAgent = firstElement;
      }
    }
    return await this.adminAuthService.changePassword(adminId, dto.currentPassword, dto.newPassword, currentToken, ipAddress, userAgent);
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
    description: 'Revokes a specific session by ID. Cannot revoke the current session.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID to revoke',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Session revoked successfully',
    type: RevokeSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot revoke current session' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: AdminRequest,
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
    description: 'Revokes all active sessions except the current one.',
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions revoked successfully',
    schema: {
      example: {
        message: 'All sessions revoked successfully. 3 session(s) revoked.',
        revokedCount: 3,
      },
    },
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
    description: 'Returns detailed login history with filtering and pagination.',
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoginHistory(
    @Query() query: GetLoginHistoryQueryDto,
    @Req() req: AdminRequest,
  ): Promise<GetLoginHistoryResponseDto> {
    const adminId: string | undefined = req.admin?.id;
    if (!adminId) {
      throw new ForbiddenException('Admin not found');
    }

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
    description: 'Returns list of whitelisted IP addresses for the admin. Only super_admin can view IP whitelist.',
  })
  @ApiResponse({
    status: 200,
    description: 'IP whitelist retrieved successfully',
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
    @Request() req: { admin?: { role?: string; id?: string } },
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
    description: 'Removes an IP address from the admin\'s whitelist. Only super_admin can manage IP whitelist.',
  })
  @ApiParam({
    name: 'ipId',
    description: 'IP whitelist entry ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'IP removed from whitelist',
    schema: {
      example: {
        message: 'IP removed from whitelist',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only super_admin can manage IP whitelist' })
  @ApiResponse({ status: 404, description: 'IP not found in whitelist' })
  async removeIpFromWhitelist(
    @Param('ipId') ipId: string,
    @Request() req: { admin?: { id?: string } },
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
    description: 'Enables or disables IP whitelist for the admin. When enabled, only whitelisted IP addresses can login. Only super_admin can manage IP whitelist.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['enabled'],
      properties: {
        enabled: {
          type: 'boolean',
          example: true,
          description: 'Enable or disable IP whitelist',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'IP whitelist toggled',
    schema: {
      example: {
        message: 'IP whitelist enabled',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only super_admin can manage IP whitelist' })
  async toggleIpWhitelist(
    @Body() dto: { enabled: boolean },
    @Request() req: { admin?: { role?: string; id?: string } },
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
}
