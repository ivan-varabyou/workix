import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { EventPublisherService } from '@workix/shared/backend/core';
import type { SecurityCodeEvent } from '@workix/shared/backend/core';

// TODO: Fix EmailNotificationService import - temporarily disabled
// import { EmailNotificationService } from '@workix/infrastructure/notifications';

/**
 * Security Code Service
 * Generates and validates security verification codes for suspicious activity
 */
@Injectable()
export class SecurityCodeService {
  private readonly logger: Logger = new Logger(SecurityCodeService.name);

  private prisma: PrismaClient;

  private readonly CODE_EXPIRY_MINUTES: number = 15;
  private readonly MAX_ATTEMPTS: number = 3;

  constructor(
    @Optional() @Inject('PrismaService') prisma: PrismaClient,
    @Optional() @Inject('EventPublisherService') private readonly eventPublisher?: EventPublisherService
    // @Optional() @Inject(EmailNotificationService) private emailService?: EmailNotificationService
  ) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported.');
    }
    this.prisma = prisma;
  }

  /**
   * Generate and send security verification code
   */
  async generateAndSendCode(
    userId: string,
    email: string,
    reason: 'location_change' | 'suspicious_activity' | 'new_device',
    ipAddress?: string,
    country?: string,
    countryName?: string
  ): Promise<{ code: string; expiresAt: Date }> {
    // Generate 6-digit code
    const code: string = this.generateCode();

    const expiresAt: Date = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

    // Save code to database
    const createData: {
      userId: string;
      email: string;
      code: string;
      reason: 'location_change' | 'suspicious_activity' | 'new_device';
      ipAddress?: string;
      country?: string;
      countryName?: string;
      expiresAt: Date;
      maxAttempts: number;
    } = {
      userId,
      email,
      code,
      reason,
      expiresAt,
      maxAttempts: this.MAX_ATTEMPTS,
    };
    if (ipAddress !== undefined) createData.ipAddress = ipAddress;
    if (country !== undefined) createData.country = country;
    if (countryName !== undefined) createData.countryName = countryName;
    await this.prisma.securityVerificationCode.create({
      data: createData,
    });

    // Publish security code event to queue (async, non-blocking)
    if (this.eventPublisher) {
      const event: Omit<SecurityCodeEvent, 'type' | 'timestamp'> = {
        userId,
        email,
        code,
        reason,
        expiresAt,
      };
      if (ipAddress !== undefined) {
        event.ipAddress = ipAddress;
      }
      if (country !== undefined) {
        event.country = country;
      }
      if (countryName !== undefined) {
        event.countryName = countryName;
      }
      await this.eventPublisher.publishSecurityCode(event).catch((error: unknown): void => {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to publish security code event: ${errorMessage}`);
        // Don't throw - code is saved, user can request resend
      });
    } else {
      // Fallback: log to console
      await this.sendSecurityCodeEmail(email, code, reason, countryName, ipAddress).catch((error: unknown): void => {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to send security code email: ${errorMessage}`);
        // Don't throw - code is saved, user can request resend
      });
    }

    this.logger.log(`Security code generated for user ${userId} (${email}) - reason: ${reason}`);

    return { code, expiresAt };
  }

  /**
   * Verify security code
   */
  async verifyCode(
    userId: string,
    email: string,
    code: string
  ): Promise<{ valid: boolean; message?: string }> {
    // Find active code
    const verificationCode: Awaited<ReturnType<typeof this.prisma.securityVerificationCode.findFirst>> = await this.prisma.securityVerificationCode.findFirst({
      where: {
        userId,
        email,
        code,
        expiresAt: {
          gt: new Date(),
        },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationCode) {
      // Code not found or expired
      return {
        valid: false,
        message: 'Invalid or expired security code',
      };
    }

    // Check attempts
    if (verificationCode.attempts >= verificationCode.maxAttempts) {
      return {
        valid: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.',
      };
    }

    // Increment attempts
    await this.prisma.securityVerificationCode.update({
      where: { id: verificationCode.id },
      data: {
        attempts: verificationCode.attempts + 1,
      },
    });

    // Verify code
    if (verificationCode.code !== code) {
      return {
        valid: false,
        message: 'Invalid security code',
      };
    }

    // Mark as verified
    await this.prisma.securityVerificationCode.update({
      where: { id: verificationCode.id },
      data: {
        verifiedAt: new Date(),
      },
    });

    this.logger.log(`Security code verified for user ${userId} (${email})`);

    return {
      valid: true,
    };
  }

  /**
   * Check if user has pending verification code
   */
  async hasPendingCode(userId: string, email: string): Promise<boolean> {
    const code: Awaited<ReturnType<typeof this.prisma.securityVerificationCode.findFirst>> = await this.prisma.securityVerificationCode.findFirst({
      where: {
        userId,
        email,
        expiresAt: {
          gt: new Date(),
        },
        verifiedAt: null,
      },
    });

    return !!code;
  }

  /**
   * Get pending code info (without revealing the code)
   */
  async getPendingCodeInfo(userId: string, email: string): Promise<{
    reason: string;
    country?: string;
    countryName?: string;
    expiresAt: Date;
  } | null> {
    const code: Awaited<ReturnType<typeof this.prisma.securityVerificationCode.findFirst>> = await this.prisma.securityVerificationCode.findFirst({
      where: {
        userId,
        email,
        expiresAt: {
          gt: new Date(),
        },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!code) {
      return null;
    }

    const result: {
      reason: string;
      country?: string;
      countryName?: string;
      expiresAt: Date;
    } = {
      reason: code.reason,
      expiresAt: code.expiresAt,
    };
    if (code.country !== null && code.country !== undefined) result.country = code.country;
    if (code.countryName !== null && code.countryName !== undefined) result.countryName = code.countryName;
    return result;
  }

  /**
   * Generate random 6-digit code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send security code email
   * TODO: Re-enable when EmailNotificationService is fixed
   * Currently logs code to console instead of sending email
   */

  private async sendSecurityCodeEmail(
    email: string,
    code: string,
    reason: string,
    _countryName?: string,
    _ipAddress?: string
  ): Promise<void> {
    // TODO: Re-enable when EmailNotificationService is fixed
    this.logger.warn('EmailNotificationService not available, logging code instead');
    this.logger.log(`[SECURITY CODE] ${email}: ${code} (reason: ${reason})`);
    return;
    /*
    if (!this.emailService) {
      this.logger.warn('EmailNotificationService not available, logging code instead');
      this.logger.log(`[SECURITY CODE] ${email}: ${code} (reason: ${reason})`);
      return;
    }

    const reasonText: Record<string, string> = {
      location_change: 'изменение местоположения',
      suspicious_activity: 'подозрительная активность',
      new_device: 'новое устройство',
    };

    const subject: string = 'Код безопасности Workix';
    const html: string = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Код безопасности</h2>
          <p>Здравствуйте!</p>
          <p>Мы обнаружили ${reasonText[reason] || 'подозрительную активность'} при попытке входа в ваш аккаунт.</p>
          ${countryName ? `<p><strong>Местоположение:</strong> ${countryName}</p>` : ''}
          ${ipAddress ? `<p><strong>IP адрес:</strong> ${ipAddress}</p>` : ''}
          <div class="warning">
            <p><strong>⚠️ Если это были не вы:</strong></p>
            <p>Немедленно измените пароль и свяжитесь с поддержкой.</p>
          </div>
          <p>Для завершения входа введите следующий код безопасности:</p>
          <div class="code">${code}</div>
          <div class="info">
            <p><strong>ℹ️ Важно:</strong></p>
            <ul>
              <li>Код действителен в течение 15 минут</li>
              <li>У вас есть 3 попытки для ввода кода</li>
              <li>Никому не сообщайте этот код</li>
            </ul>
          </div>
          <p>Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
          <p>С уважением,<br>Команда Workix</p>
        </div>
      </body>
      </html>
    `;

    const text: string = `
Код безопасности Workix

Здравствуйте!

Мы обнаружили ${reasonText[reason] || 'подозрительную активность'} при попытке входа в ваш аккаунт.
${countryName ? `Местоположение: ${countryName}\n` : ''}${ipAddress ? `IP адрес: ${ipAddress}\n` : ''}

⚠️ Если это были не вы:
Немедленно измените пароль и свяжитесь с поддержкой.

Для завершения входа введите следующий код безопасности:

${code}

Важно:
- Код действителен в течение 15 минут
- У вас есть 3 попытки для ввода кода
- Никому не сообщайте этот код

Если вы не запрашивали этот код, проигнорируйте это письмо.

С уважением,
Команда Workix
    `.trim();

    await this.emailService.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    */
  }
}
