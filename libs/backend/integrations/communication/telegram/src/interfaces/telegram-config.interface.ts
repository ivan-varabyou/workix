export interface TelegramConfig {
  botToken: string;
  webhookUrl?: string;
  apiUrl?: string;
}

export interface TelegramIntegrationRecord {
  id: string;
  userId: string;
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callbackData?: string;
  switchInlineQuery?: string;
  switchInlineQueryCurrentChat?: string;
  callbackGame?: Record<string, unknown>;
  pay?: boolean;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramReplyKeyboardMarkup {
  keyboard: TelegramKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
}

export interface TelegramKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
  request_poll?: {
    type?: 'quiz' | 'regular';
  };
  web_app?: {
    url: string;
  };
}

export type TelegramReplyMarkup = TelegramInlineKeyboardMarkup | TelegramReplyKeyboardMarkup;

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  replyMarkup?: TelegramReplyMarkup;
  replyToMessageId?: number;
}

export interface TelegramUser {
  id: number;
  isBot: boolean;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
}

export interface TelegramUpdate {
  updateId: number;
  message?: TelegramIncomingMessage;
  callbackQuery?: TelegramCallbackQuery;
  editedMessage?: TelegramIncomingMessage;
}

export interface TelegramMessageEntity {
  type:
    | 'mention'
    | 'hashtag'
    | 'cashtag'
    | 'bot_command'
    | 'url'
    | 'email'
    | 'phone_number'
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'code'
    | 'pre'
    | 'text_link'
    | 'text_mention'
    | 'spoiler'
    | 'custom_emoji';
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
  language?: string;
  custom_emoji_id?: string;
}

export interface TelegramIncomingMessage {
  messageId: number;
  from: TelegramUser;
  chat: {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
  };
  date: number;
  text?: string;
  entities?: TelegramMessageEntity[];
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramIncomingMessage;
  data?: string;
  chatInstance?: string;
}
