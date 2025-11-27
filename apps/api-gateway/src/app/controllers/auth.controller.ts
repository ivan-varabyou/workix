import { Body, Controller, Get, HttpCode, Post, Req, Inject, Optional } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';

import { MicroserviceClientService } from '../services/microservice-client.service';
import { ProxyService } from '../services/proxy.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

/**
 * Auth Controller - API Gateway
 * Documents all authentication endpoints for Swagger
 * All requests are proxied to Auth Service (port 7102)
 */
@ApiTags('🔐 Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private proxyService: ProxyService,
    private microserviceClient: MicroserviceClientService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  /**
   * Register new user (Event-Driven - асинхронная обработка)
   */
  @Post('register')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Register new user',
    description: 'Creates a new user account with email and password (asynchronous via Event-Driven). You will receive an email with activation link when registration is completed.',
  })
  @ApiBody({ type: RegisterDto, description: 'User registration data' })
  @ApiResponse({
    status: 202,
    description: 'User registration request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'User registration request received. You will receive an email with activation link when completed.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() registerDto: RegisterDto): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('user.*', 'user.register.request', {
        taskId,
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'User registration request received. You will receive an email with activation link when completed.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    return await this.proxyService.routeRequest('/api/v1/auth/register', 'POST', registerDto);
  }

  /**
   * Login user
   * Uses NestJS microservices (Redis transport) for communication with api-auth
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user and returns JWT tokens. Uses Redis microservices transport for communication.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIs...',
            },
            expiresIn: { type: 'number', example: 3600 },
          },
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_123' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 423, description: 'Account is locked' })
  async login(@Body() loginDto: LoginDto): Promise<unknown> {
    // Try microservice communication first (Redis transport)
    try {
      const result: unknown = await this.microserviceClient.sendToAuth('auth.login', {
        email: loginDto.email,
        password: loginDto.password,
      });

      // Publish event for side effects (analytics, cache, notifications)
      if (this.pubSub && result && typeof result === 'object' && result !== null && 'user' in result) {
        const userDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(result, 'user');
        if (userDescriptor && 'value' in userDescriptor && typeof userDescriptor.value === 'object' && userDescriptor.value !== null) {
          const userIdDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(userDescriptor.value, 'id');
          const userEmailDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(userDescriptor.value, 'email');
          const userId: string | undefined = userIdDescriptor && 'value' in userIdDescriptor && typeof userIdDescriptor.value === 'string' ? userIdDescriptor.value : undefined;
          const userEmail: string | undefined = userEmailDescriptor && 'value' in userEmailDescriptor && typeof userEmailDescriptor.value === 'string' ? userEmailDescriptor.value : undefined;
          if (userId) {
            await this.pubSub.publish('user.*', 'user.login', {
              userId,
              email: userEmail || loginDto.email,
              timestamp: new Date().toISOString(),
            }).catch((error: unknown): void => {
              const errorMessage: string = error instanceof Error ? error.message : String(error);
              console.warn(`Failed to publish user.login event: ${errorMessage}`);
            });
          }
        }
      }

      return result;
    } catch (error: unknown) {
      // Fallback to HTTP proxy if microservice fails
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Microservice communication failed, falling back to HTTP: ${errorMessage}`);
      return await this.proxyService.routeRequest('/api/v1/auth/login', 'POST', loginDto);
    }
  }

  /**
   * Verify token
   */
  @Post('verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify JWT token',
    description: 'Validates JWT token and returns token information',
  })
  @ApiBody({ type: VerifyTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token verification result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        userId: { type: 'string', example: 'user_123' },
        email: { type: 'string', example: 'user@example.com' },
        error: { type: 'string', example: 'Invalid or expired token' },
      },
    },
  })
  async verify(@Body() body: VerifyTokenDto): Promise<unknown> {
    // Try microservice communication first (Redis transport)
    try {
      return await this.microserviceClient.sendToAuth('auth.verify', {
        token: body.token,
      });
    } catch (error: unknown) {
      // Fallback to HTTP proxy if microservice fails
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Microservice communication failed, falling back to HTTP: ${errorMessage}`);
      return await this.proxyService.routeRequest('/api/v1/auth/verify', 'POST', body);
    }
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        expiresIn: { type: 'number', example: 3600 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() body: RefreshTokenDto): Promise<unknown> {
    // Try microservice communication first (Redis transport)
    try {
      return await this.microserviceClient.sendToAuth('auth.refresh', {
        refreshToken: body.refreshToken,
      });
    } catch (error: unknown) {
      // Fallback to HTTP proxy if microservice fails
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Microservice communication failed, falling back to HTTP: ${errorMessage}`);
      return await this.proxyService.routeRequest('/api/v1/auth/refresh', 'POST', body);
    }
  }

  /**
   * Get current user
   */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Returns information about the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User data',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'user_123' },
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'John Doe' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/auth/me', 'GET', null, headers);
  }

  /**
   * Logout user
   */
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidates user session and tokens',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: Request, @Body() body?: RefreshTokenDto): Promise<unknown> {
    // Try microservice communication first (Redis transport)
    try {
      // Extract userId from JWT token (simplified - in production should decode token)
      const auth: string | undefined = req.headers.authorization;
      const refreshToken: string | undefined = body?.refreshToken;

      if (!refreshToken) {
        // Fallback to HTTP if no refresh token provided
        const headers: Record<string, string> = auth ? { authorization: auth } : {};
        return await this.proxyService.routeRequest('/api/v1/auth/logout', 'POST', null, headers);
      }

      // For microservice, we need userId - extract from token or use placeholder
      // In production, decode JWT to get userId
      return await this.microserviceClient.sendToAuth('auth.logout', {
        refreshToken,
        userId: 'extract-from-token', // TODO: Extract from JWT token
      });
    } catch (error: unknown) {
      // Fallback to HTTP proxy if microservice fails
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Microservice communication failed, falling back to HTTP: ${errorMessage}`);
      const auth: string | undefined = req.headers.authorization;
      const headers: Record<string, string> = auth ? { authorization: auth } : {};
      return await this.proxyService.routeRequest('/api/v1/auth/logout', 'POST', null, headers);
    }
  }

  /**
   * Request password reset (Event-Driven - асинхронная обработка)
   */
  @Post('password-reset/request')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Initiates password reset process by sending reset token to user email (asynchronous via Event-Driven). You will receive an email with reset link when the request is processed.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Password reset request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'Password reset request received. If this email is registered, you will receive a reset link via email.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async requestPasswordReset(@Body() body: { email?: string }): Promise<{ taskId: string; status: string; message: string } | unknown> {
    if (!body.email) {
      throw new Error('Email is required');
    }

    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('user.*', 'user.password-reset.request', {
        taskId,
        email: body.email,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Password reset request received. If this email is registered, you will receive a reset link via email.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    return await this.proxyService.routeRequest('/api/v1/auth/password-reset/request', 'POST', body);
  }

  /**
   * Verify password reset token (HTTP - синхронный, нужен немедленный ответ)
   */
  @Post('password-reset/verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify password reset token',
    description: 'Validates password reset token before allowing password change',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'reset-token-from-email' },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user_123' },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyPasswordResetToken(@Body() body: { token?: string }): Promise<unknown> {
    return await this.proxyService.routeRequest('/api/v1/auth/password-reset/verify', 'POST', body);
  }

  /**
   * Confirm password reset (HTTP - синхронный, нужен немедленный ответ)
   */
  @Post('password-reset/confirm')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm password reset and set new password',
    description: 'Completes password reset by setting new password using reset token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'reset-token-from-email' },
        newPassword: { type: 'string', example: 'NewSecureP@ssw0rd123' },
      },
      required: ['token', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset successfully' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token or weak password' })
  async confirmPasswordReset(@Body() body: { token?: string; newPassword?: string }): Promise<unknown> {
    return await this.proxyService.routeRequest('/api/v1/auth/password-reset/confirm', 'POST', body);
  }

  /**
   * Health check
   */
  @Get('health')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns service health status',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async health(): Promise<unknown> {
    // Try microservice communication first (Redis transport)
    try {
      return await this.microserviceClient.sendToAuth('auth.health', {});
    } catch (error: unknown) {
      // Fallback to HTTP proxy if microservice fails
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Microservice communication failed, falling back to HTTP: ${errorMessage}`);
      return await this.proxyService.routeRequest('/api/v1/auth/health', 'GET');
    }
  }
}
