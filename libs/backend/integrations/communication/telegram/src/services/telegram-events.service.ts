import { Injectable, Logger } from '@nestjs/common';

import {
  TelegramCallbackQuery,
  TelegramIncomingMessage,
  TelegramUpdate,
  TelegramUser,
} from '../interfaces/telegram-config.interface';
import { TelegramIntegrationService } from './telegram-integration.service';

/**
 * Telegram Events Service
 * Handles incoming Telegram webhook events
 */
@Injectable()
export class TelegramEventsService {
  private readonly logger = new Logger(TelegramEventsService.name);

  constructor(private readonly telegramIntegrationService: TelegramIntegrationService) {}

  /**
   * Handle incoming update
   */
  async handleUpdate(update: TelegramUpdate): Promise<void> {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.callbackQuery) {
        await this.handleCallbackQuery(update.callbackQuery);
      } else if (update.editedMessage) {
        await this.handleEditedMessage(update.editedMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to handle update: ${errorMessage}`);
    }
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: TelegramIncomingMessage): Promise<void> {
    const { text, from, chat } = message;

    if (!text) {
      return;
    }

    // Handle commands
    if (text.startsWith('/')) {
      await this.handleCommand(text, from, String(chat.id));
    } else {
      // Handle regular messages
      this.logger.debug(`Received message from ${from.id}: ${text}`);
    }
  }

  /**
   * Handle command
   */
  private async handleCommand(command: string, from: TelegramUser, chatId: string): Promise<void> {
    const [cmd] = command.split(' ');

    switch (cmd) {
      case '/start':
        await this.handleStartCommand(from, chatId);
        break;
      case '/help':
        await this.handleHelpCommand(chatId);
        break;
      case '/status':
        await this.handleStatusCommand(chatId);
        break;
      default:
        this.logger.debug(`Unknown command: ${cmd}`);
    }
  }

  /**
   * Handle /start command
   */
  private async handleStartCommand(from: TelegramUser, chatId: string): Promise<void> {
    try {
      // Create or update integration
      await this.telegramIntegrationService.createIntegration(
        from.id.toString(),
        chatId.toString(),
        from.username,
        from.firstName,
        from.lastName
      );

      const message: '👋 Welcome! Your Telegram integration is now active.\n\nUse /help to see available commands.' = `👋 Welcome! Your Telegram integration is now active.\n\nUse /help to see available commands.`;
      await this.telegramIntegrationService.sendNotification(from.id.toString(), message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to handle start command: ${errorMessage}`);
    }
  }

  /**
   * Handle /help command
   */
  private async handleHelpCommand(chatId: string): Promise<void> {
    // Note: We need userId to send notification, but we only have chatId here
    // This is a simplified version - in production, you'd look up userId by chatId
    this.logger.debug(`Help command requested for chat ${chatId}`);
  }

  /**
   * Handle /status command
   */
  private async handleStatusCommand(chatId: string): Promise<void> {
    this.logger.debug(`Status command requested for chat ${chatId}`);
  }

  /**
   * Handle callback query (button clicks)
   */
  private async handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
    try {
      const { id, data, message } = callbackQuery;

      if (!data || !message) {
        return;
      }

      // Handle approval callbacks
      if (data.startsWith('approve:') || data.startsWith('reject:')) {
        const result = await this.telegramIntegrationService.handleApprovalCallback(
          id,
          data,
          message.chat.id.toString(),
          message.messageId
        );

        this.logger.log(
          `Approval handled: ${result.approved ? 'approved' : 'rejected'} for request ${
            result.requestId
          }}`
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to handle callback query: ${errorMessage}`);
    }
  }

  /**
   * Handle edited message
   */
  private async handleEditedMessage(message: TelegramIncomingMessage): Promise<void> {
    this.logger.debug(`Message edited: ${message.messageId}`);
  }
}
