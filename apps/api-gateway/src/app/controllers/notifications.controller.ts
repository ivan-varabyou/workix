import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Notifications Controller - API Gateway
 * Documents all notification endpoints for Swagger
 * All requests are proxied to Notifications Service (port 7103)
 */
@ApiTags('📧 Notifications')
@Controller('subscriptions')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private proxyService: ProxyService) {}

  /**
   * Register push subscription
   */
  @Post()
  @ApiOperation({
    summary: 'Register push notification subscription',
    description:
      'Registers a new Web Push subscription for the authenticated user. The subscription object should be obtained from the browser\'s Push API (navigator.serviceWorker.ready.then(registration => registration.pushManager.subscribe(...))). The subscription will be stored and can be used to send push notifications to the user\'s device.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subscription: {
          type: 'object',
          properties: {
            endpoint: {
              type: 'string',
              description: 'Web Push endpoint URL where push notifications will be sent',
              example: 'https://fcm.googleapis.com/fcm/send/dGhpcyBpcyBhIHNhbXBsZSBlbmRwb2ludCBVUkw=',
            },
            keys: {
              type: 'object',
              properties: {
                p256dh: {
                  type: 'string',
                  description: 'P256DH public key used for encrypting push messages',
                  example: 'BElGCiBpYSAxLjAgdGhpcyBpcyBub3QgYSByZWFsIHB1YmxpYyBrZXkuLi4=',
                },
                auth: {
                  type: 'string',
                  description: 'Authentication secret used for encrypting push messages',
                  example: 'k3vYCHhjamFzc2NyaXB0aW9uIGtleSBmb3IgdGhpcyBzdWJzY3JpcHRpb24=',
                },
              },
              required: ['p256dh', 'auth'],
            },
          },
          required: ['endpoint', 'keys'],
        },
      },
      required: ['subscription'],
    },
    description: 'Push subscription object containing endpoint URL and encryption keys',
  })
  @ApiResponse({
    status: 201,
    description: 'Push subscription registered successfully. Returns the subscription ID and a success message.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier for the registered push subscription',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        message: {
          type: 'string',
          description: 'Success message',
          example: 'Push subscription registered successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid subscription data. The request body may be missing required fields or contain invalid values.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. A valid JWT token is required in the Authorization header.',
  })
  async registerSubscription(@Body() body: unknown, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/subscriptions', 'POST', body, headers);
  }

  /**
   * Get user's push subscriptions
   */
  @Get()
  @ApiOperation({
    summary: 'Get user push subscriptions',
    description: 'Retrieves a list of all active push notification subscriptions for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user push subscriptions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique identifier of the subscription' },
          endpoint: { type: 'string', description: 'Web Push endpoint URL' },
          createdAt: { type: 'string', format: 'date-time', description: 'Timestamp when the subscription was created' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. A valid JWT token is required in the Authorization header.',
  })
  async getSubscriptions(@Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/subscriptions', 'GET', null, headers);
  }

  /**
   * Unregister push subscription
   */
  @Delete(':subscriptionId')
  @ApiOperation({
    summary: 'Unregister push notification subscription',
    description: 'Deletes an existing push notification subscription for the authenticated user by its ID.',
  })
  @ApiParam({
    name: 'subscriptionId',
    description: 'The unique identifier of the push subscription to unregister.',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Push subscription unregistered successfully',
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
    status: 404,
    description: 'Subscription not found or does not belong to the authenticated user.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. A valid JWT token is required in the Authorization header.',
  })
  async unregisterSubscription(@Param('subscriptionId') subscriptionId: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/v1/subscriptions/${subscriptionId}`, 'DELETE', null, headers);
  }
}
