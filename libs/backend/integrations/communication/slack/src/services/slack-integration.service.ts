import { Inject, Injectable, Logger } from '@nestjs/common';

import { SlackBlock } from '../interfaces/slack-blocks.interface';
import { SlackIntegrationRecord } from '../interfaces/slack-config.interface';
import { SlackPrismaService } from '../interfaces/slack-prisma.interface';
import type { ChatPostMessageResponse } from '../types/slack-api-types';
import { SlackApiService } from './slack-api.service';

@Injectable()
export class SlackIntegrationService {
  private readonly logger = new Logger(SlackIntegrationService.name);

  constructor(
    private readonly slackApiService: SlackApiService,
    @Inject('PrismaService') private prisma: SlackPrismaService
  ) {}

  /**
   * Create Slack integration for a user
   */
  async createIntegration(
    userId: string,
    teamId: string,
    slackUserId: string,
    accessToken: string,
    channelId?: string
  ): Promise<SlackIntegrationRecord> {
    try {
      const integration = await this.prisma.slackIntegration.create({
        data: {
          userId,
          teamId,
          slackUserId,
          accessToken,
          channelId: channelId || null,
          isActive: true,
        },
      });

      this.logger.log(`Slack integration created for user ${userId}`);
      return integration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create Slack integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration by user ID
   */
  async getIntegration(userId: string): Promise<SlackIntegrationRecord | null> {
    try {
      return await this.prisma.slackIntegration.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get Slack integration: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Get integration by team ID
   */
  async getIntegrationByTeam(teamId: string): Promise<SlackIntegrationRecord[]> {
    try {
      return await this.prisma.slackIntegration.findMany({
        where: {
          teamId,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get team integrations: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    data: Partial<SlackIntegrationRecord>
  ): Promise<SlackIntegrationRecord> {
    try {
      return await this.prisma.slackIntegration.update({
        where: { id: integrationId },
        data,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update Slack integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Deactivate integration
   */
  async deactivateIntegration(integrationId: string): Promise<void> {
    try {
      await this.prisma.slackIntegration.update({
        where: { id: integrationId },
        data: { isActive: false },
      });

      this.logger.log(`Slack integration deactivated: ${integrationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to deactivate integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Send notification to Slack
   */
  async sendNotification(
    userId: string,
    message: string,
    channel?: string
  ): Promise<ChatPostMessageResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Slack integration not found');
      }

      const targetChannel = channel || integration.channelId;

      if (!targetChannel) {
        throw new Error('No channel specified');
      }

      return await this.slackApiService.sendMessage({
        channel: targetChannel,
        text: message,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to send notification: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Send formatted notification with blocks
   */
  async sendFormattedNotification(
    userId: string,
    blocks: SlackBlock[],
    channel?: string
  ): Promise<ChatPostMessageResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Slack integration not found');
      }

      const targetChannel = channel || integration.channelId;

      if (!targetChannel) {
        throw new Error('No channel specified');
      }

      return await this.slackApiService.sendMessage({
        channel: targetChannel,
        text: 'Notification',
        blocks,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to send formatted notification: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Send workflow trigger notification
   */
  async notifyWorkflowEvent(
    userId: string,
    workflowId: string,
    eventType: string,
    data: Record<
      string,
      | string
      | number
      | boolean
      | Date
      | string[]
      | number[]
      | Record<string, string | number | boolean>
      | null
      | undefined
    >
  ): Promise<void> {
    try {
      const blocks: SlackBlock[] = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Workflow: ${eventType.toUpperCase()}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Workflow ID:*\n${workflowId}`,
            },
            {
              type: 'mrkdwn',
              text: `*Event:*\n${eventType}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Details:*\n\`\`\`${JSON.stringify(data, null, 2)}\`\`\``,
          },
        },
      ];

      await this.sendFormattedNotification(userId, blocks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to notify workflow event: ${errorMessage}`);
    }
  }

  /**
   * Send pipeline execution notification
   */
  async notifyPipelineExecution(
    userId: string,
    pipelineId: string,
    status: 'started' | 'completed' | 'failed',
    duration?: number,
    error?: string
  ): Promise<void> {
    try {
      const blocks: SlackBlock[] = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Pipeline Execution ${status.toUpperCase()}*`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Pipeline ID:*\n${pipelineId}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n${status}`,
            },
          ],
        },
      ];

      if (duration) {
        blocks.push({
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${duration}ms`,
            },
          ],
        });
      }

      if (error) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error:*\n\`\`\`${error}\`\`\``,
          },
        });
      }

      await this.sendFormattedNotification(userId, blocks);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to notify pipeline execution: ${errorMessage}`);
    }
  }

  /**
   * Get integration stats
   */
  async getIntegrationStats(userId: string): Promise<{
    integration: {
      id: string;
      teamId: string;
      channelId?: string | null;
      isActive: boolean;
      createdAt: Date;
    };
    stats: {
      messagesSent: number;
    };
  } | null> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        return null;
      }

      const messagesSent =
        (await this.prisma.slackMessage?.count({
          where: {
            userId: integration.slackUserId,
            teamId: integration.teamId,
          },
        })) || 0;

      const integrationData: {
        id: string;
        teamId: string;
        channelId?: string | null;
        isActive: boolean;
        createdAt: Date;
      } = {
        id: integration.id,
        teamId: integration.teamId,
        isActive: integration.isActive,
        createdAt: integration.createdAt,
      };
      if (integration.channelId !== undefined) {
        integrationData.channelId = integration.channelId;
      }
      return {
        integration: integrationData,
        stats: {
          messagesSent,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get stats: ${errorMessage}`);
      return null;
    }
  }
}
