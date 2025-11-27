import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

import { SlackBlock } from '../interfaces/slack-blocks.interface';
import { SlackEvent } from '../interfaces/slack-events.interface';

export class SlackIntegrationDto {
  @IsString()
  teamId?: string;

  @IsString()
  slackUserId?: string;

  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  channelId?: string;
}

export class SlackMessageDto {
  @IsString()
  channel?: string;

  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  blocks?: SlackBlock[];

  @IsOptional()
  @IsString()
  threadTs?: string;

  @IsOptional()
  @IsBoolean()
  replyBroadcast?: boolean;
}

export class SlackNotificationDto {
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  channel?: string;
}

export class SlackFormattedNotificationDto {
  @IsArray()
  blocks?: SlackBlock[];

  @IsOptional()
  @IsString()
  channel?: string;
}

export class SlackEventDto {
  @IsString()
  token?: string;

  @IsString()
  team_id?: string;

  @IsString()
  api_app_id?: string;

  event?: SlackEvent;

  @IsString()
  type?: string;

  @IsString()
  event_id?: string;

  @IsOptional()
  @IsString()
  challenge?: string;
}

export class SlackWorkflowNotificationDto {
  @IsString()
  workflowId?: string;

  @IsString()
  eventType?: string;

  @IsOptional()
  data?: Record<
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
}

export class SlackPipelineNotificationDto {
  @IsString()
  pipelineId?: string;

  @IsString()
  status?: 'started' | 'completed' | 'failed';

  @IsOptional()
  duration?: number;

  @IsOptional()
  @IsString()
  error?: string;
}

export class SlackIntegrationResponseDto {
  id: string;
  userId: string;
  teamId: string;
  slackUserId: string;
  channelId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    teamId: string,
    slackUserId: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    channelId?: string
  ) {
    this.id = id;
    this.userId = userId;
    this.teamId = teamId;
    this.slackUserId = slackUserId;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    if (channelId !== undefined) {
      this.channelId = channelId;
    }
  }
}

export class SlackIntegrationStatsDto {
  integration: {
    id: string;
    teamId: string;
    channelId?: string;
    isActive: boolean;
    createdAt: Date;
  };
  stats: {
    messagesSent: number;
  };

  constructor(
    integration: {
      id: string;
      teamId: string;
      channelId?: string;
      isActive: boolean;
      createdAt: Date;
    },
    stats: {
      messagesSent: number;
    }
  ) {
    this.integration = integration;
    this.stats = stats;
  }
}
