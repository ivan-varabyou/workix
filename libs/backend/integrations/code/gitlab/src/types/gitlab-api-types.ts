/**
 * GitLab API Types
 *
 * Этот файл содержит типы из @gitbeaker/rest
 * После установки пакетов эти типы будут импортироваться из библиотек
 */

// TODO: После установки @gitbeaker/rest заменить на:
// import type { Gitlab } from '@gitbeaker/rest';
// import type {
//   UserSchema,
//   ProjectSchema,
//   IssueSchema,
//   MergeRequestSchema,
//   CommitSchema,
// } from '@gitbeaker/rest';

// Временные типы до установки пакетов
// После установки будут заменены на импорты из @gitbeaker/rest

export interface GitLabUser {
  id: number;
  username: string;
  email: string;
  name: string;
  state: string;
  avatar_url: string | null;
  web_url: string;
  created_at: string;
  bio?: string | null;
  location?: string | null;
  public_email?: string | null;
  skype?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  website_url?: string | null;
  organization?: string | null;
  job_title?: string | null;
  pronouns?: string | null;
  bot: boolean;
  work_information?: string | null;
  followers: number;
  following: number;
  [key: string]: unknown;
}

export interface GitLabProject {
  id: number;
  description: string | null;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: string;
  default_branch: string;
  tag_list: string[];
  topics: string[];
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  readme_url: string | null;
  avatar_url: string | null;
  forks_count: number;
  star_count: number;
  last_activity_at: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id: number | null;
    avatar_url: string | null;
    web_url: string;
  };
  container_registry_image_prefix: string;
  _links: {
    self: string;
    issues: string;
    merge_requests: string;
    repo_branches: string;
    labels: string;
    events: string;
    members: string;
    cluster_agents: string;
  };
  packages_enabled: boolean;
  empty_repo: boolean;
  archived: boolean;
  visibility: string;
  resolve_outdated_diff_discussions: boolean;
  container_expiration_policy: unknown;
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  wiki_enabled: boolean;
  jobs_enabled: boolean;
  snippets_enabled: boolean;
  container_registry_enabled: boolean;
  service_desk_enabled: boolean;
  service_desk_address: string | null;
  can_create_merge_request_in: boolean;
  issues_access_level: string;
  repository_access_level: string;
  merge_requests_access_level: string;
  forking_access_level: string;
  wiki_access_level: string;
  builds_access_level: string;
  snippets_access_level: string;
  pages_access_level: string;
  analytics_access_level: string;
  container_registry_access_level: string;
  security_and_compliance_access_level: string;
  releases_access_level: string;
  environments_access_level: string;
  feature_flags_access_level: string;
  infrastructure_access_level: string;
  monitor_access_level: string;
  model_experiments_access_level: string;
  model_registry_access_level: string;
  emails_disabled: boolean | null;
  emails_enabled: boolean | null;
  shared_runners_enabled: boolean;
  group_runners_enabled: boolean;
  lfs_enabled: boolean;
  request_access_enabled: boolean;
  repository_storage: string;
  repository_size_limit: number | null;
  repository_size_excess: number | null;
  repository_read_only: boolean;
  project_creation_level: string;
  container_registry_cleanup_policy_enabled: boolean;
  container_registry_protected: boolean;
  [key: string]: unknown;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  closed_by: GitLabUser | null;
  labels: string[];
  milestone: unknown | null;
  assignees: GitLabUser[];
  author: GitLabUser;
  type: string | null;
  assignee: GitLabUser | null;
  user_notes_count: number;
  merge_requests_count: number;
  upvotes: number;
  downvotes: number;
  due_date: string | null;
  confidential: boolean;
  discussion_locked: boolean | null;
  issue_type: string;
  web_url: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
    human_time_estimate: string | null;
    human_total_time_spent: string | null;
  };
  task_completion_status: {
    count: number;
    completed_count: number;
  };
  blocking_issues_count: number | null;
  has_tasks: boolean;
  _links: {
    self: string;
    notes: string;
    award_emoji: string;
    project: string;
    closed_as_duplicate_of?: string;
  };
  references: {
    short: string;
    relative: string;
    full: string;
  };
  moved_to_id: number | null;
  service_desk_reply_to: string | null;
  [key: string]: unknown;
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  target_branch: string;
  source_branch: string;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  author: GitLabUser;
  assignees: GitLabUser[];
  assignee: GitLabUser | null;
  reviewers: GitLabUser[];
  source_project_id: number;
  target_project_id: number;
  labels: string[];
  draft: boolean;
  work_in_progress: boolean;
  milestone: unknown | null;
  merge_when_pipeline_succeeds: boolean;
  merge_status: string;
  detailed_merge_status: string;
  sha: string;
  merge_commit_sha: string | null;
  squash_commit_sha: string | null;
  discussion_locked: boolean | null;
  should_remove_source_branch: boolean | null;
  force_remove_source_branch: boolean;
  reference: string;
  references: {
    short: string;
    relative: string;
    full: string;
  };
  web_url: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
    human_time_estimate: string | null;
    human_total_time_spent: string | null;
  };
  squash: boolean;
  task_completion_status: {
    count: number;
    completed_count: number;
  };
  has_conflicts: boolean;
  blocking_discussions_resolved: boolean;
  approvals_before_merge: number | null;
  [key: string]: unknown;
}

export interface GitLabCommit {
  id: string;
  short_id: string;
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
  created_at: string;
  parent_ids: string[];
  web_url: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  } | null;
  status: string | null;
  project_id: number;
  last_pipeline: unknown | null;
  [key: string]: unknown;
}

export interface GitLabWebhookResponse {
  id: number;
  url: string;
  push_events: boolean;
  push_events_branch_filter: string | null;
  merge_requests_events: boolean;
  merge_requests_events_branch_filter: string | null;
  tag_push_events: boolean;
  tag_push_events_branch_filter: string | null;
  note_events: boolean;
  note_events_branch_filter: string | null;
  confidential_note_events: boolean;
  confidential_note_events_branch_filter: string | null;
  confidential_issues_events: boolean;
  confidential_issues_events_branch_filter: string | null;
  issues_events: boolean;
  issues_events_branch_filter: string | null;
  job_events: boolean;
  job_events_branch_filter: string | null;
  pipeline_events: boolean;
  pipeline_events_branch_filter: string | null;
  wiki_page_events: boolean;
  wiki_page_events_branch_filter: string | null;
  deployment_events: boolean;
  deployment_events_branch_filter: string | null;
  feature_flag_events: boolean;
  feature_flag_events_branch_filter: string | null;
  releases_events: boolean;
  releases_events_branch_filter: string | null;
  subgroup_events: boolean;
  subgroup_events_branch_filter: string | null;
  member_events: boolean;
  member_events_branch_filter: string | null;
  enable_ssl_verification: boolean;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Type guards for GitLab API responses
 */
export function isGitLabUser(data: unknown): data is GitLabUser {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string'
  );
}

export function isGitLabProject(data: unknown): data is GitLabProject {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.path_with_namespace === 'string'
  );
}

export function isGitLabIssue(data: unknown): data is GitLabIssue {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.iid === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.state === 'string' &&
    isGitLabUser(obj.author)
  );
}

export function isGitLabMergeRequest(data: unknown): data is GitLabMergeRequest {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.iid === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.state === 'string' &&
    typeof obj.source_branch === 'string' &&
    typeof obj.target_branch === 'string' &&
    isGitLabUser(obj.author)
  );
}

export function isGitLabCommit(data: unknown): data is GitLabCommit {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.author_name === 'string' &&
    typeof obj.committed_date === 'string'
  );
}

export function isGitLabWebhookResponse(data: unknown): data is GitLabWebhookResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.url === 'string' &&
    typeof obj.push_events === 'boolean'
  );
}
