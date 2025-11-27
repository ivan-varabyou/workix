export interface GitLabConfig {
  baseUrl: string;
  accessToken: string;
  appId?: string;
  webhookSecret?: string;
}

// Re-export types from gitlab-api-types for backward compatibility
// TODO: После полной миграции удалить эти re-export и использовать напрямую из gitlab-api-types
export type {
  GitLabCommit,
  GitLabIssue,
  GitLabMergeRequest,
  GitLabProject,
  GitLabUser,
} from '../types/gitlab-api-types';

export interface GitLabWebhookPayload {
  object_kind: string;
  event_name?: string;
  project: {
    id: number;
    name: string;
    path_with_namespace: string;
    web_url: string;
  };
  user?: {
    username: string;
    avatar_url: string;
  };
  object_attributes?: {
    id?: number;
    iid?: number;
    title?: string;
    description?: string;
    state?: string;
    action?: string;
    source_branch?: string;
    target_branch?: string;
    tag?: string;
    name?: string;
    status?: string;
    ref?: string;
    sha?: string;
    duration?: number;
    created_at?: string;
    finished_at?: string;
    [key: string]: string | number | boolean | undefined;
  };
  commits?: Array<{
    id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
    url: string;
  }>;
  ref?: string;
  user_username?: string;
  action?: string;
  [key: string]:
    | string
    | number
    | boolean
    | { id: number; name: string; path_with_namespace: string; web_url: string }
    | { username: string; avatar_url: string }
    | {
        id?: number;
        iid?: number;
        title?: string;
        description?: string;
        state?: string;
        action?: string;
        source_branch?: string;
        target_branch?: string;
        tag?: string;
        name?: string;
        status?: string;
        ref?: string;
        sha?: string;
        duration?: number;
        created_at?: string;
        finished_at?: string;
        [key: string]: string | number | boolean | undefined;
      }
    | Array<{
        id: string;
        message: string;
        timestamp: string;
        author: { name: string; email: string };
        url: string;
      }>
    | undefined;
}

export interface GitLabIntegrationRecord {
  id: string;
  userId: string;
  gitlabUserId: number;
  gitlabUsername: string;
  accessToken: string;
  baseUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
