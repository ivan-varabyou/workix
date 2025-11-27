// Prisma service interfaces for Slack integration

import { PrismaClient } from '@prisma/client';

import { SlackIntegrationRecord } from './slack-config.interface';

export interface SlackPrismaService extends PrismaClient {
  slackIntegration: {
    create: (args: { data: SlackIntegrationCreateData }) => Promise<SlackIntegrationRecord>;
    findFirst: (args: {
      where: { userId?: string; teamId?: string; isActive?: boolean };
    }) => Promise<SlackIntegrationRecord | null>;
    findMany: (args?: {
      where?: { teamId?: string; isActive?: boolean };
    }) => Promise<SlackIntegrationRecord[]>;
    update: (args: {
      where: { id: string };
      data: Partial<SlackIntegrationRecord>;
    }) => Promise<SlackIntegrationRecord>;
  };
  slackMessage?: {
    create: (args: { data: SlackMessageCreateData }) => Promise<SlackMessage>;
    findMany: (args?: {
      where?: SlackMessageWhereInput;
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<SlackMessage[]>;
    count: (args?: { where?: SlackMessageWhereInput }) => Promise<number>;
  };
  slackMention?: {
    create: (args: { data: SlackMentionCreateData }) => Promise<SlackMention>;
  };
  slackReaction?: {
    create: (args: { data: SlackReactionCreateData }) => Promise<SlackReaction>;
    count: (args?: { where?: { channelId?: string; teamId?: string } }) => Promise<number>;
  };
  slackChannelMember?: {
    create: (args: { data: SlackChannelMemberCreateData }) => Promise<SlackChannelMember>;
    updateMany: (args: {
      where: SlackChannelMemberWhereInput;
      data: { status: string };
    }) => Promise<{ count: number }>;
    count: (args?: { where?: SlackChannelMemberWhereInput }) => Promise<number>;
  };
}

/**
 * Metadata type for Slack events
 */
export type SlackEventMetadata = Record<
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
>;

export interface SlackIntegrationCreateData {
  userId: string;
  teamId: string;
  slackUserId: string;
  accessToken: string;
  channelId?: string | null;
  isActive: boolean;
}

export interface SlackMessage {
  id: string;
  teamId: string;
  userId: string;
  channelId: string;
  messageText: string;
  messageTs: string;
  threadTs?: string | null;
  metadata?: SlackEventMetadata | null;
  createdAt: Date;
}

export interface SlackMessageCreateData {
  teamId: string;
  userId: string;
  channelId: string;
  messageText: string;
  messageTs: string;
  threadTs?: string | null;
  metadata?: SlackEventMetadata | null;
}

export interface SlackMessageWhereInput {
  userId?: string;
  teamId?: string;
  channelId?: string;
}

export interface SlackMention {
  id: string;
  teamId: string;
  userId: string;
  channelId: string;
  messageText: string;
  messageTs: string;
  createdAt: Date;
}

export interface SlackMentionCreateData {
  teamId: string;
  userId: string;
  channelId: string;
  messageText: string;
  messageTs: string;
}

export interface SlackReaction {
  id: string;
  teamId: string;
  userId: string;
  channelId: string;
  messageTs: string;
  emoji: string;
  createdAt: Date;
}

export interface SlackReactionCreateData {
  teamId: string;
  userId: string;
  channelId: string;
  messageTs: string;
  emoji: string;
}

export interface SlackChannelMember {
  id: string;
  teamId: string;
  userId: string;
  channelId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlackChannelMemberCreateData {
  teamId: string;
  userId: string;
  channelId: string;
  status: string;
}

export interface SlackChannelMemberWhereInput {
  teamId?: string;
  userId?: string;
  channelId?: string;
  status?: string;
}
