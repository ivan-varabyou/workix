// Email notification interfaces

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface EmailNotificationOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  metadata?: Record<string, unknown>;
}

export interface EmailSendResponse {
  success: boolean;
  method: 'sendgrid' | 'console';
  messageId?: string;
}

export interface SendGridPersonalization {
  to: Array<{ email: string }>;
  subject: string;
  cc?: Array<{ email: string }>;
  bcc?: Array<{ email: string }>;
}

export interface SendGridContent {
  type: 'text/plain' | 'text/html';
  value: string;
}

export interface SendGridAttachment {
  content: string;
  filename: string;
  type: string;
  disposition: 'attachment';
}

export interface SendGridPayload {
  personalizations: SendGridPersonalization[];
  from: {
    email: string;
  };
  content: SendGridContent[];
  attachments?: SendGridAttachment[];
}

export interface DigestMetrics {
  pipelinesExecuted: number;
  tokensUsed: number;
  apiCalls: number;
}

export interface DigestEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface DigestAlert {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
}

export interface DigestContent {
  metrics?: DigestMetrics;
  events?: DigestEvent[];
  alerts?: DigestAlert[];
}

export interface DigestReportOptions {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  includeMetrics?: boolean;
  includeEvents?: boolean;
  includeAlerts?: boolean;
  template?: string;
}

export interface UserInfo {
  email: string;
  firstName?: string;
  lastName?: string;
}
