import type { JiraIssue, JiraUser } from '../types/jira-api-types';

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

// Re-export types from jira-api-types for backward compatibility
// TODO: После полной миграции удалить эти re-export и использовать напрямую из jira-api-types
export type { JiraIssue, JiraProject, JiraTransition, JiraUser } from '../types/jira-api-types';

export interface JiraWebhookPayload {
  webhookEvent: string;
  timestamp: number;
  user?: JiraUser;
  issue?: JiraIssue;
  changelog?: {
    id: string;
    items: Array<{
      field: string;
      fieldtype: string;
      from?: string;
      fromString?: string;
      to?: string;
      toString?: string;
    }>;
  };
  [key: string]:
    | string
    | number
    | JiraUser
    | JiraIssue
    | {
        id: string;
        items: Array<{
          field: string;
          fieldtype: string;
          from?: string;
          fromString?: string;
          to?: string;
          toString?: string;
        }>;
      }
    | undefined;
}

export interface JiraIntegrationRecord {
  id: string;
  userId: string;
  jiraEmail: string;
  jiraBaseUrl: string;
  apiToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
