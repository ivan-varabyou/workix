/**
 * Slack API Types
 *
 * Этот файл содержит типы из @slack/web-api и @slack/types
 * После установки пакетов эти типы будут импортироваться из библиотек
 */

// TODO: После установки @slack/web-api заменить на:
// import type { WebClient } from '@slack/web-api';
// import type {
//   ChatPostMessageResponse,
//   ConversationsCreateResponse,
//   ConversationsJoinResponse,
//   ConversationsListResponse,
//   ReactionsAddResponse,
//   ChatUpdateResponse,
//   ChatDeleteResponse,
//   FilesUploadResponse,
//   ConversationsHistoryResponse,
//   UsersInfoResponse,
// } from '@slack/web-api';

// Временные типы до установки пакетов
// После установки будут заменены на импорты из @slack/web-api

export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  warning?: string;
  response_metadata?: {
    next_cursor?: string;
    warnings?: string[];
  };
}

export interface ChatPostMessageResponse extends SlackApiResponse {
  channel: string;
  ts: string;
  message: {
    text?: string;
    user?: string;
    ts?: string;
    type?: string;
    subtype?: string;
    blocks?: unknown[];
    [key: string]: unknown;
  };
}

export interface ConversationsCreateResponse extends SlackApiResponse {
  channel: {
    id: string;
    name: string;
    is_channel: boolean;
    is_group: boolean;
    is_im: boolean;
    created: number;
    is_archived: boolean;
    is_general: boolean;
    unlinked: number;
    name_normalized: string;
    is_shared: boolean;
    is_org_shared: boolean;
    is_member: boolean;
    is_private: boolean;
    is_mpim: boolean;
    topic: {
      value: string;
      creator: string;
      last_set: number;
    };
    purpose: {
      value: string;
      creator: string;
      last_set: number;
    };
    previous_names: string[];
    num_members: number;
    [key: string]: unknown;
  };
}

export interface ConversationsJoinResponse extends SlackApiResponse {
  channel: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
}

export interface ConversationsListResponse extends SlackApiResponse {
  channels: Array<{
    id: string;
    name: string;
    is_channel: boolean;
    is_group: boolean;
    is_im: boolean;
    created: number;
    is_archived: boolean;
    is_general: boolean;
    unlinked: number;
    name_normalized: string;
    is_shared: boolean;
    is_org_shared: boolean;
    is_member: boolean;
    is_private: boolean;
    is_mpim: boolean;
    topic: {
      value: string;
      creator: string;
      last_set: number;
    };
    purpose: {
      value: string;
      creator: string;
      last_set: number;
    };
    previous_names: string[];
    num_members: number;
    [key: string]: unknown;
  }>;
}

export type ReactionsAddResponse = SlackApiResponse;

export interface ChatUpdateResponse extends SlackApiResponse {
  channel: string;
  ts: string;
  text: string;
  message: {
    text?: string;
    user?: string;
    ts?: string;
    type?: string;
    [key: string]: unknown;
  };
}

export interface ChatDeleteResponse extends SlackApiResponse {
  channel: string;
  ts: string;
}

export interface FilesUploadResponse extends SlackApiResponse {
  file: {
    id: string;
    created: number;
    timestamp: number;
    name: string;
    title: string;
    mimetype: string;
    filetype: string;
    pretty_type: string;
    user: string;
    editable: boolean;
    size: number;
    mode: string;
    is_external: boolean;
    external_type: string;
    is_public: boolean;
    public_url_shared: boolean;
    display_as_bot: boolean;
    username: string;
    url_private: string;
    url_private_download: string;
    permalink: string;
    permalink_public: string;
    channels: string[];
    groups: string[];
    ims: string[];
    comments_count: number;
    [key: string]: unknown;
  };
}

export interface ConversationsHistoryResponse extends SlackApiResponse {
  messages: Array<{
    type: string;
    user?: string;
    text?: string;
    ts: string;
    thread_ts?: string;
    reply_count?: number;
    replies?: Array<{
      user: string;
      ts: string;
    }>;
    [key: string]: unknown;
  }>;
  has_more: boolean;
  pin_count: number;
  response_metadata?: {
    next_cursor?: string;
  };
}

export interface UsersInfoResponse extends SlackApiResponse {
  user: {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: {
      title: string;
      phone: string;
      skype: string;
      real_name: string;
      real_name_normalized: string;
      display_name: string;
      display_name_normalized: string;
      fields: Record<string, unknown>;
      status_text: string;
      status_emoji: string;
      status_emoji_display_info: unknown[];
      status_expiration: number;
      avatar_hash: string;
      image_original: string;
      is_custom_image: boolean;
      email?: string;
      first_name?: string;
      last_name?: string;
      image_24?: string;
      image_32?: string;
      image_48?: string;
      image_72?: string;
      image_192?: string;
      image_512?: string;
      image_1024?: string;
      status_text_canonical: string;
      team: string;
      [key: string]: unknown;
    };
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_app_user: boolean;
    updated: number;
    is_email_confirmed: boolean;
    who_can_share_contact_card: string;
    [key: string]: unknown;
  };
}

/**
 * Type guards for Slack API responses
 */
export function isSlackApiResponse(data: unknown): data is SlackApiResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('ok' in data)) {
    return false;
  }
  const okValue = (data as Record<string, unknown>).ok;
  return typeof okValue === 'boolean';
}

export function isChatPostMessageResponse(data: unknown): data is ChatPostMessageResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as { channel?: unknown; ts?: unknown; message?: unknown };
  return (
    typeof obj.channel === 'string' &&
    typeof obj.ts === 'string' &&
    typeof obj.message === 'object' &&
    obj.message !== null
  );
}

export function isConversationsCreateResponse(data: unknown): data is ConversationsCreateResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('channel' in data)) {
    return false;
  }
  const channel = (data as { channel?: unknown }).channel;
  if (typeof channel !== 'object' || channel === null) {
    return false;
  }
  return 'id' in channel && typeof (channel as { id?: unknown }).id === 'string';
}

export function isConversationsJoinResponse(data: unknown): data is ConversationsJoinResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('channel' in data)) {
    return false;
  }
  const channel = (data as { channel?: unknown }).channel;
  if (typeof channel !== 'object' || channel === null) {
    return false;
  }
  return 'id' in channel && typeof (channel as { id?: unknown }).id === 'string';
}

export function isConversationsListResponse(data: unknown): data is ConversationsListResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('channels' in data)) {
    return false;
  }
  const channels = (data as { channels?: unknown }).channels;
  return Array.isArray(channels);
}

export function isReactionsAddResponse(data: unknown): data is ReactionsAddResponse {
  return isSlackApiResponse(data);
}

export function isChatUpdateResponse(data: unknown): data is ChatUpdateResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as { channel?: unknown; ts?: unknown; text?: unknown };
  return (
    typeof obj.channel === 'string' && typeof obj.ts === 'string' && typeof obj.text === 'string'
  );
}

export function isChatDeleteResponse(data: unknown): data is ChatDeleteResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as { channel?: unknown; ts?: unknown };
  return typeof obj.channel === 'string' && typeof obj.ts === 'string';
}

export function isFilesUploadResponse(data: unknown): data is FilesUploadResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('file' in data)) {
    return false;
  }
  const file = (data as { file?: unknown }).file;
  if (typeof file !== 'object' || file === null) {
    return false;
  }
  return 'id' in file && typeof (file as { id?: unknown }).id === 'string';
}

export function isConversationsHistoryResponse(
  data: unknown
): data is ConversationsHistoryResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('messages' in data)) {
    return false;
  }
  const messages = (data as { messages?: unknown }).messages;
  return Array.isArray(messages);
}

export function isUsersInfoResponse(data: unknown): data is UsersInfoResponse {
  if (!isSlackApiResponse(data)) {
    return false;
  }
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  if (!('user' in data)) {
    return false;
  }
  const user = (data as { user?: unknown }).user;
  if (typeof user !== 'object' || user === null) {
    return false;
  }
  return 'id' in user && typeof (user as { id?: unknown }).id === 'string';
}
