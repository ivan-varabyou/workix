import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { I18nService } from '@workix/infrastructure/i18n';
import { firstValueFrom } from 'rxjs';

import {
  DigestAlert,
  DigestContent,
  DigestEvent,
  DigestMetrics,
  DigestReportOptions,
  EmailNotificationOptions,
  EmailSendResponse,
  SendGridPayload,
  SendGridPersonalization,
  UserInfo,
} from '../interfaces/email.interface';

/**
 * Email Notification Service
 * Email alerts + digest reports
 */
@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);
  private sendGridApiKey: string | undefined;
  private sendGridApiUrl = 'https://api.sendgrid.com/v3';
  private defaultFrom: string;

  constructor(
    @Inject('PrismaService') private readonly prisma: PrismaClient | null,
    private readonly configService: ConfigService | undefined,
    private readonly httpService: HttpService,
    private readonly i18n: I18nService
  ) {
    this.sendGridApiKey = this.configService?.get<string>('SENDGRID_API_KEY');
    this.defaultFrom = this.configService?.get<string>('EMAIL_FROM') || 'noreply@workix.com';
  }

  /**
   * Send email notification
   */
  async sendEmail(options: EmailNotificationOptions): Promise<EmailSendResponse> {
    try {
      if (this.sendGridApiKey) {
        return await this.sendViaSendGrid(options);
      } else {
        // Fallback to console logging if SendGrid is not configured
        this.logger.warn('SendGrid not configured, logging email instead');
        this.logger.log(`Email to ${options.to}: ${options.subject}`);
        this.logger.debug(`Email content: ${options.text || options.html}`);
        return { success: true, method: 'console' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(options: EmailNotificationOptions): Promise<EmailSendResponse> {
    const recipients: string[] = Array.isArray(options.to) ? options.to : [options.to];
    const personalizations: SendGridPersonalization[] = recipients.map((to: string) => ({
      to: [{ email: to }],
      subject: options.subject,
    }));

    const payload: SendGridPayload = {
      personalizations,
      from: {
        email: options.from || this.defaultFrom,
      },
      content: [],
    };

    if (options.text) {
      payload.content.push({
        type: 'text/plain',
        value: options.text,
      });
    }

    if (options.html) {
      payload.content.push({
        type: 'text/html',
        value: options.html,
      });
    }

    if (options.cc) {
      const ccEmails: string[] = Array.isArray(options.cc) ? options.cc : [options.cc];
      if (personalizations[0]) {
        personalizations[0].cc = ccEmails.map((email: string) => ({ email }));
      }
    }

    if (options.bcc) {
      const bccEmails: string[] = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      if (personalizations[0]) {
        personalizations[0].bcc = bccEmails.map((email: string) => ({ email }));
      }
    }

    if (options.attachments) {
      payload.attachments = options.attachments.map((att) => ({
        content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
        filename: att.filename,
        type: att.contentType || 'application/octet-stream',
        disposition: 'attachment' as const,
      }));
    }

    const response = await firstValueFrom(
      this.httpService.post(`${this.sendGridApiUrl}/mail/send`, payload, {
        headers: {
          Authorization: `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
      })
    );

    this.logger.log(`Email sent via SendGrid to ${recipients.join(', ')}`);
    return { success: true, method: 'sendgrid', messageId: response.headers['x-message-id'] };
  }

  /**
   * Send alert email
   */
  async sendAlert(
    userId: string,
    alertType: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ): Promise<EmailSendResponse> {
    try {
      // Get user email
      const user: UserInfo | null =
        (await this.prisma?.user
          ?.findUnique({
            where: { id: userId },
            select: { email: true },
          })
          .then((u: { email: string } | null) =>
            u ? { email: u.email } : null
          )) || null;

      if (!user?.email) {
        throw new Error(this.i18n.translate('errors.user_no_email', { userId }));
      }

      const severityEmoji = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        critical: '🚨',
      };

      const subject = `${severityEmoji[severity]} ${this.i18n.translate('alerts.title', {
        alertType,
      })}`;
      const html = this.formatAlertEmail(user, alertType, message, severity);

      return await this.sendEmail({
        to: user.email,
        subject,
        html,
        text: message,
        metadata: {
          userId,
          alertType,
          severity,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send alert: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Send digest report
   */
  async sendDigestReport(options: DigestReportOptions): Promise<EmailSendResponse> {
    try {
      // Get user
      const user: UserInfo | null =
        (await this.prisma?.user
          ?.findUnique({
            where: { id: options.userId },
            select: { email: true },
          })
          .then((u: { email: string } | null) =>
            u ? { email: u.email } : null
          )) || null;

      if (!user?.email) {
        throw new Error(`User ${options.userId} has no email address`);
      }

      // Generate digest content
      const digest = await this.generateDigestContent(options);

      const periodLabel = this.i18n.translate(`common.${options.period}`);
      const subject = `${this.i18n.translate('email.digest.title', {
        period: periodLabel,
      })} - Workix`;
      const html = this.formatDigestEmail(user, digest, options.period);

      return await this.sendEmail({
        to: user.email,
        subject,
        html,
        text: this.formatDigestText(digest),
        metadata: {
          userId: options.userId,
          period: options.period,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send digest report: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Generate digest content
   */
  private async generateDigestContent(options: DigestReportOptions): Promise<DigestContent> {
    const digest: DigestContent = {};

    if (options.includeMetrics) {
      // Get metrics for period
      digest.metrics = {
        pipelinesExecuted: 0,
        tokensUsed: 0,
        apiCalls: 0,
      } as DigestMetrics;
    }

    if (options.includeEvents) {
      // Get events for period
      digest.events = [] as DigestEvent[];
    }

    if (options.includeAlerts) {
      // Get alerts for period
      digest.alerts = [] as DigestAlert[];
    }

    return digest;
  }

  /**
   * Format alert email
   */
  private formatAlertEmail(
    user: { firstName?: string; lastName?: string },
    alertType: string,
    message: string,
    severity: string
  ): string {
    const userName = user.firstName || this.i18n.translate('common.user');
    const severityColors: Record<string, string> = {
      info: '#3498db',
      warning: '#f39c12',
      error: '#e74c3c',
      critical: '#c0392b',
    };

    const color = severityColors[severity] || severityColors.info;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${this.i18n.translate('alerts.title', { alertType })}</h2>
          </div>
          <div class="content">
            <p>${this.i18n.translate('alerts.greeting', { userName })}</p>
            <p>${message}</p>
          </div>
          <div class="footer">
            <p>${this.i18n.translate('alerts.footer')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format digest email
   */
  private formatDigestEmail(
    user: { firstName?: string; lastName?: string },
    digest: DigestContent,
    period: string
  ): string {
    const userName = user.firstName || this.i18n.translate('common.user');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .metric { margin: 10px 0; padding: 10px; background-color: white; border-left: 4px solid #3498db; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${this.i18n.translate('email.digest.title', {
              period: this.i18n.translate(`common.${period}`),
            })}</h2>
          </div>
          <div class="content">
            <p>${this.i18n.translate('email.digest.greeting', { userName })}</p>
            <p>${this.i18n.translate('email.digest.summary', {
              period: this.i18n.translate(`common.${period}`),
            })}</p>
            ${digest.metrics ? this.formatMetrics(digest.metrics) : ''}
            ${digest.events ? this.formatEvents(digest.events) : ''}
            ${digest.alerts ? this.formatAlerts(digest.alerts) : ''}
          </div>
          <div class="footer">
            <p>${this.i18n.translate('email.digest.footer')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format metrics
   */
  private formatMetrics(metrics: DigestMetrics): string {
    return `
      <h3>${this.i18n.translate('email.digest.metrics')}</h3>
      <div class="metric">
        <strong>${this.i18n.translate('email.digest.pipelines_executed')}:</strong> ${
      metrics.pipelinesExecuted || 0
    }
      </div>
      <div class="metric">
        <strong>${this.i18n.translate('email.digest.tokens_used')}:</strong> ${
      metrics.tokensUsed || 0
    }
      </div>
      <div class="metric">
        <strong>${this.i18n.translate('email.digest.api_calls')}:</strong> ${metrics.apiCalls || 0}
      </div>
    `;
  }

  /**
   * Format events
   */
  private formatEvents(events: DigestEvent[]): string {
    if (!events || events.length === 0) {
      return `<h3>${this.i18n.translate('email.digest.events')}</h3><p>${this.i18n.translate(
        'email.digest.no_events'
      )}</p>`;
    }

    return `
      <h3>${this.i18n.translate('email.digest.recent_events')}</h3>
      ${events
        .map((event: DigestEvent) => `<div class="metric">${event.message || event.type}</div>`)
        .join('')}
    `;
  }

  /**
   * Format alerts
   */
  private formatAlerts(alerts: DigestAlert[]): string {
    if (!alerts || alerts.length === 0) {
      return `<h3>${this.i18n.translate('email.digest.alerts')}</h3><p>${this.i18n.translate(
        'email.digest.no_alerts'
      )}</p>`;
    }

    return `
      <h3>${this.i18n.translate('email.digest.alerts')}</h3>
      ${alerts
        .map((alert: DigestAlert) => `<div class="metric">${alert.message || alert.type}</div>`)
        .join('')}
    `;
  }

  /**
   * Format digest text (plain text version)
   */
  private formatDigestText(digest: DigestContent): string {
    let text = `${this.i18n.translate('email.digest.title', {
      period: this.i18n.translate('common.daily'),
    })}\n\n`;

    if (digest.metrics) {
      text += `${this.i18n.translate('email.digest.metrics')}:\n`;
      text += `- ${this.i18n.translate('email.digest.pipelines_executed')}: ${
        digest.metrics.pipelinesExecuted || 0
      }\n`;
      text += `- ${this.i18n.translate('email.digest.tokens_used')}: ${
        digest.metrics.tokensUsed || 0
      }\n`;
      text += `- ${this.i18n.translate('email.digest.api_calls')}: ${
        digest.metrics.apiCalls || 0
      }\n\n`;
    }

    return text;
  }
}
