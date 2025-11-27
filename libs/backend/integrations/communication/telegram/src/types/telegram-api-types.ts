/**
 * Telegram API Types
 *
 * Этот файл содержит типы из @types/node-telegram-bot-api
 * После установки пакетов эти типы будут импортироваться из библиотек
 */

// TODO: После установки @types/node-telegram-bot-api заменить на:
// import type {
//   Message,
//   User,
//   Update,
//   CallbackQuery,
//   InlineKeyboardMarkup,
//   ReplyKeyboardMarkup,
// } from 'node-telegram-bot-api';

// Временные типы до установки пакетов
// После установки будут заменены на импорты из node-telegram-bot-api

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
  [key: string]: unknown;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo?: {
    small_file_id: string;
    small_file_unique_id: string;
    big_file_id: string;
    big_file_unique_id: string;
  };
  bio?: string;
  description?: string;
  invite_link?: string;
  pinned_message?: TelegramMessage;
  permissions?: {
    can_send_messages?: boolean;
    can_send_audios?: boolean;
    can_send_documents?: boolean;
    can_send_photos?: boolean;
    can_send_videos?: boolean;
    can_send_video_notes?: boolean;
    can_send_voice_notes?: boolean;
    can_send_polls?: boolean;
    can_send_other_messages?: boolean;
    can_add_web_page_previews?: boolean;
    can_change_info?: boolean;
    can_invite_users?: boolean;
    can_pin_messages?: boolean;
    can_manage_topics?: boolean;
  };
  slow_mode_delay?: number;
  message_auto_delete_time?: number;
  has_private_forwards?: boolean;
  has_restricted_voice_and_video_messages?: boolean;
  join_to_send_messages?: boolean;
  join_by_request?: boolean;
  has_protected_content?: boolean;
  sticker_set_name?: string;
  can_set_sticker_set?: boolean;
  linked_chat_id?: number;
  location?: {
    location: {
      longitude: number;
      latitude: number;
    };
    address: string;
  };
  [key: string]: unknown;
}

export interface TelegramMessage {
  message_id: number;
  message_thread_id?: number;
  from?: TelegramUser;
  sender_chat?: TelegramChat;
  date: number;
  chat: TelegramChat;
  forward_from?: TelegramUser;
  forward_from_chat?: TelegramChat;
  forward_from_message_id?: number;
  forward_signature?: string;
  forward_sender_name?: string;
  forward_date?: number;
  is_automatic_forward?: boolean;
  reply_to_message?: TelegramMessage;
  via_bot?: TelegramUser;
  edit_date?: number;
  has_protected_content?: boolean;
  media_group_id?: string;
  author_signature?: string;
  text?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
    url?: string;
    user?: TelegramUser;
    language?: string;
    custom_emoji_id?: string;
  }>;
  animation?: unknown;
  audio?: unknown;
  document?: unknown;
  photo?: Array<{
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    width: number;
    height: number;
  }>;
  sticker?: unknown;
  video?: unknown;
  video_note?: unknown;
  voice?: unknown;
  caption?: string;
  caption_entities?: Array<{
    type: string;
    offset: number;
    length: number;
    url?: string;
    user?: TelegramUser;
    language?: string;
    custom_emoji_id?: string;
  }>;
  contact?: unknown;
  dice?: unknown;
  game?: unknown;
  poll?: unknown;
  venue?: unknown;
  location?: {
    longitude: number;
    latitude: number;
    horizontal_accuracy?: number;
    live_period?: number;
    heading?: number;
    proximity_alert_radius?: number;
  };
  new_chat_members?: TelegramUser[];
  left_chat_member?: TelegramUser;
  new_chat_title?: string;
  new_chat_photo?: Array<{
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    width: number;
    height: number;
  }>;
  delete_chat_photo?: boolean;
  group_chat_created?: boolean;
  supergroup_chat_created?: boolean;
  channel_chat_created?: boolean;
  message_auto_delete_timer_changed?: {
    message_auto_delete_time: number;
  };
  migrate_to_chat_id?: number;
  migrate_from_chat_id?: number;
  pinned_message?: TelegramMessage;
  invoice?: unknown;
  successful_payment?: unknown;
  user_shared?: {
    request_id: number;
    user_id: number;
  };
  chat_shared?: {
    request_id: number;
    chat_id: number;
  };
  connected_website?: string;
  write_access_allowed?: unknown;
  passport_data?: unknown;
  proximity_alert_triggered?: {
    traveler: TelegramUser;
    watcher: TelegramUser;
    distance: number;
  };
  forum_topic_created?: {
    name: string;
    icon_color: number;
    icon_custom_emoji_id?: string;
  };
  forum_topic_edited?: {
    name?: string;
    icon_custom_emoji_id?: string;
  };
  forum_topic_closed?: unknown;
  forum_topic_reopened?: unknown;
  general_forum_topic_hidden?: unknown;
  general_forum_topic_unhidden?: unknown;
  video_chat_scheduled?: {
    start_date: number;
  };
  video_chat_started?: unknown;
  video_chat_ended?: {
    duration: number;
  };
  video_chat_participants_invited?: {
    users: TelegramUser[];
  };
  web_app_data?: {
    data: string;
    button_text: string;
  };
  reply_markup?: {
    inline_keyboard?: Array<
      Array<{
        text: string;
        url?: string;
        callback_data?: string;
        web_app?: unknown;
        login_url?: unknown;
        switch_inline_query?: string;
        switch_inline_query_current_chat?: string;
        callback_game?: unknown;
        pay?: boolean;
      }>
    >;
    keyboard?: Array<
      Array<{
        text: string;
        request_contact?: boolean;
        request_location?: boolean;
        request_poll?: {
          type?: string;
        };
        web_app?: unknown;
      }>
    >;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    input_field_placeholder?: string;
    selective?: boolean;
    remove_keyboard?: boolean;
    force_reply?: boolean;
  };
  [key: string]: unknown;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
  inline_query?: unknown;
  chosen_inline_result?: unknown;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    inline_message_id?: string;
    chat_instance: string;
    data?: string;
    game_short_name?: string;
  };
  shipping_query?: unknown;
  pre_checkout_query?: unknown;
  poll?: unknown;
  poll_answer?: unknown;
  my_chat_member?: {
    chat: TelegramChat;
    from: TelegramUser;
    date: number;
    old_chat_member: {
      status: string;
      user: TelegramUser;
    };
    new_chat_member: {
      status: string;
      user: TelegramUser;
    };
  };
  chat_member?: {
    chat: TelegramChat;
    from: TelegramUser;
    date: number;
    old_chat_member: {
      status: string;
      user: TelegramUser;
    };
    new_chat_member: {
      status: string;
      user: TelegramUser;
    };
  };
  chat_join_request?: {
    chat: TelegramChat;
    from: TelegramUser;
    date: number;
    bio?: string;
    invite_link?: {
      creator: TelegramUser;
      creates_join_request: boolean;
      is_primary: boolean;
      is_revoked: boolean;
      name?: string;
      expires_at?: number;
      member_limit?: number;
      pending_join_request_count?: number;
    };
  };
  [key: string]: unknown;
}

export interface TelegramApiResponse<T = unknown> {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
  parameters?: {
    migrate_to_chat_id?: number;
    retry_after?: number;
  };
}

export interface TelegramMessageResponse {
  message_id: number;
  date: number;
  chat: TelegramChat;
  text?: string;
  [key: string]: unknown;
}

export interface TelegramSendMessageParams {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  replyToMessageId?: number;
  replyMarkup?: {
    inline_keyboard?: Array<
      Array<{
        text: string;
        callback_data: string;
      }>
    >;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface TelegramWebhookResponse {
  ok: boolean;
  result: boolean;
  description?: string;
}

/**
 * Type guards for Telegram API responses
 */
export function isTelegramApiResponse<T = unknown>(data: unknown): data is TelegramApiResponse<T> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.ok === 'boolean' && 'result' in obj;
}

export function isTelegramMessageResponse(data: unknown): data is TelegramMessageResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.message_id === 'number' &&
    typeof obj.date === 'number' &&
    typeof obj.chat === 'object' &&
    obj.chat !== null
  );
}

export function isTelegramUser(data: unknown): data is TelegramUser {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.is_bot === 'boolean' &&
    typeof obj.first_name === 'string'
  );
}

export function isTelegramUpdate(data: unknown): data is TelegramUpdate {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.update_id === 'number';
}

export function isTelegramWebhookResponse(data: unknown): data is TelegramWebhookResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.ok === 'boolean' && typeof obj.result === 'boolean';
}
