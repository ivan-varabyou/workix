/**
 * Queue Names
 * Centralized queue name constants for type safety
 */
export const QUEUE_NAMES = {
  // Authentication events
  AUTH_USER_REGISTERED: 'auth.user.registered',
  AUTH_USER_LOGIN: 'auth.user.login',
  AUTH_USER_LOGOUT: 'auth.user.logout',
  AUTH_PASSWORD_RESET: 'auth.password.reset',
  AUTH_OAUTH_LINKED: 'auth.oauth.linked',
  AUTH_OAUTH_UNLINKED: 'auth.oauth.unlinked',

  // User events
  USER_PROFILE_UPDATED: 'user.profile.updated',
  USER_AVATAR_UPDATED: 'user.avatar.updated',
  USER_DELETED: 'user.deleted',

  // Pipeline events
  PIPELINE_CREATED: 'pipeline.created',
  PIPELINE_UPDATED: 'pipeline.updated',
  PIPELINE_DELETED: 'pipeline.deleted',
  PIPELINE_EXECUTION_STARTED: 'pipeline.execution.started',
  PIPELINE_EXECUTION_COMPLETED: 'pipeline.execution.completed',
  PIPELINE_EXECUTION_FAILED: 'pipeline.execution.failed',

  // RBAC events
  ROLE_CREATED: 'rbac.role.created',
  ROLE_UPDATED: 'rbac.role.updated',
  ROLE_DELETED: 'rbac.role.deleted',
  PERMISSION_ASSIGNED: 'rbac.permission.assigned',
  PERMISSION_REVOKED: 'rbac.permission.revoked',

  // Audit events
  AUDIT_LOG: 'audit.log',

  // Email events
  EMAIL_SENT: 'email.sent',
  EMAIL_FAILED: 'email.failed',

  // Notification queues
  NOTIFICATIONS_EMAIL: 'notifications:email',
  NOTIFICATIONS_PUSH: 'notifications:push',

  // Webhook events
  WEBHOOK_TRIGGERED: 'webhook.triggered',
  WEBHOOK_FAILED: 'webhook.failed',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
