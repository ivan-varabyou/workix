// Prisma service interfaces for GitLab integration

import { PrismaClient } from '@prisma/client';

import { GitLabIntegrationRecord } from './gitlab-config.interface';

export interface GitLabPrismaService extends PrismaClient {
  gitlabIntegration: {
    create: (args: { data: GitLabIntegrationCreateData }) => Promise<GitLabIntegrationRecord>;
    findFirst: (args: {
      where: { userId?: string; gitlabUsername?: string; isActive?: boolean };
    }) => Promise<GitLabIntegrationRecord | null>;
    update: (args: {
      where: { id: string };
      data: Partial<GitLabIntegrationRecord>;
    }) => Promise<GitLabIntegrationRecord>;
  };
  gitlabEvent?: {
    create: (args: { data: GitLabEventCreateData }) => Promise<GitLabEvent>;
    findMany: (args?: {
      where?: GitLabEventWhereInput;
      orderBy?: { createdAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<GitLabEvent[]>;
    count: (args?: { where?: GitLabEventWhereInput }) => Promise<number>;
  };
  gitlabMergeRequest?: {
    create: (args: { data: GitLabMergeRequestCreateData }) => Promise<GitLabMergeRequest>;
    count: (args?: { where?: { projectId?: number } }) => Promise<number>;
  };
  gitlabIssue?: {
    create: (args: { data: GitLabIssueCreateData }) => Promise<GitLabIssue>;
    count: (args?: { where?: { projectId?: number } }) => Promise<number>;
  };
  gitlabRelease?: {
    create: (args: { data: GitLabReleaseCreateData }) => Promise<GitLabRelease>;
  };
  gitlabPipeline?: {
    create: (args: { data: GitLabPipelineCreateData }) => Promise<GitLabPipeline>;
  };
  gitlabWebhook?: {
    create: (args: { data: GitLabWebhookCreateData }) => Promise<GitLabWebhook>;
  };
}

/**
 * Metadata type for GitLab events
 */
export type GitLabEventMetadata = Record<
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

export interface GitLabIntegrationCreateData {
  userId: string;
  gitlabUserId: number;
  gitlabUsername: string;
  accessToken: string;
  baseUrl: string;
  isActive: boolean;
}

export interface GitLabEvent {
  id: string;
  project: string;
  projectId: number;
  eventType: string;
  branch?: string | null;
  commits?: number | null;
  pushedBy?: string | null;
  metadata?: GitLabEventMetadata | null;
  createdAt: Date;
}

export interface GitLabEventCreateData {
  project: string;
  projectId: number;
  eventType: string;
  branch?: string | null;
  commits?: number | null;
  pushedBy?: string | null;
  metadata?: GitLabEventMetadata | null;
}

export interface GitLabEventWhereInput {
  projectId?: number;
  eventType?: string;
}

export interface GitLabMergeRequest {
  id: string;
  project: string;
  projectId: number;
  iid: number;
  title: string;
  action: string;
  author?: string | null;
  state: string;
  sourceBranch: string;
  targetBranch: string;
  metadata?: GitLabEventMetadata | null;
  createdAt: Date;
}

export interface GitLabMergeRequestCreateData {
  project: string;
  projectId: number;
  iid: number;
  title: string;
  action: string;
  author?: string | null;
  state: string;
  sourceBranch: string;
  targetBranch: string;
  metadata?: GitLabEventMetadata | null;
}

export interface GitLabIssue {
  id: string;
  project: string;
  projectId: number;
  iid: number;
  title: string;
  action: string;
  author?: string | null;
  state: string;
  labels?: string | null;
  metadata?: GitLabEventMetadata | null;
  createdAt: Date;
}

export interface GitLabIssueCreateData {
  project: string;
  projectId: number;
  iid: number;
  title: string;
  action: string;
  author?: string | null;
  state: string;
  labels?: string | null;
  metadata?: GitLabEventMetadata | null;
}

export interface GitLabRelease {
  id: string;
  project: string;
  projectId: number;
  tag: string;
  name?: string | null;
  action: string;
  author?: string | null;
  description?: string | null;
  createdAt: string;
  metadata?: GitLabEventMetadata | null;
}

export interface GitLabReleaseCreateData {
  project: string;
  projectId: number;
  tag: string;
  name?: string | null;
  action: string;
  author?: string | null;
  description?: string | null;
  createdAt: string;
  metadata?: GitLabEventMetadata | null;
}

export interface GitLabPipeline {
  id: string;
  project: string;
  projectId: number;
  pipelineId: number;
  status: string;
  ref?: string | null;
  sha?: string | null;
  duration?: number | null;
  createdAt: string;
  finishedAt?: string | null;
  metadata?: GitLabEventMetadata | null;
}

export interface GitLabPipelineCreateData {
  project: string;
  projectId: number;
  pipelineId: number;
  status: string;
  ref?: string | null;
  sha?: string | null;
  duration?: number | null;
  createdAt: string;
  finishedAt?: string | null;
  metadata?: GitLabEventMetadata | null;
}

export interface GitLabWebhook {
  id: string;
  integrationId: string;
  webhookId: number;
  projectId: number;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitLabWebhookCreateData {
  integrationId: string;
  webhookId: number;
  projectId: number;
  url: string;
  events: string[];
  isActive: boolean;
}
