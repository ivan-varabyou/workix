/**
 * GitHub API Types
 *
 * Этот файл содержит типы из @octokit/rest и @octokit/types
 * После установки пакетов эти типы будут импортироваться из библиотек
 */

// TODO: После установки @octokit/rest заменить на:
// import type { Octokit } from '@octokit/rest';
// import type {
//   RestEndpointMethodTypes,
// } from '@octokit/plugin-rest-endpoint-methods';

// Временные типы до установки пакетов
// После установки будут заменены на импорты из @octokit/rest

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name?: string | null;
  company?: string | null;
  blog?: string | null;
  location?: string | null;
  email?: string | null;
  hireable?: boolean | null;
  bio?: string | null;
  twitter_username?: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  hooks_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  clone_url: string;
  mirror_url: string | null;
  svn_url: string;
  homepage: string | null;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template: boolean;
  topics: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  pushed_at: string | null;
  created_at: string;
  updated_at: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  [key: string]: unknown;
}

export interface GitHubIssue {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: GitHubUser;
  labels: Array<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description?: string | null;
  }>;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  milestone: unknown | null;
  locked: boolean;
  active_lock_reason: string | null;
  comments: number;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  closed_by?: GitHubUser | null;
  [key: string]: unknown;
}

export interface GitHubPullRequest {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: unknown[];
  labels: Array<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
  }>;
  milestone: unknown | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubRepository;
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubRepository;
  };
  author_association: string;
  auto_merge: unknown | null;
  active_lock_reason: string | null;
  [key: string]: unknown;
}

export interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: Array<{
    sha: string;
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string;
  }>;
  [key: string]: unknown;
}

export interface GitHubWebhookResponse {
  id: number;
  name: string;
  active: boolean;
  events: string[];
  config: {
    url: string;
    content_type: string;
    insecure_ssl?: string;
    secret?: string;
    [key: string]: string | number | boolean | undefined;
  };
  created_at: string;
  updated_at: string;
  url?: string;
  test_url?: string;
  ping_url?: string;
  deliveries_url?: string;
  [key: string]: unknown;
}

/**
 * Type guards for GitHub API responses
 */
export function isGitHubUser(data: unknown): data is GitHubUser {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.login === 'string' &&
    typeof obj.id === 'number' &&
    typeof obj.avatar_url === 'string'
  );
}

export function isGitHubRepository(data: unknown): data is GitHubRepository {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.full_name === 'string' &&
    isGitHubUser(obj.owner)
  );
}

export function isGitHubIssue(data: unknown): data is GitHubIssue {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.number === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.state === 'string' &&
    isGitHubUser(obj.user)
  );
}

export function isGitHubPullRequest(data: unknown): data is GitHubPullRequest {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.number === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.head === 'object' &&
    obj.head !== null &&
    typeof obj.base === 'object' &&
    obj.base !== null
  );
}

export function isGitHubCommit(data: unknown): data is GitHubCommit {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.sha === 'string' &&
    typeof obj.commit === 'object' &&
    obj.commit !== null &&
    typeof (obj.commit as Record<string, unknown>).message === 'string'
  );
}

export function isGitHubWebhookResponse(data: unknown): data is GitHubWebhookResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.active === 'boolean' &&
    Array.isArray(obj.events) &&
    typeof obj.config === 'object' &&
    obj.config !== null
  );
}
