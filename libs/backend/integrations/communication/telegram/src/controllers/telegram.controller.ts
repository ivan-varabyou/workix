import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BasePayload } from '../../../../core/src/interfaces/integration-payload.interface';
import { TelegramIntegrationRecord, TelegramUpdate } from '../interfaces/telegram-config.interface';
import { TelegramEventsService } from '../services/telegram-events.service';
import {
  ApprovalRequest,
  TelegramIntegrationService,
} from '../services/telegram-integration.service';
import type { TelegramMessageResponse } from '../types/telegram-api-types';

@ApiTags('telegram-integration')
@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly telegramIntegrationService: TelegramIntegrationService,
    private readonly telegramEventsService: TelegramEventsService
  ) {}

  /**
   * Webhook endpoint for Telegram updates
   */
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Telegram webhook updates' })
  @ApiResponse({ status: 200, description: 'Update processed' })
  async handleWebhook(@Body() update: TelegramUpdate): Promise<void> {
    await this.telegramEventsService.handleUpdate(update);
  }

  /**
   * Send notification
   */
  @Post('notify')
  @UseGuards() // Add auth guard
  @ApiOperation({ summary: 'Send notification to user via Telegram' })
  @ApiResponse({ status: 200, description: 'Notification sent' })
  async sendNotification(
    @Body() body: { userId: string; message: string }
  ): Promise<TelegramMessageResponse> {
    return await this.telegramIntegrationService.sendNotification(body.userId, body.message);
  }

  /**
   * Request approval
   */
  @Post('approval')
  @UseGuards() // Add auth guard
  @ApiOperation({ summary: 'Request approval via Telegram' })
  @ApiResponse({ status: 200, description: 'Approval request sent' })
  async requestApproval(
    @Body()
    body: {
      userId: string;
      type: 'pipeline_execution' | 'api_call' | 'subscription_upgrade' | 'custom';
      title: string;
      description: string;
      metadata?: BasePayload;
    }
  ): Promise<{ messageId: number; callbackData: string }> {
    const approvalRequest: Omit<ApprovalRequest, 'id' | 'createdAt'> = {
      userId: body.userId,
      type: body.type,
      title: body.title,
      description: body.description,
    };
    if (body.metadata !== undefined) {
      approvalRequest.metadata = body.metadata;
    }
    return await this.telegramIntegrationService.requestApproval(body.userId, approvalRequest);
  }

  /**
   * Get integration status
   */
  @Get('integration/:userId')
  @UseGuards() // Add auth guard
  @ApiOperation({ summary: 'Get Telegram integration status' })
  @ApiResponse({ status: 200, description: 'Integration status' })
  async getIntegration(@Param('userId') userId: string): Promise<TelegramIntegrationRecord | null> {
    return await this.telegramIntegrationService.getIntegration(userId);
  }
}
