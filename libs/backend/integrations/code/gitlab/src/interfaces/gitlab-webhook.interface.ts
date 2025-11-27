// GitLab webhook payload interfaces

export interface GitLabWebhookPayload {
  object_kind: string;
  event_name?: string;
  project: GitLabProjectPayload;
  user?: GitLabUserPayload;
  object_attributes?: GitLabObjectAttributes;
  commits?: GitLabCommitPayload[];
  ref?: string;
  user_username?: string;
  action?: string;
  [key: string]:
    | string
    | number
    | boolean
    | GitLabProjectPayload
    | GitLabUserPayload
    | GitLabObjectAttributes
    | GitLabCommitPayload[]
    | undefined;
}

export interface GitLabProjectPayload {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
  [key: string]: string | number | boolean | undefined;
}

export interface GitLabUserPayload {
  username: string;
  avatar_url: string;
  [key: string]: string | number | boolean | undefined;
}

export interface GitLabObjectAttributes {
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

export interface GitLabCommitPayload {
  id: string;
  message: string;
  timestamp: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
}
