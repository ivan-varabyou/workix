import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminLoginDto, AdminRegisterDto } from '@workix/backend/domain/admin';

import { AdminAuthLocalService, AdminLoginResponse } from '../services/admin-auth-local.service';

/**
 * Simplified Admin Auth Controller
 * Переписан с явными типами и безопасно
 */
@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthSimpleController {
  constructor(
    private readonly adminAuthService: AdminAuthLocalService,
  ) {
    // Зависимости проверяются NestJS автоматически
  }

  /**
   * Register new admin
   */
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new admin',
    description: 'Creates a new admin account. Only super_admin can register new admins.',
  })
  @ApiBody({ type: AdminRegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Admin registered successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Admin already exists' })
  async register(@Body() dto: AdminRegisterDto): Promise<{ id: string; email: string; role: string }> {
    return this.adminAuthService.register(dto);
  }

  /**
   * Login admin
   */
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description: 'Authenticates admin and returns JWT tokens. Returns 2FA challenge if 2FA is enabled.',
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        admin: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked or IP not whitelisted' })
  async login(@Body() dto: AdminLoginDto): Promise<AdminLoginResponse> {
    return this.adminAuthService.login(dto);
  }

  /**
   * Health check for admin auth
   */
  @Get('health')
  @ApiOperation({
    summary: 'Admin auth health check',
    description: 'Returns health status of admin authentication service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'admin-auth' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  getHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'ok',
      service: 'admin-auth',
      timestamp: new Date().toISOString(),
    };
  }
}
