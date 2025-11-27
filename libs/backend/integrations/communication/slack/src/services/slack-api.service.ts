import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { SlackConfig, SlackMessage, SlackUser } from '../interfaces/slack-config.interface';
import type {
  ChatDeleteResponse,
  ChatPostMessageResponse,
  ChatUpdateResponse,
  ConversationsCreateResponse,
  ConversationsHistoryResponse,
  ConversationsJoinResponse,
  ConversationsListResponse,
  FilesUploadResponse,
  ReactionsAddResponse,
} from '../types/slack-api-types';
import {
  isChatDeleteResponse,
  isChatPostMessageResponse,
  isChatUpdateResponse,
  isConversationsCreateResponse,
  isConversationsHistoryResponse,
  isConversationsJoinResponse,
  isConversationsListResponse,
  isFilesUploadResponse,
  isReactionsAddResponse,
  isUsersInfoResponse,
} from '../types/slack-api-types';

@Injectable()
export class SlackApiService {
  private readonly logger = new Logger(SlackApiService.name);
  private readonly slackApiUrl = 'https://slack.com/api';
  private config: SlackConfig;

  constructor(
    private readonly httpService: HttpService,
    @Inject('SLACK_CONFIG') config: SlackConfig
  ) {
    this.config = config;
  }

  /**
   * Send a message to a Slack channel
   */
  async sendMessage(message: SlackMessage): Promise<ChatPostMessageResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.slackApiUrl}/chat.postMessage`, message, {
          headers: {
            Authorization: `Bearer ${this.config.botToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isChatPostMessageResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to send message: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user information
   */
  async getUser(userId: string): Promise<SlackUser> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.slackApiUrl}/users.info`, {
          params: { user: userId },
          headers: {
            Authorization: `Bearer ${this.config.botToken}`,
          },
        })
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isUsersInfoResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      const user = response.data.user;
      const slackUser: SlackUser = {
        id: user.id,
        name: user.name,
        realName: user.real_name,
      };
      if (user.profile?.email !== undefined) {
        slackUser.email = user.profile.email;
      }
      if (user.profile?.image_72 !== undefined) {
        slackUser.picture = user.profile.image_72;
      }
      return slackUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get user info: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create a channel
   */
  async createChannel(
    channelName: string,
    isPrivate = false
  ): Promise<ConversationsCreateResponse['channel']> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.slackApiUrl}/${isPrivate ? 'conversations.create' : 'conversations.create'}`,
          {
            name: channelName,
            is_private: isPrivate,
          },
          {
            headers: {
              Authorization: `Bearer ${this.config.botToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isConversationsCreateResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      if (!response.data.channel) {
        throw new Error('Channel not returned in response');
      }
      return response.data.channel;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create channel: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Join a channel
   */
  async joinChannel(channelId: string): Promise<ConversationsJoinResponse['channel']> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.slackApiUrl}/conversations.join`,
          { channel: channelId },
          {
            headers: {
              Authorization: `Bearer ${this.config.botToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isConversationsJoinResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      if (!response.data.channel) {
        throw new Error('Channel not returned in response');
      }
      return response.data.channel;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to join channel: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * List user channels
   */
  async listChannels(): Promise<ConversationsListResponse['channels']> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.slackApiUrl}/conversations.list`, {
          headers: {
            Authorization: `Bearer ${this.config.botToken}`,
          },
          params: {
            limit: 100,
            types: 'public_channel,private_channel,mpim,im',
          },
        })
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isConversationsListResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      return response.data.channels ?? [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to list channels: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Send reaction to a message
   */
  async addReaction(
    emoji: string,
    channel: string,
    timestamp: string
  ): Promise<ReactionsAddResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.slackApiUrl}/reactions.add`,
          {
            name: emoji,
            channel,
            timestamp,
          },
          {
            headers: {
              Authorization: `Bearer ${this.config.botToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isReactionsAddResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to add reaction: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Update a message
   */
  async updateMessage(
    channel: string,
    timestamp: string,
    text: string
  ): Promise<ChatUpdateResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.slackApiUrl}/chat.update`,
          {
            channel,
            ts: timestamp,
            text,
          },
          {
            headers: {
              Authorization: `Bearer ${this.config.botToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isChatUpdateResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update message: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(channel: string, timestamp: string): Promise<ChatDeleteResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.slackApiUrl}/chat.delete`,
          {
            channel,
            ts: timestamp,
          },
          {
            headers: {
              Authorization: `Bearer ${this.config.botToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isChatDeleteResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to delete message: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Upload file to Slack
   */
  async uploadFile(
    filePath: string,
    filename: string,
    channels: string[]
  ): Promise<FilesUploadResponse['file']> {
    try {
      const FormData = require('form-data');
      const fs = require('fs');
      const form = new FormData();

      form.append('file', fs.createReadStream(filePath));
      form.append('filename', filename);
      form.append('channels', channels.join(','));

      const response = await firstValueFrom(
        this.httpService.post(`${this.slackApiUrl}/files.upload`, form, {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.config.botToken}`,
          },
        })
      );

      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      if (!isFilesUploadResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      if (!response.data.file) {
        throw new Error('File not returned in response');
      }
      return response.data.file;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to upload file: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    channel: string,
    limit = 50
  ): Promise<ConversationsHistoryResponse['messages']> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.slackApiUrl}/conversations.history`, {
          params: { channel, limit },
          headers: {
            Authorization: `Bearer ${this.config.botToken}`,
          },
        })
      );
      if (!isConversationsHistoryResponse(response.data)) {
        throw new Error('Invalid response format from Slack API');
      }

      return response.data.messages ?? [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get conversation history: ${errorMessage}`);
    }
  }
}
