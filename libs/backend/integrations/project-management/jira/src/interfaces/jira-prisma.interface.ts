// Prisma service interfaces for Jira integration

import { JiraIntegrationRecord } from './jira-config.interface';

/**
 * Metadata type for Jira events
 */
export type JiraEventMetadata = Record<
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

export interface JiraEvent {
  id: string;
  issueKey: string;
  issueId: string;
  eventType: string;
  summary: string;
  status: string;
  priority?: string | null;
  project: string;
  reporter?: string | null;
  assignee?: string | null;
  changedFields?: string | null;
  metadata?: JiraEventMetadata | null;
  createdAt: Date;
}

export interface JiraEventCreateData {
  issueKey: string;
  issueId: string;
  eventType: string;
  summary: string;
  status: string;
  priority?: string | null;
  project: string;
  reporter?: string | null;
  assignee?: string | null;
  changedFields?: string | null;
  metadata?: JiraEventMetadata | null;
}

export interface JiraEventWhereInput {
  project?: string;
  eventType?: string;
}

export interface JiraWebhook {
  id: string;
  integrationId: string;
  webhookId: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JiraWebhookCreateData {
  integrationId: string;
  webhookId: string;
  url: string;
  events: string[];
  isActive: boolean;
}

export interface JiraPrismaService {
  jiraIntegration: {
    create: (args: { data: JiraIntegrationCreateData }) => Promise<JiraIntegrationRecord>;
    findFirst: (args: {
      where: { userId?: string; isActive?: boolean };
    }) => Promise<JiraIntegrationRecord | null>;
    update: (args: {
      where: { id: string };
      data: Partial<JiraIntegrationRecord>;
    }) => Promise<JiraIntegrationRecord>;
  };
  jiraEvent?: {
    create: (args: { data: JiraEventCreateData }) => Promise<JiraEvent>;
    findMany: (args?: {
      where?: JiraEventWhereInput;
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<JiraEvent[]>;
    count: (args?: { where?: JiraEventWhereInput }) => Promise<number>;
  };
  jiraWebhook?: {
    create: (args: { data: JiraWebhookCreateData }) => Promise<JiraWebhook>;
  };
}

export interface JiraIntegrationCreateData {
  userId: string;
  jiraEmail: string;
  jiraBaseUrl: string;
  apiToken: string;
  isActive: boolean;
}
