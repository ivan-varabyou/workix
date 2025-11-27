// GitHub webhook payload interfaces

export interface GitHubWebhookPayload {
  action?: string;
  issue?: GitHubIssuePayload;
  pull_request?: GitHubPullRequestPayload;
  commits?: GitHubCommitPayload[];
  repository: GitHubRepositoryPayload;
  sender: GitHubSenderPayload;
  ref?: string;
  pusher?: GitHubPusherPayload;
  release?: GitHubReleasePayload;
  workflow_run?: GitHubWorkflowRunPayload;
  [key: string]:
    | string
    | number
    | boolean
    | GitHubIssuePayload
    | GitHubPullRequestPayload
    | GitHubCommitPayload[]
    | GitHubRepositoryPayload
    | GitHubSenderPayload
    | GitHubPusherPayload
    | GitHubReleasePayload
    | GitHubWorkflowRunPayload
    | undefined;
}

export interface GitHubIssuePayload {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  user: GitHubUserPayload;
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
  user: GitHubUserPayload;
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

export interface GitHubRepositoryPayload {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  description?: string;
  url: string;
  html_url: string;
  private: boolean;
}

export interface GitHubSenderPayload {
  login: string;
  avatar_url: string;
  type: string;
}

export interface GitHubPusherPayload {
  name: string;
  email?: string;
}

export interface GitHubReleasePayload {
  id: number;
  tag_name: string;
  name?: string;
  author: GitHubUserPayload;
  draft: boolean;
  prerelease: boolean;
  published_at?: string;
  created_at: string;
}

export interface GitHubUserPayload {
  login: string;
  avatar_url: string;
  type?: string;
}

export interface GitHubWorkflowRunPayload {
  id: number;
  name: string;
  conclusion?: string;
  status: string;
  head_branch?: string;
  actor?: GitHubUserPayload;
  run_number: number;
  created_at: string;
  updated_at: string;
}
