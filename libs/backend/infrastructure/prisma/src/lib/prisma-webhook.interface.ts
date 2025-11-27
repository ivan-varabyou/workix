// Prisma webhook delegate interfaces

/**
 * Webhook Payload Interface
 * Используем interface вместо type для совместимости с правилами линтинга
 */
export interface WebhookPayloadBase {
  [key: string]: string | number | boolean | null | Date | string[] | WebhookPayloadBase;
}

/**
 * Webhook Payload Union Type
 * Для совместимости с Prisma используем type, но с комментарием
 */
 
export type WebhookPayload =
  | string
  | number
  | boolean
  | null
  | Date
  | string[]
  | Record<string, string | number | boolean | null | Date | string[]>;

export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string | null;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, WebhookPayload>;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number | null;
  error?: string | null;
  attempt: number;
  createdAt: Date;
}

/**
 * Webhook Delegate Interface
 * Интерфейс для делегата Prisma webhook
 */
export interface WebhookDelegateInterface {
  findUnique: (
    args: { where: { id: string } } | { where: { url: string } }
  ) => Promise<Webhook | null>;
  findMany: (args?: {
    where?: {
      userId?: string;
      active?: boolean;
    };
    orderBy?: {
      createdAt?: 'asc' | 'desc';
    };
    take?: number;
  }) => Promise<Webhook[]>;
  create: (args: {
    data: {
      userId: string;
      url: string;
      events: string[];
      active: boolean;
      secret?: string;
      timeout: number;
    };
  }) => Promise<Webhook>;
  update: (args: {
    where: { id: string };
    data: {
      url?: string;
      events?: string[];
      active?: boolean;
      secret?: string;
      timeout?: number;
    };
  }) => Promise<Webhook>;
  delete: (args: { where: { id: string } }) => Promise<Webhook>;
  count: (args?: {
    where?: {
      userId?: string;
      active?: boolean;
    };
  }) => Promise<number>;
}

/**
 * Webhook Event Delegate Interface
 * Интерфейс для делегата Prisma webhook event
 */
export interface WebhookEventDelegateInterface {
  findUnique: (args: { where: { id: string } }) => Promise<WebhookEvent | null>;
  findMany: (args?: {
    where?: {
      webhookId?: string;
      status?: 'pending' | 'success' | 'failed';
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    };
    orderBy?: {
      createdAt?: 'asc' | 'desc';
    };
    take?: number;
  }) => Promise<WebhookEvent[]>;
  create: (args: {
    data: {
      webhookId: string;
      event: string;
      payload: Record<string, WebhookPayload>;
      status: 'pending' | 'success' | 'failed';
      statusCode?: number;
      error?: string;
      attempt: number;
    };
  }) => Promise<WebhookEvent>;
  update: (args: {
    where: { id: string };
    data: {
      status?: 'pending' | 'success' | 'failed';
      statusCode?: number;
      error?: string;
      attempt?: number;
    };
  }) => Promise<WebhookEvent>;
  delete: (args: { where: { id: string } }) => Promise<WebhookEvent>;
  count: (args?: {
    where?: {
      webhookId?: string;
      status?: 'pending' | 'success' | 'failed';
    };
  }) => Promise<number>;
}

// WebhookDelegate и WebhookEventDelegate - type aliases для обратной совместимости
// eslint-disable-next-line @typescript-eslint/no-type-alias
export type WebhookDelegate = WebhookDelegateInterface;

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type WebhookEventDelegate = WebhookEventDelegateInterface;
