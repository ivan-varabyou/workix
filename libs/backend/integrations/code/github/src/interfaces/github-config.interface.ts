export interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  appId?: string;
  privateKeyPath?: string;
}

// Re-export types from github-api-types for backward compatibility
// TODO: После полной миграции удалить эти re-export и использовать напрямую из github-api-types
export type {
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepository,
  GitHubUser,
} from '../types/github-api-types';

export interface GitHubWebhookPayload {
  action?: string;
  issue?: GitHubIssuePayload;
  pull_request?: GitHubPullRequestPayload;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
  sender: {
    login: string;
    avatar_url: string;
  };
  commits?: GitHubCommitPayload[];
  ref?: string;
  pusher?: {
    name: string;
    email?: string;
  };
  release?: {
    id: number;
    tag_name: string;
    name?: string;
    author: {
      login: string;
      avatar_url: string;
    };
    draft: boolean;
    prerelease: boolean;
    published_at?: string;
  };
  workflow_run?: {
    id: number;
    name: string;
    conclusion?: string;
    status: string;
    head_branch?: string;
    actor?: {
      login: string;
      avatar_url: string;
    };
    run_number: number;
    created_at: string;
    updated_at: string;
  };
  [key: string]:
    | string
    | number
    | boolean
    | GitHubIssuePayload
    | GitHubPullRequestPayload
    | GitHubCommitPayload[]
    | { id: number; name: string; full_name: string; owner: { login: string } }
    | { login: string; avatar_url: string }
    | { name: string; email?: string }
    | {
        id: number;
        tag_name: string;
        name?: string;
        author: { login: string; avatar_url: string };
        draft: boolean;
        prerelease: boolean;
        published_at?: string;
      }
    | {
        id: number;
        name: string;
        conclusion?: string;
        status: string;
        head_branch?: string;
        actor?: { login: string; avatar_url: string };
        run_number: number;
        created_at: string;
        updated_at: string;
      }
    | undefined;
}

export interface GitHubIssuePayload {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{ name: string; color: string }>;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface GitHubPullRequestPayload {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  created_at: string;
  updated_at: string;
  merged_at?: string;
}

export interface GitHubCommitPayload {
  id: string;
  message: string;
  timestamp: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
}

export interface GitHubIntegrationRecord {
  id: string;
  userId: string;
  githubUserId: number;
  githubLogin: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scope?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
