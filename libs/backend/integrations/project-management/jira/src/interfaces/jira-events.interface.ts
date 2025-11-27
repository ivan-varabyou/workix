// Jira event interfaces

import { JiraIssue, JiraUser, JiraWebhookPayload } from './jira-config.interface';

export interface JiraChangelogItem {
  field: string;
  fieldtype: string;
  from?: string;
  fromString?: string;
  to?: string;
  toString?: string;
}

export interface JiraChangelog {
  id: string;
  items: JiraChangelogItem[];
}

export interface JiraIssueCreatedPayload {
  webhookEvent: 'jira:issue_created';
  timestamp: number;
  user?: JiraUser;
  issue: JiraIssue;
  changelog?: JiraChangelog;
  [key: string]: string | number | JiraUser | JiraIssue | JiraChangelog | undefined;
}

export interface JiraIssueUpdatedPayload {
  webhookEvent: 'jira:issue_updated';
  timestamp: number;
  user?: JiraUser;
  issue: JiraIssue;
  changelog?: JiraChangelog;
  [key: string]: string | number | JiraUser | JiraIssue | JiraChangelog | undefined;
}

export interface JiraIssueDeletedPayload {
  webhookEvent: 'jira:issue_deleted';
  timestamp: number;
  user?: JiraUser;
  issue: JiraIssue;
  changelog?: JiraChangelog;
  [key: string]: string | number | JiraUser | JiraIssue | JiraChangelog | undefined;
}

export type JiraWebhookEventPayload =
  | JiraIssueCreatedPayload
  | JiraIssueUpdatedPayload
  | JiraIssueDeletedPayload;

/**
 * Type guard to check if payload is JiraIssueCreatedPayload
 */
export function isJiraIssueCreatedPayload(
  payload: JiraWebhookPayload
): payload is JiraIssueCreatedPayload {
  return payload.webhookEvent === 'jira:issue_created';
}

/**
 * Type guard to check if payload is JiraIssueUpdatedPayload
 */
export function isJiraIssueUpdatedPayload(
  payload: JiraWebhookPayload
): payload is JiraIssueUpdatedPayload {
  return payload.webhookEvent === 'jira:issue_updated';
}

/**
 * Type guard to check if payload is JiraIssueDeletedPayload
 */
export function isJiraIssueDeletedPayload(
  payload: JiraWebhookPayload
): payload is JiraIssueDeletedPayload {
  return payload.webhookEvent === 'jira:issue_deleted';
}
