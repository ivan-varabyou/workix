// Slack event interfaces
// Note: После установки @slack/types можно заменить на типы из пакета

/**
 * Base Slack event interface
 * TODO: После установки @slack/types заменить на импорт из пакета
 */
export interface SlackEvent {
  type: string;
  user?: string;
  text?: string;
  channel?: string;
  ts?: string;
  thread_ts?: string;
  reaction?: string;
  item?: {
    channel?: string;
    ts?: string;
    [key: string]: string | number | boolean | undefined;
  };
  [key: string]:
    | string
    | number
    | boolean
    | { channel?: string; ts?: string; [key: string]: string | number | boolean | undefined }
    | undefined;
}

// TODO: После установки @slack/types использовать:
// import type { SlackEvent, MessageEvent, AppMentionEvent, ReactionAddedEvent } from '@slack/types';

export interface SlackMessageEvent extends SlackEvent {
  type: 'message';
  user: string;
  text: string;
  channel: string;
  ts: string;
  thread_ts?: string;
}

export interface SlackMentionEvent extends SlackEvent {
  type: 'app_mention';
  user: string;
  text: string;
  channel: string;
  ts: string;
}

export interface SlackReactionEvent extends SlackEvent {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item: {
    channel: string;
    ts: string;
  };
}

export interface SlackMemberJoinedEvent extends SlackEvent {
  type: 'member_joined_channel';
  user: string;
  channel: string;
}

export interface SlackMemberLeftEvent extends SlackEvent {
  type: 'member_left_channel';
  user: string;
  channel: string;
}

/**
 * Type guard to check if event is SlackMessageEvent
 */
export function isSlackMessageEvent(event: SlackEvent): event is SlackMessageEvent {
  return (
    event.type === 'message' &&
    typeof event.user === 'string' &&
    typeof event.text === 'string' &&
    typeof event.channel === 'string' &&
    typeof event.ts === 'string'
  );
}

/**
 * Type guard to check if event is SlackMentionEvent
 */
export function isSlackMentionEvent(event: SlackEvent): event is SlackMentionEvent {
  return (
    event.type === 'app_mention' &&
    typeof event.user === 'string' &&
    typeof event.text === 'string' &&
    typeof event.channel === 'string' &&
    typeof event.ts === 'string'
  );
}

/**
 * Type guard to check if event is SlackReactionEvent
 */
export function isSlackReactionEvent(event: SlackEvent): event is SlackReactionEvent {
  return (
    event.type === 'reaction_added' &&
    typeof event.user === 'string' &&
    typeof event.reaction === 'string' &&
    event.item !== undefined &&
    typeof event.item.channel === 'string' &&
    typeof event.item.ts === 'string'
  );
}

/**
 * Type guard to check if event is SlackMemberJoinedEvent
 */
export function isSlackMemberJoinedEvent(event: SlackEvent): event is SlackMemberJoinedEvent {
  return (
    event.type === 'member_joined_channel' &&
    typeof event.user === 'string' &&
    typeof event.channel === 'string'
  );
}

/**
 * Type guard to check if event is SlackMemberLeftEvent
 */
export function isSlackMemberLeftEvent(event: SlackEvent): event is SlackMemberLeftEvent {
  return (
    event.type === 'member_left_channel' &&
    typeof event.user === 'string' &&
    typeof event.channel === 'string'
  );
}
