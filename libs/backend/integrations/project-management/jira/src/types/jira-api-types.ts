/**
 * Jira API Types
 *
 * Полное покрытие типов для Jira REST API v3
 * Основано на официальной документации: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 */

// TODO: Если появится официальная библиотека типов для Jira, заменить на импорты

/**
 * Base Jira API response structure
 */
export interface JiraApiResponse {
  expand?: string;
  [key: string]: unknown;
}

/**
 * Jira User
 */
export interface JiraUser {
  self: string;
  accountId: string;
  accountType: 'atlassian' | 'app' | 'customer';
  emailAddress?: string;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
  displayName: string;
  active: boolean;
  timeZone?: string;
  locale?: string;
  groups?: {
    size: number;
    items: Array<{
      name: string;
      self: string;
    }>;
  };
  applicationRoles?: {
    size: number;
    items: unknown[];
  };
  [key: string]: unknown;
}

/**
 * Jira Project
 */
export interface JiraProject {
  expand?: string;
  self: string;
  id: string;
  key: string;
  description?: string;
  lead: JiraUser;
  components: Array<{
    self: string;
    id: string;
    name: string;
    description?: string;
    lead?: JiraUser;
    assigneeType?: string;
    assignee?: JiraUser;
    realAssigneeType?: string;
    realAssignee?: JiraUser;
    isAssigneeTypeValid: boolean;
    project?: string;
    projectId?: number;
  }>;
  issueTypes: Array<{
    self: string;
    id: string;
    description: string;
    iconUrl: string;
    name: string;
    subtask: boolean;
    avatarId?: number;
    hierarchyLevel?: number;
  }>;
  url: string;
  email?: string;
  assigneeType?: string;
  versions: Array<{
    self: string;
    id: string;
    description?: string;
    name: string;
    archived: boolean;
    released: boolean;
    startDate?: string;
    releaseDate?: string;
    overdue?: boolean;
    userStartDate?: string;
    userReleaseDate?: string;
    projectId?: number;
  }>;
  name: string;
  roles: Record<string, string>;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
  projectCategory?: {
    self: string;
    id: string;
    name: string;
    description: string;
  };
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  properties: Record<string, unknown>;
  insight?: {
    totalIssueCount: number;
    lastIssueUpdateTime?: string;
  };
  [key: string]: unknown;
}

/**
 * Jira Issue Fields
 */
export interface JiraIssueFields {
  summary: string;
  description?: {
    version: number;
    type: string;
    content: Array<{
      type: string;
      content?: Array<{
        type: string;
        text?: string;
        marks?: Array<{
          type: string;
        }>;
        attrs?: Record<string, unknown>;
      }>;
      text?: string;
      attrs?: Record<string, unknown>;
    }>;
  };
  status: {
    self: string;
    description: string;
    iconUrl: string;
    name: string;
    id: string;
    statusCategory: {
      self: string;
      id: number;
      key: string;
      colorName: string;
      name: string;
    };
  };
  priority?: {
    self: string;
    iconUrl: string;
    name: string;
    id: string;
  };
  assignee?: JiraUser | null;
  creator: JiraUser;
  reporter: JiraUser;
  created: string;
  updated: string;
  duedate?: string | null;
  resolution?: {
    self: string;
    id: string;
    description: string;
    name: string;
  } | null;
  resolutiondate?: string | null;
  labels: string[];
  components: Array<{
    self: string;
    id: string;
    name: string;
    description?: string;
  }>;
  fixVersions: Array<{
    self: string;
    id: string;
    description?: string;
    name: string;
    archived: boolean;
    released: boolean;
    releaseDate?: string;
  }>;
  issuelinks: Array<{
    id: string;
    self: string;
    type: {
      id: string;
      name: string;
      inward: string;
      outward: string;
    };
    inwardIssue?: JiraIssue;
    outwardIssue?: JiraIssue;
  }>;
  subtasks?: Array<{
    id: string;
    key: string;
    self: string;
    fields: {
      summary: string;
      status: {
        self: string;
        iconUrl: string;
        name: string;
        id: string;
      };
      priority: {
        self: string;
        iconUrl: string;
        name: string;
        id: string;
      };
      issuetype: {
        self: string;
        id: string;
        description: string;
        iconUrl: string;
        name: string;
        subtask: boolean;
      };
    };
  }>;
  issuetype: {
    self: string;
    id: string;
    description: string;
    iconUrl: string;
    name: string;
    subtask: boolean;
    avatarId?: number;
    hierarchyLevel?: number;
  };
  project: {
    self: string;
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    simplified: boolean;
    avatarUrls: {
      '16x16': string;
      '24x24': string;
      '32x32': string;
      '48x48': string;
    };
  };
  watches: {
    self: string;
    watchCount: number;
    isWatching: boolean;
  };
  worklog?: {
    startAt: number;
    maxResults: number;
    total: number;
    worklogs: Array<{
      self: string;
      author: JiraUser;
      updateAuthor: JiraUser;
      comment: {
        version: number;
        type: string;
        content: Array<{
          type: string;
          content: Array<{
            type: string;
            text: string;
          }>;
        }>;
      };
      created: string;
      updated: string;
      started: string;
      timeSpent: string;
      timeSpentSeconds: number;
      id: string;
      issueId: string;
    }>;
  };
  [key: string]: unknown;
}

/**
 * Jira Issue
 */
export interface JiraIssue {
  expand?: string;
  id: string;
  self: string;
  key: string;
  fields: JiraIssueFields;
  renderedFields?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  names?: Record<string, string>;
  schema?: Record<
    string,
    {
      type: string;
      items?: string;
      system?: string;
      custom?: string;
      customId?: number;
    }
  >;
  transitions?: JiraTransition[];
  operations?: {
    linkGroup: Array<{
      id: string;
      styleClass: string;
      iconClass: string;
      label: string;
      title: string;
      href: string;
      weight: number;
    }>;
  };
  editmeta?: {
    fields: Record<
      string,
      {
        required: boolean;
        schema: {
          type: string;
          system?: string;
          custom?: string;
          customId?: number;
          items?: string;
        };
        name: string;
        key: string;
        operations: string[];
        allowedValues?: unknown[];
        defaultValue?: unknown;
      }
    >;
  };
  changelog?: {
    startAt: number;
    maxResults: number;
    total: number;
    histories: Array<{
      id: string;
      author: JiraUser;
      created: string;
      items: Array<{
        field: string;
        fieldtype: string;
        fieldId?: string;
        from?: string;
        fromString?: string;
        to?: string;
        toString?: string;
      }>;
    }>;
  };
  [key: string]: unknown;
}

/**
 * Jira Transition
 */
export interface JiraTransition {
  id: string;
  name: string;
  to: {
    self: string;
    description: string;
    iconUrl: string;
    name: string;
    id: string;
    statusCategory: {
      self: string;
      id: number;
      key: string;
      colorName: string;
      name: string;
    };
  };
  hasScreen: boolean;
  isGlobal: boolean;
  isInitial: boolean;
  isAvailable: boolean;
  isConditional: boolean;
  isLooped: boolean;
  fields?: Record<
    string,
    {
      required: boolean;
      schema: {
        type: string;
        system?: string;
        custom?: string;
        customId?: number;
        items?: string;
      };
      name: string;
      key: string;
      operations: string[];
      allowedValues?: unknown[];
      defaultValue?: unknown;
    }
  >;
  [key: string]: unknown;
}

/**
 * Jira Issue Response
 */
export interface JiraIssueResponse {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
  expand?: string;
  [key: string]: unknown;
}

/**
 * Jira Search Response
 */
export interface JiraSearchResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
  warningMessages?: string[];
  names?: Record<string, string>;
  schema?: Record<
    string,
    {
      type: string;
      items?: string;
      system?: string;
      custom?: string;
      customId?: number;
    }
  >;
}

/**
 * Jira Comment Response
 */
export interface JiraCommentResponse {
  self: string;
  id: string;
  author: JiraUser;
  body:
    | {
        version: number;
        type: string;
        content: Array<{
          type: string;
          content: Array<{
            type: string;
            text: string;
          }>;
        }>;
      }
    | string;
  updateAuthor: JiraUser;
  created: string;
  updated: string;
  visibility?: {
    type: string;
    value: string;
  };
  jsdPublic?: boolean;
  properties?: Array<{
    key: string;
    value: unknown;
  }>;
  [key: string]: unknown;
}

/**
 * Jira Webhook Response
 */
export interface JiraWebhookResponse {
  self: string;
  name: string;
  url: string;
  events: string[];
  filters: Record<string, unknown>;
  excludeBody?: boolean;
  enabled: boolean;
  expirationDate?: number;
  [key: string]: unknown;
}

/**
 * Fields that can be updated in a Jira issue
 */
export interface JiraIssueUpdateFields {
  summary?: string;
  description?:
    | string
    | {
        version: number;
        type: string;
        content: Array<{
          type: string;
          content: Array<{
            type: string;
            text: string;
          }>;
        }>;
      };
  labels?: string[];
  priority?: {
    id: string;
    name?: string;
  };
  assignee?: {
    accountId: string;
  } | null;
  status?: {
    id: string;
    name?: string;
  };
  resolution?: {
    id: string;
    name?: string;
  } | null;
  duedate?: string | null;
  fixVersions?: Array<{
    id: string;
    name?: string;
  }>;
  components?: Array<{
    id: string;
    name?: string;
  }>;
  [key: string]: unknown;
}

/**
 * Response for integration creation
 */
export interface JiraIntegrationResponse {
  id: string;
  userId: string;
  jiraEmail: string;
  jiraBaseUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response for integration statistics
 */
export interface JiraIntegrationStatsResponse {
  integration: {
    id: string;
    jiraEmail: string;
    isActive: boolean;
    createdAt: Date;
  };
  user: {
    displayName: string;
    email: string;
    avatarUrl: string;
    accountType: string;
  };
  stats: {
    connectedProjects: number;
  };
}

/**
 * Type guards for Jira API responses
 */
export function isJiraUser(data: unknown): data is JiraUser {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.accountId === 'string' &&
    typeof obj.displayName === 'string' &&
    typeof obj.self === 'string'
  );
}

export function isJiraProject(data: unknown): data is JiraProject {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.key === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.self === 'string'
  );
}

export function isJiraIssue(data: unknown): data is JiraIssue {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.key === 'string' &&
    typeof obj.self === 'string' &&
    typeof obj.fields === 'object' &&
    obj.fields !== null &&
    typeof (obj.fields as Record<string, unknown>).summary === 'string'
  );
}

export function isJiraIssueResponse(data: unknown): data is JiraIssueResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.key === 'string' &&
    typeof obj.self === 'string' &&
    typeof obj.fields === 'object' &&
    obj.fields !== null
  );
}

export function isJiraSearchResponse(data: unknown): data is JiraSearchResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.startAt === 'number' &&
    typeof obj.maxResults === 'number' &&
    typeof obj.total === 'number' &&
    Array.isArray(obj.issues)
  );
}

export function isJiraCommentResponse(data: unknown): data is JiraCommentResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.self === 'string' &&
    typeof obj.created === 'string' &&
    typeof obj.updated === 'string' &&
    isJiraUser(obj.author)
  );
}

export function isJiraWebhookResponse(data: unknown): data is JiraWebhookResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.url === 'string' &&
    Array.isArray(obj.events) &&
    typeof obj.enabled === 'boolean'
  );
}

export function isJiraTransition(data: unknown): data is JiraTransition {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.to === 'object' &&
    obj.to !== null
  );
}
