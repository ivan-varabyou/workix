import { Inject, Injectable, Logger } from '@nestjs/common';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';

/**
 * Types of suspicious activities
 */
export enum SuspiciousActivityType {
  NEW_IP_LOGIN = 'new_ip_login',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  ACCOUNT_LOCKED = 'account_locked',
  PASSWORD_CHANGED = 'password_changed',
  CRITICAL_SETTING_CHANGED = 'critical_setting_changed',
  IP_WHITELIST_BLOCKED = 'ip_whitelist_blocked',
}

/**
 * Suspicious activity event
 */
export interface SuspiciousActivityEvent {
  adminId: string;
  adminEmail: string;
  type: SuspiciousActivityType;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Admin Notification Service
 * Handles notifications about suspicious activities for Admin admins
 */
@Injectable()
export class AdminNotificationService {
  private readonly logger: Logger = new Logger(AdminNotificationService.name);
  private readonly ENABLE_EMAIL_NOTIFICATIONS = false; // TODO: Enable when email service is integrated

  constructor(
    @Inject('PrismaService') private prisma: AdminPrismaService,
  ) {}

  /**
   * Send notification about suspicious activity
   */
  async notifySuspiciousActivity(event: SuspiciousActivityEvent): Promise<void> {
    try {
      // Log to audit log
      await this.prisma.auditLog.create({
        data: {
          adminId: event.adminId,
          action: 'suspicious_activity',
          entityType: 'admin',
          resourceType: 'admin',
          metadata: {
            type: event.type,
            severity: event.severity,
            ...event.metadata,
          },
          ...(event.ipAddress !== undefined && { ipAddress: event.ipAddress }),
          ...(event.userAgent !== undefined && { userAgent: event.userAgent }),
        },
      });

      // Log to console
      this.logger.warn(
        `Suspicious activity detected for admin ${event.adminEmail}: ${event.type} (severity: ${event.severity})`,
      );

      // TODO: Send email notification if enabled
      if (this.ENABLE_EMAIL_NOTIFICATIONS) {
        await this.sendEmailNotification(event);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send suspicious activity notification: ${errorMessage}`);
      // Don't throw - notifications should not break the main flow
    }
  }

  /**
   * Check if IP is new for admin
   */
  async isNewIpForAdmin(adminId: string, ipAddress: string): Promise<boolean> {
    if (!ipAddress || ipAddress === 'unknown') {
      return false;
    }

    // Check if this IP was used before in audit logs
    const previousLogin = await this.prisma.auditLog.findFirst({
      where: {
        adminId,
        action: { in: ['login', 'login_2fa_success'] },
        ipAddress,
      },
      orderBy: { createdAt: 'desc' },
    });

    return !previousLogin;
  }

  /**
   * Notify about new IP login
   */
  async notifyNewIpLogin(adminId: string, adminEmail: string, ipAddress?: string, userAgent?: string): Promise<void> {
    if (!ipAddress || ipAddress === 'unknown') {
      return;
    }

    const isNew: boolean = await this.isNewIpForAdmin(adminId, ipAddress);
    if (!isNew) {
      return;
    }

    const event: SuspiciousActivityEvent = {
      adminId,
      adminEmail,
      type: SuspiciousActivityType.NEW_IP_LOGIN,
      metadata: {
        ipAddress,
        userAgent: userAgent ?? undefined,
        message: 'Login from new IP address',
      },
      severity: 'medium',
    };
    if (ipAddress) {
      event.ipAddress = ipAddress;
    }
    if (userAgent) {
      event.userAgent = userAgent;
    }
    await this.notifySuspiciousActivity(event);
  }

  /**
   * Notify about multiple failed login attempts
   */
  async notifyMultipleFailedAttempts(
    adminId: string,
    adminEmail: string,
    attemptCount: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    if (attemptCount < 3) {
      return; // Only notify for 3+ failed attempts
    }

    const severity: 'low' | 'medium' | 'high' | 'critical' = attemptCount >= 5 ? 'high' : 'medium';

    const event: SuspiciousActivityEvent = {
      adminId,
      adminEmail,
      type: SuspiciousActivityType.MULTIPLE_FAILED_ATTEMPTS,
      metadata: {
        attemptCount,
        message: `Multiple failed login attempts: ${attemptCount}`,
      },
      severity,
    };
    if (ipAddress) {
      event.ipAddress = ipAddress;
    }
    if (userAgent) {
      event.userAgent = userAgent;
    }
    await this.notifySuspiciousActivity(event);
  }

  /**
   * Notify about account lockout
   */
  async notifyAccountLocked(
    adminId: string,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: SuspiciousActivityEvent = {
      adminId,
      adminEmail,
      type: SuspiciousActivityType.ACCOUNT_LOCKED,
      metadata: {
        message: 'Account locked due to too many failed login attempts',
      },
      severity: 'high',
    };
    if (ipAddress) {
      event.ipAddress = ipAddress;
    }
    if (userAgent) {
      event.userAgent = userAgent;
    }
    await this.notifySuspiciousActivity(event);
  }

  /**
   * Notify about password change
   */
  async notifyPasswordChanged(
    adminId: string,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: SuspiciousActivityEvent = {
      adminId,
      adminEmail,
      type: SuspiciousActivityType.PASSWORD_CHANGED,
      metadata: {
        message: 'Password was changed',
      },
      severity: 'medium',
    };
    if (ipAddress) {
      event.ipAddress = ipAddress;
    }
    if (userAgent) {
      event.userAgent = userAgent;
    }
    await this.notifySuspiciousActivity(event);
  }

  /**
   * Notify about critical setting change
   */
  async notifyCriticalSettingChanged(
    adminId: string,
    adminEmail: string,
    settingName: string,
    oldValue: unknown,
    newValue: unknown,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: SuspiciousActivityEvent = {
      adminId,
      adminEmail,
      type: SuspiciousActivityType.CRITICAL_SETTING_CHANGED,
      metadata: {
        settingName,
        oldValue,
        newValue,
        message: `Critical setting changed: ${settingName}`,
      },
      severity: 'high',
    };
    if (ipAddress) {
      event.ipAddress = ipAddress;
    }
    if (userAgent) {
      event.userAgent = userAgent;
    }
    await this.notifySuspiciousActivity(event);
  }

  /**
   * Notify about IP whitelist blocked login
   */
  async notifyIpWhitelistBlocked(
    adminId: string,
    adminEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: SuspiciousActivityEvent = {
      adminId,
      adminEmail,
      type: SuspiciousActivityType.IP_WHITELIST_BLOCKED,
      metadata: {
        message: 'Login blocked: IP not in whitelist',
      },
      severity: 'critical',
    };
    if (ipAddress) {
      event.ipAddress = ipAddress;
    }
    if (userAgent) {
      event.userAgent = userAgent;
    }
    await this.notifySuspiciousActivity(event);
  }

  /**
   * Send email notification (placeholder for future integration)
   */
  private async sendEmailNotification(event: SuspiciousActivityEvent): Promise<void> {
    // TODO: Integrate with email service
    // Example integration:
    // await this.emailService.send({
    //   to: event.adminEmail,
    //   subject: `Suspicious Activity Alert: ${event.type}`,
    //   template: 'suspicious-activity',
    //   data: event,
    // });
    this.logger.log(`Email notification would be sent for: ${event.type}`);
  }
}
