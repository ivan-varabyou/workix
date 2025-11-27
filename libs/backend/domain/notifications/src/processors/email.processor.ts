import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import type {
  EmailVerificationEvent,
  PasswordResetEvent,
  SecurityCodeEvent,
} from '@workix/shared/backend/core';
import { EmailNotificationService } from '@workix/infrastructure/notifications';

/**
 * Email Processor
 * Processes email notification events from Redis queue
 *
 * This processor runs in api-notifications microservice
 * and handles all email sending asynchronously
 */
@Processor('notifications:email')
export class EmailProcessor {
  private readonly logger: Logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailNotificationService) {}

  /**
   * Process email verification event
   */
  @Process('email_verification')
  async handleEmailVerification(job: Job<EmailVerificationEvent>): Promise<void> {
    const event: EmailVerificationEvent = job.data;
    this.logger.log(`Processing email verification for ${event.email}`);

    try {
      const verificationLink: string = event.verificationLink ||
        `http://localhost:7300/verify-email?token=${event.token}`;

      await this.emailService.sendEmail({
        to: event.email,
        subject: 'Verify your email address',
        html: this.generateEmailVerificationTemplate(event, verificationLink),
        text: `Please verify your email by clicking: ${verificationLink}`,
      });

      this.logger.log(`✅ Email verification sent to ${event.email}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to send email verification: ${errorMessage}`);
      throw error; // Bull will retry
    }
  }

  /**
   * Process password reset event
   */
  @Process('password_reset')
  async handlePasswordReset(job: Job<PasswordResetEvent>): Promise<void> {
    const event: PasswordResetEvent = job.data;
    this.logger.log(`Processing password reset for ${event.email}`);

    try {
      const resetLink: string = event.resetLink ||
        `http://localhost:7300/reset-password?token=${event.token}`;

      await this.emailService.sendEmail({
        to: event.email,
        subject: 'Reset your password',
        html: this.generatePasswordResetTemplate(event, resetLink),
        text: `Reset your password: ${resetLink}`,
      });

      this.logger.log(`✅ Password reset email sent to ${event.email}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to send password reset email: ${errorMessage}`);
      throw error; // Bull will retry
    }
  }

  /**
   * Process security code event
   */
  @Process('security_code')
  async handleSecurityCode(job: Job<SecurityCodeEvent>): Promise<void> {
    const event: SecurityCodeEvent = job.data;
    this.logger.log(`Processing security code for ${event.email}`);

    try {
      await this.emailService.sendEmail({
        to: event.email,
        subject: 'Security verification code',
        html: this.generateSecurityCodeTemplate(event),
        text: `Your security code: ${event.code}`,
      });

      this.logger.log(`✅ Security code sent to ${event.email}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to send security code: ${errorMessage}`);
      throw error; // Bull will retry
    }
  }

  /**
   * Generate email verification HTML template
   */
  private generateEmailVerificationTemplate(_event: EmailVerificationEvent, link: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify your email address</h2>
          <p>Please click the button below to verify your email address:</p>
          <a href="${link}" class="button">Verify Email</a>
          <p>Or copy this link: ${link}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset HTML template
   */
  private generatePasswordResetTemplate(_event: PasswordResetEvent, link: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Reset your password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${link}" class="button">Reset Password</a>
          <p>Or copy this link: ${link}</p>
          <div class="warning">
            <p><strong>⚠️ Security:</strong> If you didn't request this, please ignore this email.</p>
          </div>
          <p>This link will expire in 30 minutes.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate security code HTML template
   */
  private generateSecurityCodeTemplate(event: SecurityCodeEvent): string {
    const reasonText: Record<string, string> = {
      location_change: 'new location',
      suspicious_activity: 'suspicious activity',
      new_device: 'new device',
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Security Verification Code</h2>
          <p>We detected ${reasonText[event.reason] || 'suspicious activity'} when logging into your account.</p>
          ${event.countryName ? `<p><strong>Location:</strong> ${event.countryName}</p>` : ''}
          ${event.ipAddress ? `<p><strong>IP Address:</strong> ${event.ipAddress}</p>` : ''}
          <div class="warning">
            <p><strong>⚠️ If this wasn't you:</strong> Please change your password immediately.</p>
          </div>
          <p>Enter this security code to complete login:</p>
          <div class="code">${event.code}</div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>Code expires in 15 minutes</li>
            <li>You have 3 attempts</li>
            <li>Never share this code</li>
          </ul>
        </div>
      </body>
      </html>
    `;
  }
}
