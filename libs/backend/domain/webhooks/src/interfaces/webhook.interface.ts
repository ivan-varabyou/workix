// Webhook interfaces

export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string | null;
  retries: number;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number | null;
  error?: string | null;
  attempt: number;
  createdAt: Date;
}

export type WebhookPayload = Record<
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
