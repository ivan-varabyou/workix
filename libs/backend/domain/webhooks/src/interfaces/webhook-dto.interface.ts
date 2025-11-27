// Webhook DTO interfaces

export interface CreateWebhookDto {
  url: string;
  events: string[];
}

export interface UpdateWebhookDto {
  url?: string;
  events?: string[];
  active?: boolean;
  retries?: number;
  timeout?: number;
}
