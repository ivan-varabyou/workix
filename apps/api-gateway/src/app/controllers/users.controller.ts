import { Body, Controller, Delete, Get, HttpCode, Inject, Optional,Param, Post, Put, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

/**
 * Users Controller - API Gateway
 * Documents all user profile endpoints for Swagger
 * All requests are proxied to User Service (port 5001)
 */
@ApiTags('👤 User Profiles')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  /**
   * Get user profile by ID
   */
  @Get(':userId')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description: 'Retrieves detailed user profile information',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The user ID (UUID)',
    example: 'user_123',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'user_123' },
        userId: { type: 'string', example: 'user_123' },
        bio: { type: 'string', example: 'Software developer' },
        avatarUrl: {
          type: 'string',
          example: 'https://example.com/avatar.jpg',
        },
        preferences: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserProfile(@Param('userId') userId: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/users/${userId}`, 'GET', null, headers);
  }

  /**
   * Update user profile (Event-Driven - асинхронная обработка)
   */
  @Put(':userId')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates profile information for a user (asynchronous via Event-Driven). The update will be processed in the background.',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The user ID (UUID)',
    example: 'user_123',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({
    status: 202,
    description: 'Profile update request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'Profile update request received. The update will be processed in the background.' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUserProfile(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserProfileDto,
    @Req() req: Request
  ): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('user.*', 'user.profile.update.request', {
        taskId,
        userId,
        updateData: updateDto,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Profile update request received. The update will be processed in the background.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/users/${userId}`, 'PUT', updateDto, headers);
  }

  /**
   * Update user avatar
   */
  @Post(':userId/avatar')
  @ApiOperation({
    summary: 'Update user avatar',
    description: 'Uploads a new avatar for the user',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The user ID (UUID)',
    example: 'user_123',
  })
  @ApiBody({
    description: 'Avatar URL and file key',
    schema: {
      type: 'object',
      properties: {
        avatarUrl: {
          type: 'string',
          example: 'https://example.com/avatar.jpg',
        },
        fileKey: { type: 'string', example: 'avatars/user_123.jpg' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        avatarUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAvatar(
    @Param('userId') userId: string,
    @Body() body: { avatarUrl: string; fileKey?: string },
    @Req() req: Request
  ): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(
      `/api/users/${userId}/avatar`,
      'POST',
      body,
      headers
    );
  }

  /**
   * Delete user profile (Event-Driven - асинхронная обработка)
   */
  @Delete(':userId')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Delete user profile',
    description: 'Soft-deletes user profile and data (asynchronous via Event-Driven). The deletion will be processed in the background.',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'The user ID (UUID)',
    example: 'user_123',
  })
  @ApiResponse({
    status: 202,
    description: 'Profile deletion request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'Profile deletion request received. The deletion will be processed in the background.' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUserProfile(@Param('userId') userId: string, @Req() req: Request): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('user.*', 'user.profile.delete.request', {
        taskId,
        userId,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Profile deletion request received. The deletion will be processed in the background.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/users/${userId}`, 'DELETE', null, headers);
  }
}
