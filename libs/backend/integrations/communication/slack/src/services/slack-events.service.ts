import { Inject, Injectable, Logger } from '@nestjs/common';

import { SlackEventPayload } from '../interfaces/slack-config.interface';
import {
  isSlackMemberJoinedEvent,
  isSlackMemberLeftEvent,
  isSlackMentionEvent,
  isSlackMessageEvent,
  isSlackReactionEvent,
  SlackMemberJoinedEvent,
  SlackMemberLeftEvent,
  SlackMentionEvent,
  SlackMessageEvent,
  SlackReactionEvent,
} from '../interfaces/slack-events.interface';
import { SlackMessageCreateData } from '../interfaces/slack-prisma.interface';
import {
  SlackEventMetadata,
  SlackMessage,
  SlackPrismaService,
} from '../interfaces/slack-prisma.interface';

@Injectable()
export class SlackEventsService {
  private readonly logger = new Logger(SlackEventsService.name);

  constructor(@Inject('PrismaService') private prisma: SlackPrismaService) {}

  /**
   * Handle Slack URL verification challenge
   */
  async handleUrlVerification(challenge: string): Promise<{ challenge: string }> {
    this.logger.log('Handling Slack URL verification challenge');
    return { challenge };
  }

  /**
   * Handle Slack event
   */
  async handleEvent(payload: SlackEventPayload): Promise<void> {
    this.logger.log(`Received Slack event: ${payload.event.type}`);

    const { event, team_id } = payload;

    if (isSlackMessageEvent(event)) {
      await this.handleMessageEvent(event, team_id);
    } else if (isSlackMentionEvent(event)) {
      await this.handleMentionEvent(event, team_id);
    } else if (isSlackReactionEvent(event)) {
      await this.handleReactionEvent(event, team_id);
    } else if (isSlackMemberJoinedEvent(event)) {
      await this.handleMemberJoinedEvent(event, team_id);
    } else if (isSlackMemberLeftEvent(event)) {
      await this.handleMemberLeftEvent(event, team_id);
    } else {
      this.logger.warn(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle message event
   */
  private async handleMessageEvent(event: SlackMessageEvent, teamId: string): Promise<void> {
    this.logger.log(`Message received in channel ${event.channel}`);

    // Store message metadata in database
    if (this.prisma?.slackMessage) {
      try {
        const messageData: SlackMessageCreateData = {
          teamId,
          userId: event.user,
          channelId: event.channel,
          messageText: event.text,
          messageTs: event.ts,
          metadata: this.convertEventToMetadata(event),
        };
        if (event.thread_ts !== undefined) {
          messageData.threadTs = event.thread_ts;
        }
        await this.prisma.slackMessage.create({
          data: messageData,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store message metadata: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle app mention event
   */
  private async handleMentionEvent(event: SlackMentionEvent, teamId: string): Promise<void> {
    this.logger.log(`App mentioned in channel ${event.channel}`);

    // Track mentions for analytics
    if (this.prisma?.slackMention) {
      try {
        await this.prisma.slackMention.create({
          data: {
            teamId,
            userId: event.user,
            channelId: event.channel,
            messageText: event.text,
            messageTs: event.ts,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store mention: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle reaction added event
   */
  private async handleReactionEvent(event: SlackReactionEvent, teamId: string): Promise<void> {
    this.logger.log(`Reaction ${event.reaction} added by ${event.user} in ${event.item.channel}`);

    // Track reactions
    if (this.prisma?.slackReaction) {
      try {
        await this.prisma.slackReaction.create({
          data: {
            teamId,
            userId: event.user,
            channelId: event.item.channel,
            messageTs: event.item.ts,
            emoji: event.reaction,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store reaction: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle member joined channel event
   */
  private async handleMemberJoinedEvent(
    event: SlackMemberJoinedEvent,
    teamId: string
  ): Promise<void> {
    this.logger.log(`Member ${event.user} joined channel ${event.channel}`);

    // Track channel membership
    if (this.prisma?.slackChannelMember) {
      try {
        await this.prisma.slackChannelMember.create({
          data: {
            teamId,
            userId: event.user,
            channelId: event.channel,
            status: 'joined',
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to track channel membership: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle member left channel event
   */
  private async handleMemberLeftEvent(event: SlackMemberLeftEvent, teamId: string): Promise<void> {
    this.logger.log(`Member ${event.user} left channel ${event.channel}`);

    // Update channel membership status
    if (this.prisma?.slackChannelMember) {
      try {
        await this.prisma.slackChannelMember.updateMany({
          where: {
            teamId,
            userId: event.user,
            channelId: event.channel,
          },
          data: {
            status: 'left',
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to update channel membership: ${errorMessage}`);
      }
    }
  }

  /**
   * Get event history for a user
   */
  async getEventHistory(userId: string, teamId: string, limit = 100): Promise<SlackMessage[]> {
    try {
      if (!this.prisma?.slackMessage) {
        return [];
      }

      return await this.prisma.slackMessage.findMany({
        where: {
          userId,
          teamId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to fetch event history: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(
    channelId: string,
    teamId: string
  ): Promise<{ messages: number; members: number; reactions: number }> {
    try {
      if (!this.prisma?.slackMessage) {
        return { messages: 0, members: 0, reactions: 0 };
      }

      if (!channelId || !teamId) {
        return { messages: 0, members: 0, reactions: 0 };
      }

      const messageCount =
        (await this.prisma.slackMessage?.count({
          where: { channelId, teamId },
        })) || 0;

      const memberCount =
        (await this.prisma.slackChannelMember?.count({
          where: { channelId, teamId, status: 'joined' },
        })) || 0;

      const reactionCount =
        (await this.prisma.slackReaction?.count({
          where: { channelId, teamId },
        })) || 0;

      return {
        messages: messageCount,
        members: memberCount,
        reactions: reactionCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get channel stats: ${errorMessage}`);
      return { messages: 0, members: 0, reactions: 0 };
    }
  }

  /**
   * Convert Slack event to metadata format
   */
  private convertEventToMetadata(event: SlackMessageEvent): SlackEventMetadata {
    const metadata: SlackEventMetadata = {};

    // Copy all properties except the ones we extract explicitly
    for (const key in event) {
      if (
        key !== 'type' &&
        key !== 'user' &&
        key !== 'text' &&
        key !== 'channel' &&
        key !== 'ts' &&
        key !== 'thread_ts'
      ) {
        const value: unknown = event[key];
        if (this.isValidMetadataValue(value)) {
          metadata[key] = value;
        }
      }
    }

    return metadata;
  }

  /**
   * Type guard to check if value is valid for metadata
   */
  private isValidMetadataValue(value: unknown): value is SlackEventMetadata[string] {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null ||
      value === undefined ||
      value instanceof Date ||
      Array.isArray(value) ||
      (typeof value === 'object' && value !== null)
    );
  }
}
