// Prisma service interfaces for webhooks module

import { PrismaClient } from '@prisma/client';

import { Webhook, WebhookEvent } from './webhook.interface';

export interface WebhookPrismaService extends PrismaClient {
  webhook: {
    create: (args: { data: WebhookCreateData }) => Promise<Webhook>;
    update: (args: { where: { id: string }; data: WebhookUpdateData }) => Promise<Webhook>;
    delete: (args: { where: { id: string } }) => Promise<Webhook>;
    findUnique: (args: { where: { id: string } }) => Promise<Webhook | null>;
    findMany: (args?: { where?: { userId?: string } }) => Promise<Webhook[]>;
  };
  webhookEvent: {
    create: (args: { data: WebhookEventCreateData }) => Promise<WebhookEvent>;
    update: (args: {
      where: { id: string };
      data: WebhookEventUpdateData;
    }) => Promise<WebhookEvent>;
    findUnique: (args: { where: { id: string } }) => Promise<WebhookEvent | null>;
    findMany: (args?: {
      where?: { webhookId?: string };
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<WebhookEvent[]>;
  };
}

export interface WebhookCreateData {
  userId: string;
  url: string;
  events: string[];
  secret?: string;
  active?: boolean;
  retries?: number;
  timeout?: number;
}

export interface WebhookUpdateData {
  url?: string;
  events?: string[];
  secret?: string;
  active?: boolean;
  retries?: number;
  timeout?: number;
}

export interface WebhookEventCreateData {
  webhookId: string;
  event: string;
  payload: WebhookPayload;
  status?: 'pending' | 'success' | 'failed';
  statusCode?: number;
  error?: string | null;
  attempt?: number;
}

export interface WebhookEventUpdateData {
  status?: 'pending' | 'success' | 'failed';
  statusCode?: number;
  error?: string | null;
  attempt?: number;
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
