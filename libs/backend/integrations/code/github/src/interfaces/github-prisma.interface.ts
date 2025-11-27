// Prisma service interfaces for GitHub integration

import { PrismaClient } from '@prisma/client';

import { GitHubIntegrationRecord } from './github-config.interface';

export interface GitHubPrismaService extends PrismaClient {
  githubIntegration: {
    create: (args: { data: GitHubIntegrationCreateData }) => Promise<GitHubIntegrationRecord>;
    findFirst: (args: {
      where: { userId?: string; githubLogin?: string; isActive?: boolean };
    }) => Promise<GitHubIntegrationRecord | null>;
    update: (args: {
      where: { id: string };
      data: Partial<GitHubIntegrationRecord>;
    }) => Promise<GitHubIntegrationRecord>;
  };
  githubEvent?: {
    create: (args: { data: GitHubEventCreateData }) => Promise<GitHubEvent>;
    findMany: (args?: {
      where?: GitHubEventWhereInput;
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<GitHubEvent[]>;
    count: (args?: { where?: GitHubEventWhereInput }) => Promise<number>;
  };
  githubPullRequest?: {
    create: (args: { data: GitHubPullRequestCreateData }) => Promise<GitHubPullRequest>;
    count: (args?: { where?: { repository?: string } }) => Promise<number>;
  };
  githubIssue?: {
    create: (args: { data: GitHubIssueCreateData }) => Promise<GitHubIssue>;
    count: (args?: { where?: { repository?: string } }) => Promise<number>;
  };
  githubRelease?: {
    create: (args: { data: GitHubReleaseCreateData }) => Promise<GitHubRelease>;
  };
  githubWorkflowRun?: {
    create: (args: { data: GitHubWorkflowRunCreateData }) => Promise<GitHubWorkflowRun>;
  };
  githubWebhook?: {
    create: (args: { data: GitHubWebhookCreateData }) => Promise<GitHubWebhook>;
  };
}

export interface GitHubIntegrationCreateData {
  userId: string;
  githubUserId: number;
  githubLogin: string;
  accessToken: string;
  scope?: string;
  isActive: boolean;
}

export interface GitHubEvent {
  id: string;
  repository: string;
  eventType: string;
  branch?: string | null;
  commits?: number | null;
  pushedBy?: string | null;
  metadata?: Record<
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
  > | null;
  createdAt: Date;
}

export interface GitHubEventCreateData {
  repository: string;
  eventType: string;
  branch?: string | null;
  commits?: number | null;
  pushedBy?: string | null;
  metadata?: Record<
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
  > | null;
}

export interface GitHubEventWhereInput {
  repository?: string;
  eventType?: string;
}

export interface GitHubPullRequest {
  id: string;
  repository: string;
  number: number;
  title: string;
  action: string;
  author: string;
  state: string;
  head: string;
  base: string;
  metadata?: Record<
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
  > | null;
  createdAt: Date;
}

export interface GitHubPullRequestCreateData {
  repository: string;
  number: number;
  title: string;
  action: string;
  author: string;
  state: string;
  head: string;
  base: string;
  metadata?: Record<
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
  > | null;
}

export interface GitHubIssue {
  id: string;
  repository: string;
  number: number;
  title: string;
  action: string;
  author: string;
  state: string;
  labels?: string | null;
  metadata?: Record<
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
  > | null;
  createdAt: Date;
}

export interface GitHubIssueCreateData {
  repository: string;
  number: number;
  title: string;
  action: string;
  author: string;
  state: string;
  labels?: string | null;
  metadata?: Record<
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
  > | null;
}

export interface GitHubRelease {
  id: string;
  repository: string;
  tagName: string;
  name?: string | null;
  action: string;
  author: string;
  isDraft: boolean;
  isPrerelease: boolean;
  publishedAt?: string | null;
  metadata?: Record<
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
  > | null;
  createdAt: Date;
}

export interface GitHubReleaseCreateData {
  repository: string;
  tagName: string;
  name?: string | null;
  action: string;
  author: string;
  isDraft: boolean;
  isPrerelease: boolean;
  publishedAt?: string | null;
  metadata?: Record<
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
  > | null;
}

export interface GitHubWorkflowRun {
  id: string;
  repository: string;
  workflowName: string;
  conclusion?: string | null;
  status: string;
  branch?: string | null;
  actor?: string | null;
  runNumber: number;
  runId: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<
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
  > | null;
}

export interface GitHubWorkflowRunCreateData {
  repository: string;
  workflowName: string;
  conclusion?: string | null;
  status: string;
  branch?: string | null;
  actor?: string | null;
  runNumber: number;
  runId: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<
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
  > | null;
}

export interface GitHubWebhook {
  id: string;
  integrationId: string;
  webhookId: number;
  repository: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubWebhookCreateData {
  integrationId: string;
  webhookId: number;
  repository: string;
  url: string;
  events: string[];
  isActive: boolean;
}
