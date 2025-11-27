export interface SlackConfig {
  botToken: string;
  signingSecret: string;
  appId?: string;
  defaultChannelId?: string;
}

export interface SlackUser {
  id: string;
  email?: string;
  name?: string;
  realName?: string;
  picture?: string;
}

import { SlackBlock } from './slack-blocks.interface';

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  threadTs?: string;
  replyBroadcast?: boolean;
  metadata?: {
    eventType: string;
    eventPayload: Record<
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
  };
}

import { SlackAction, SlackView } from './slack-interactions.interface';

export interface SlackInteractionPayload {
  type: string;
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  team: {
    id: string;
    domain: string;
  };
  channel?: {
    id: string;
    name: string;
  };
  trigger_id: string;
  response_url?: string;
  actions?: SlackAction[];
  view?: SlackView;
}

import { SlackEvent } from './slack-events.interface';

export interface SlackEventPayload {
  token: string;
  team_id: string;
  api_app_id: string;
  event: SlackEvent;
  type: string;
  event_id: string;
  event_time: number;
  challenge?: string;
}

export interface SlackIntegrationRecord {
  id: string;
  userId: string;
  workspaceId?: string;
  teamId: string;
  channelId?: string;
  slackUserId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
