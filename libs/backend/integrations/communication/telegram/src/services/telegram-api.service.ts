import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { TelegramConfig } from '../interfaces/telegram-config.interface';
import type {
  TelegramApiResponse,
  TelegramMessageResponse,
  TelegramSendMessageParams,
  TelegramUpdate,
  TelegramUser,
  TelegramWebhookResponse,
} from '../types/telegram-api-types';
import {
  isTelegramApiResponse,
  isTelegramMessageResponse,
  isTelegramUpdate,
  isTelegramUser,
  isTelegramWebhookResponse,
} from '../types/telegram-api-types';

@Injectable()
export class TelegramApiService {
  private readonly logger = new Logger(TelegramApiService.name);
  private readonly telegramApiUrl = 'https://api.telegram.org/bot';
  private config: TelegramConfig;

  constructor(
    private readonly httpService: HttpService,
    @Inject('TELEGRAM_CONFIG') config: TelegramConfig
  ) {
    this.config = config;
  }

  /**
   * Send a message to a Telegram chat
   */
  async sendMessage(params: TelegramSendMessageParams): Promise<TelegramMessageResponse> {
    try {
      const url = `${this.telegramApiUrl}${this.config.botToken}/sendMessage`;
      const payload = {
        chat_id: params.chatId,
        text: params.text,
        parse_mode: params.parseMode,
        reply_markup: params.replyMarkup,
        reply_to_message_id: params.replyToMessageId,
      };

      const response = await firstValueFrom(this.httpService.post(url, payload));

      if (!isTelegramApiResponse<TelegramMessageResponse>(response.data)) {
        throw new Error('Invalid response format from Telegram API');
      }

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description ?? 'Unknown error'}`);
      }

      if (!isTelegramMessageResponse(response.data.result)) {
        throw new Error('Invalid message format from Telegram API');
      }

      return response.data.result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to send message: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Send a message with inline keyboard
   */
  async sendMessageWithKeyboard(
    chatId: string,
    text: string,
    keyboard: Array<Array<{ text: string; callbackData: string }>>
  ): Promise<TelegramMessageResponse> {
    const inlineKeyboard = {
      inline_keyboard: keyboard.map((row) =>
        row.map((button) => ({
          text: button.text,
          callback_data: button.callbackData,
        }))
      ),
    };

    return await this.sendMessage({
      chatId,
      text,
      replyMarkup: inlineKeyboard,
    });
  }

  /**
   * Answer callback query
   */
  async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false
  ): Promise<TelegramApiResponse<boolean>> {
    try {
      const url = `${this.telegramApiUrl}${this.config.botToken}/answerCallbackQuery`;
      const payload = {
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      };

      const response = await firstValueFrom(this.httpService.post(url, payload));

      if (!isTelegramApiResponse<boolean>(response.data)) {
        throw new Error('Invalid response format from Telegram API');
      }

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description ?? 'Unknown error'}`);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to answer callback query: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get bot information
   */
  async getMe(): Promise<TelegramUser> {
    try {
      const url = `${this.telegramApiUrl}${this.config.botToken}/getMe`;
      const response = await firstValueFrom(this.httpService.get(url));

      if (!isTelegramApiResponse<TelegramUser>(response.data)) {
        throw new Error('Invalid response format from Telegram API');
      }

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description ?? 'Unknown error'}`);
      }

      if (!isTelegramUser(response.data.result)) {
        throw new Error('Invalid user format from Telegram API');
      }

      return response.data.result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get bot info: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Set webhook
   */
  async setWebhook(url: string, secretToken?: string): Promise<TelegramWebhookResponse> {
    try {
      const webhookUrl = url || this.config.webhookUrl;
      if (!webhookUrl) {
        throw new Error('Webhook URL not provided');
      }

      const telegramUrl = `${this.telegramApiUrl}${this.config.botToken}/setWebhook`;
      const payload: { url: string; secret_token?: string } = {
        url: webhookUrl,
      };

      if (secretToken) {
        payload.secret_token = secretToken;
      }

      const response = await firstValueFrom(this.httpService.post(telegramUrl, payload));

      if (!isTelegramWebhookResponse(response.data)) {
        throw new Error('Invalid response format from Telegram API');
      }

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description ?? 'Unknown error'}`);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to set webhook: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(): Promise<TelegramWebhookResponse> {
    try {
      const url = `${this.telegramApiUrl}${this.config.botToken}/deleteWebhook`;
      const response = await firstValueFrom(this.httpService.post(url, {}));

      if (!isTelegramWebhookResponse(response.data)) {
        throw new Error('Invalid response format from Telegram API');
      }

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description ?? 'Unknown error'}`);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to delete webhook: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get updates (polling mode)
   */
  async getUpdates(offset?: number, limit = 100, timeout = 0): Promise<TelegramUpdate[]> {
    try {
      const url = `${this.telegramApiUrl}${this.config.botToken}/getUpdates`;
      const payload = {
        offset,
        limit,
        timeout,
      };

      const response = await firstValueFrom(this.httpService.post(url, payload));

      if (!isTelegramApiResponse<TelegramUpdate[]>(response.data)) {
        throw new Error('Invalid response format from Telegram API');
      }

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description ?? 'Unknown error'}`);
      }

      if (!Array.isArray(response.data.result)) {
        return [];
      }

      return response.data.result.filter((update): update is TelegramUpdate =>
        isTelegramUpdate(update)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get updates: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Edit message text
   */
  async editMessageText(
    chatId: string,
    messageId: number,
    text: string,
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  ): Promise<TelegramApiResponse<TelegramMessageResponse | boolean>> {
    try {
      const url = `${this.telegramApiUrl}${this.config.botToken}/editMessageText`;
      const payload = {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: parseMode,
      };

      const response = await firstValueFrom(this.httpService.post(url, payload));

      if (!isTelegramApiResponse<TelegramMessageResponse | boolean>(response.data)) {
        throw new Error('Invalid response format from Telegram API');
      }

      if (!response.data.ok) {
        throw new Error(`Telegram API error: ${response.data.description ?? 'Unknown error'}`);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to edit message: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(chatId: string, messageId: number): Promise<TelegramApiResponse<boolean>> {
    try {
      const url = `${this.telegramApiUrl}${this.config.botToken}/deleteMessage`;
      const payload = {
        chat_id: chatId,
        message_id: messageId,
      };

      const response = await firstValueFrom(this.httpService.post(url, payload));

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to delete message: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
