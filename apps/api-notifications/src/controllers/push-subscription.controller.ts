import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtGuard, JwtPayload } from '@workix/domain/auth';
import {
  PushSubscriptionService,
  RegisterPushSubscriptionDto,
  RegisterPushSubscriptionResponseDto,
} from '@workix/domain/notifications';
import { expressRequestToHttpRequest, isExpressRequest } from '@workix/shared/backend/core';

/**
 * Push Subscription Controller
 * Handles push notification subscription management for authenticated users.
 * Provides endpoints to register, retrieve, and unregister Web Push subscriptions.
 */
@Controller('subscriptions')
@ApiTags('push-subscriptions')
@ApiBearerAuth()
@ApiExtraModels(RegisterPushSubscriptionDto, RegisterPushSubscriptionResponseDto)
@UseGuards(JwtGuard)
export class PushSubscriptionController {
  constructor(private readonly pushSubscriptionService: PushSubscriptionService) {}

  /**
   * Register push subscription
   */
  @Post()
  @ApiOperation({
    summary: 'Register push notification subscription',
    description: 'Registers a new Web Push subscription for the authenticated user. The subscription object should be obtained from the browser\'s Push API (navigator.serviceWorker.ready.then(registration => registration.pushManager.subscribe(...))). The subscription will be stored and can be used to send push notifications to the user\'s device.',
  })
  @ApiBody({
    type: () => RegisterPushSubscriptionDto,
    description: 'Push subscription object containing endpoint URL and encryption keys',
  })
  @ApiResponse({
    status: 201,
    description: 'Push subscription registered successfully. Returns the subscription ID and a success message.',
    type: () => RegisterPushSubscriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid subscription data. The request body may be missing required fields or contain invalid values.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. A valid JWT token is required in the Authorization header.',
  })
  async registerSubscription(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterPushSubscriptionDto,
    @Req() req: unknown
  ): Promise<RegisterPushSubscriptionResponseDto> {
    const httpRequest = isExpressRequest(req) ? expressRequestToHttpRequest(req) : null;
    const userAgent: string | undefined = httpRequest?.headers?.['user-agent'] as string | undefined;

    const result = await this.pushSubscriptionService.registerSubscription(
      user.userId,
      dto.subscription,
      userAgent
    );

    return {
      id: result.id,
      message: 'Push subscription registered successfully',
    };
  }

  /**
   * Get user's push subscriptions
   */
  @Get()
  @ApiOperation({
    summary: 'Get user push subscriptions',
    description: 'Retrieves all active push notification subscriptions for the authenticated user. Returns a list of subscriptions with their IDs, endpoint URLs, and creation timestamps.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user push subscriptions. Returns an array of subscription objects containing ID, endpoint URL, and creation timestamp.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique subscription identifier',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          endpoint: {
            type: 'string',
            description: 'Web Push endpoint URL',
            example: 'https://fcm.googleapis.com/fcm/send/dGhpcyBpcyBhIHNhbXBsZSBlbmRwb2ludCBVUkw=',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Subscription creation timestamp in ISO 8601 format',
            example: '2025-11-19T20:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. A valid JWT token is required in the Authorization header.',
  })
  async getSubscriptions(@CurrentUser() user: JwtPayload): Promise<
    Array<{ id: string; endpoint: string; createdAt: Date }>
  > {
    return await this.pushSubscriptionService.getUserSubscriptions(user.userId);
  }

  /**
   * Unregister push subscription
   */
  @Delete(':subscriptionId')
  @ApiOperation({
    summary: 'Unregister push notification subscription',
    description: 'Removes a push notification subscription for the authenticated user. The subscription will no longer receive push notifications. Only subscriptions belonging to the authenticated user can be deleted.',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'Unique identifier of the subscription to be removed. This ID is returned when registering a subscription.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Push subscription unregistered successfully. The subscription has been removed and will no longer receive notifications.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Push subscription unregistered successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. A valid JWT token is required in the Authorization header.',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found. The provided subscription ID does not exist or does not belong to the authenticated user.',
  })
  async unregisterSubscription(
    @CurrentUser() user: JwtPayload,
    @Param('subscriptionId') subscriptionId: string
  ): Promise<{ message: string }> {
    await this.pushSubscriptionService.unregisterSubscription(user.userId, subscriptionId);
    return { message: 'Push subscription unregistered successfully' };
  }
}
