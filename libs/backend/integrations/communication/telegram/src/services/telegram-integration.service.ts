import { Inject, Injectable, Logger } from '@nestjs/common';

import { BasePayload } from '../../../../core/src/interfaces/integration-payload.interface';
import { TelegramIntegrationRecord } from '../interfaces/telegram-config.interface';
import { TelegramIntegrationPrismaService } from '../interfaces/telegram-prisma.interface';
import type {
  TelegramMessageResponse,
  TelegramSendMessageParams,
} from '../types/telegram-api-types';
import { TelegramApiService } from './telegram-api.service';

/**
 * Approval Request
 */
export interface ApprovalRequest {
  id: string;
  userId: string;
  type: 'pipeline_execution' | 'api_call' | 'subscription_upgrade' | 'custom';
  title: string;
  description: string;
  metadata?: BasePayload;
  expiresAt?: Date;
  createdAt: Date;
}

/**
 * Telegram Integration Service
 * Semi-automatic approvals via Telegram bot
 */
@Injectable()
export class TelegramIntegrationService {
  private readonly logger = new Logger(TelegramIntegrationService.name);
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private pendingApprovals: Map<string, { requestId: string; chatId: string; messageId: number }> =
    new Map();

  constructor(
    private readonly telegramApiService: TelegramApiService,
    @Inject('PrismaService') private readonly prisma: TelegramIntegrationPrismaService
  ) {}

  /**
   * Create Telegram integration for a user
   */
  async createIntegration(
    userId: string,
    chatId: string,
    username?: string,
    firstName?: string,
    lastName?: string
  ): Promise<TelegramIntegrationRecord> {
    try {
      const createData: Omit<TelegramIntegrationRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        chatId,
        isActive: true,
      };
      if (username !== undefined) {
        createData.username = username;
      }
      if (firstName !== undefined) {
        createData.firstName = firstName;
      }
      if (lastName !== undefined) {
        createData.lastName = lastName;
      }
      const integration = await this.prisma.telegramIntegration.create({
        data: createData,
      });

      this.logger.log(`Telegram integration created for user ${userId}`);
      return integration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create Telegram integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration by user ID
   */
  async getIntegration(userId: string): Promise<TelegramIntegrationRecord | null> {
    try {
      return await this.prisma.telegramIntegration.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get Telegram integration: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Send notification to Telegram
   */
  async sendNotification(
    userId: string,
    message: string,
    options?: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      replyToMessageId?: number;
    }
  ): Promise<TelegramMessageResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Telegram integration not found');
      }

      const sendParams: TelegramSendMessageParams = {
        chatId: integration.chatId,
        text: message,
      };
      if (options?.parseMode !== undefined) {
        sendParams.parseMode = options.parseMode;
      }
      if (options?.replyToMessageId !== undefined) {
        sendParams.replyToMessageId = options.replyToMessageId;
      }
      return await this.telegramApiService.sendMessage(sendParams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to send notification: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Request approval via Telegram
   */
  async requestApproval(
    userId: string,
    request: Omit<ApprovalRequest, 'id' | 'createdAt'>
  ): Promise<{ messageId: number; callbackData: string }> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Telegram integration not found');
      }

      const requestId = `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const approvalRequest: ApprovalRequest = {
        ...request,
        id: requestId,
        createdAt: new Date(),
      };

      this.approvalRequests.set(requestId, approvalRequest);

      // Create message with approval buttons
      const message = this.formatApprovalMessage(approvalRequest);
      const keyboard = [
        [
          { text: '✅ Approve', callbackData: `approve:${requestId}` },
          { text: '❌ Reject', callbackData: `reject:${requestId}` },
        ],
      ];

      const sentMessage = await this.telegramApiService.sendMessageWithKeyboard(
        integration.chatId,
        message,
        keyboard
      );

      // Store pending approval
      this.pendingApprovals.set(requestId, {
        requestId,
        chatId: integration.chatId,
        messageId: sentMessage.message_id,
      });

      this.logger.log(`Approval request sent: ${requestId} to user ${userId}`);

      return {
        messageId: sentMessage.message_id,
        callbackData: `approve:${requestId}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to request approval: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Handle approval callback
   */
  async handleApprovalCallback(
    callbackQueryId: string,
    callbackData: string,
    chatId: string,
    messageId: number
  ): Promise<{ approved: boolean; requestId: string }> {
    try {
      const [action, requestId] = callbackData.split(':');

      if (action !== 'approve' && action !== 'reject') {
        throw new Error(`Unknown action: ${action}`);
      }

      if (!requestId) {
        throw new Error('Request ID is required');
      }
      const request = this.approvalRequests.get(requestId);

      if (!request) {
        throw new Error(`Approval request not found: ${requestId}`);
      }

      const approved = action === 'approve';

      // Answer callback query
      await this.telegramApiService.answerCallbackQuery(
        callbackQueryId,
        approved ? '✅ Approved' : '❌ Rejected',
        false
      );

      // Update message
      const statusEmoji = approved ? '✅' : '❌';
      const statusText = approved ? 'Approved' : 'Rejected';
      const updatedMessage =
        this.formatApprovalMessage(request) + `\n\n${statusEmoji} **${statusText}**`;

      await this.telegramApiService.editMessageText(chatId, messageId, updatedMessage, 'Markdown');

      // Remove from pending approvals
      this.pendingApprovals.delete(requestId);
      this.approvalRequests.delete(requestId);

      this.logger.log(`Approval ${statusText.toLowerCase()}: ${requestId}`);

      return { approved, requestId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to handle approval callback: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Format approval message
   */
  private formatApprovalMessage(request: ApprovalRequest): string {
    let message: '🔔 **Approval Request**\n\n' = `🔔 **Approval Request**\n\n`;
    message += `**Type:** ${request.type}\n`;
    message += `**Title:** ${request.title}\n`;
    message += `**Description:** ${request.description}\n`;

    if (request.expiresAt) {
      const expiresIn = Math.ceil((request.expiresAt.getTime() - Date.now()) / 1000 / 60);
      message += `**Expires in:** ${expiresIn} minutes\n`;
    }

    if (request.metadata) {
      message += `\n**Details:**\n`;
      for (const [key, value] of Object.entries(request.metadata)) {
        message += `- ${key}: ${value}\n`;
      }
    }

    return message;
  }

  /**
   * Deactivate integration
   */
  async deactivateIntegration(integrationId: string): Promise<void> {
    try {
      await this.prisma.telegramIntegration.update({
        where: { id: integrationId },
        data: { isActive: false },
      });

      this.logger.log(`Telegram integration deactivated: ${integrationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to deactivate integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get pending approvals for user
   */
  async getUserPendingApprovals(userId: string): Promise<ApprovalRequest[]> {
    return Array.from(this.approvalRequests.values()).filter((r) => r.userId === userId);
  }
}
