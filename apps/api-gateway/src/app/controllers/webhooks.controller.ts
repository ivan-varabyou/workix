import { Body, Controller, Delete, Get, HttpCode, Inject, Optional, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Webhooks Controller - API Gateway
 * Documents all webhook endpoints for Swagger
 * All requests are proxied to Webhooks Service (port 7105)
 */
@ApiTags('🔔 Webhooks')
@Controller('webhooks')
@ApiBearerAuth()
export class WebhooksController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  @Post()
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Create webhook',
    description: 'Create a new webhook (asynchronous via Event-Driven). The webhook will be created in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { url: { type: 'string' }, events: { type: 'array' } } } })
  @ApiResponse({
    status: 202,
    description: 'Webhook creation request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'Webhook creation request received. The webhook will be created in the background.' },
      },
    },
  })
  async createWebhook(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('webhook.*', 'webhook.create.request', {
        taskId,
        userId,
        webhookData: body,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Webhook creation request received. The webhook will be created in the background.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  /**
   * Extract userId from JWT token (simplified - в реальности нужно декодировать токен)
   */
  private extractUserIdFromToken(_authHeader?: string): string | undefined {
    // TODO: Декодировать JWT токен для получения userId
    return undefined;
  }

  @Get()
  @ApiOperation({ summary: 'Get webhooks', description: 'Get all webhooks for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async getWebhooks(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, undefined, req.headers as Record<string, string>);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID', description: 'Get webhook by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  async getWebhookById(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Put(':id')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Update webhook',
    description: 'Update webhook (asynchronous via Event-Driven). The update will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({
    status: 202,
    description: 'Webhook update request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
      },
    },
  })
  async updateWebhook(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('webhook.*', 'webhook.update.request', {
        taskId,
        webhookId: id,
        webhookData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Delete(':id')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Delete webhook',
    description: 'Delete webhook (asynchronous via Event-Driven). The deletion will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 202,
    description: 'Webhook deletion request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
      },
    },
  })
  async deleteWebhook(@Param('id') id: string, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('webhook.*', 'webhook.delete.request', {
        taskId,
        webhookId: id,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, undefined, headers);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test webhook', description: 'Send test event to webhook' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Test event sent successfully' })
  async testWebhook(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'POST', undefined, req.headers as Record<string, string>);
  }
}
