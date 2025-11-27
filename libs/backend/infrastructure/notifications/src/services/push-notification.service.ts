import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as webpush from 'web-push';

import type {
  PushNotificationOptions,
  PushSendResponse,
  PushSubscription,
  PushSubscriptionRecord,
} from '../interfaces/push.interface';

/**
 * Push Notification Service
 * Handles Web Push API notifications
 *
 * This service manages push subscriptions and sends push notifications
 * to users' browsers/devices using the Web Push Protocol
 */
@Injectable()
export class PushNotificationService {
  private readonly logger: Logger = new Logger(PushNotificationService.name);
  private readonly vapidPublicKey: string | undefined;
  private readonly vapidPrivateKey: string | undefined;
  private readonly vapidSubject: string | undefined;

  constructor(
    @Inject('AuthPrismaService') private readonly prisma: PrismaClient | null,
    private readonly configService: ConfigService | undefined
  ) {
    this.vapidPublicKey = this.configService?.get<string>('VAPID_PUBLIC_KEY');
    this.vapidPrivateKey = this.configService?.get<string>('VAPID_PRIVATE_KEY');
    this.vapidSubject = this.configService?.get<string>('VAPID_SUBJECT') || 'mailto:noreply@workix.com';

    if (this.vapidPublicKey && this.vapidPrivateKey) {
      webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey);
      this.logger.log('VAPID keys configured - push notifications enabled');
    } else {
      this.logger.warn('VAPID keys not configured - push notifications will be logged only');
    }
  }

  /**
   * Send push notification to user
   * Retrieves all active subscriptions for the user and sends notification
   */
  async sendPushNotification(options: PushNotificationOptions): Promise<PushSendResponse> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      this.logger.warn(`[PUSH NOT CONFIGURED] Would send push to user ${options.userId}: ${options.title}`);
      return { success: false, sent: 0, failed: 0 };
    }

    if (!this.prisma) {
      this.logger.error('Prisma client not available');
      return { success: false, sent: 0, failed: 0 };
    }

    try {
      // Get all active push subscriptions for the user
      const subscriptions: PushSubscriptionRecord[] = await this.getUserSubscriptions(options.userId);

      if (subscriptions.length === 0) {
        this.logger.warn(`No push subscriptions found for user ${options.userId}`);
        return { success: true, sent: 0, failed: 0 };
      }

      const results: PushSendResponse = {
        success: true,
        sent: 0,
        failed: 0,
        errors: [],
      };

      // Send to all subscriptions
      for (const subscription of subscriptions) {
        try {
          await this.sendToSubscription(subscription, options);
          results.sent++;
        } catch (error: unknown) {
          const errorMessage: string = error instanceof Error ? error.message : String(error);
          results.failed++;
          results.errors?.push({
            subscription: subscription.id,
            error: errorMessage,
          });

          // If subscription is invalid, remove it
          if (this.isInvalidSubscriptionError(errorMessage)) {
            await this.removeSubscription(subscription.id);
          }
        }
      }

      this.logger.log(
        `Push notification sent to user ${options.userId}: ${results.sent} sent, ${results.failed} failed`
      );

      return results;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send push notification: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get all active push subscriptions for a user
   */
  private async getUserSubscriptions(userId: string): Promise<PushSubscriptionRecord[]> {
    if (!this.prisma) {
      return [];
    }

    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId, isActive: true },
      });

      return subscriptions.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        userAgent: sub.userAgent ?? undefined,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      }));
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get user subscriptions: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Send push notification to a specific subscription
   */
  private async sendToSubscription(
    subscription: PushSubscriptionRecord,
    options: PushNotificationOptions
  ): Promise<void> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      this.logger.warn(
        `[PUSH NOT CONFIGURED] Would send to ${subscription.endpoint.substring(0, 50)}...: ${options.title} - ${options.body}`
      );
      return;
    }

    const payload: string = JSON.stringify({
      title: options.title,
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      image: options.image,
      url: options.url,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
      data: options.data,
    });

    const pushSubscription: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
      this.logger.debug(`Push notification sent to subscription ${subscription.id}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send push to subscription ${subscription.id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Check if error indicates invalid subscription
   */
  private isInvalidSubscriptionError(errorMessage: string): boolean {
    const invalidErrors: string[] = ['410', 'Gone', 'expired', 'invalid', 'not found'];
    return invalidErrors.some((error) => errorMessage.toLowerCase().includes(error.toLowerCase()));
  }

  /**
   * Remove invalid subscription
   */
  private async removeSubscription(subscriptionId: string): Promise<void> {
    if (!this.prisma) {
      return;
    }

    try {
      await this.prisma.pushSubscription.delete({
        where: { id: subscriptionId },
      });

      this.logger.log(`Removed invalid subscription ${subscriptionId}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to remove subscription: ${errorMessage}`);
    }
  }
}
