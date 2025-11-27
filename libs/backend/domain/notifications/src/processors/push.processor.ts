import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import type { PushNotificationEvent } from '@workix/shared/backend/core';
import { PushNotificationService } from '@workix/infrastructure/notifications';

/**
 * Push Processor
 * Processes push notification events from Redis queue
 *
 * This processor runs in api-notifications microservice
 * and handles all push notifications asynchronously
 */
@Processor('notifications:push')
export class PushProcessor {
  private readonly logger: Logger = new Logger(PushProcessor.name);

  constructor(private readonly pushService: PushNotificationService) {}

  /**
   * Process push notification event
   */
  @Process('push')
  async handlePushNotification(job: Job<PushNotificationEvent>): Promise<void> {
    const event: PushNotificationEvent = job.data;
    this.logger.log(`Processing push notification for user ${event.userId || event.email}`);

    if (!event.userId) {
      this.logger.warn('Push notification event missing userId - skipping');
      return;
    }

    try {
      const result = await this.pushService.sendPushNotification({
        userId: event.userId,
        title: event.title,
        body: event.body,
        icon: event.icon ?? undefined,
        badge: event.badge ?? undefined,
        image: event.image ?? undefined,
        url: event.url ?? undefined,
        tag: event.tag ?? undefined,
        requireInteraction: event.requireInteraction ?? undefined,
        silent: event.silent ?? undefined,
        data: event.data ?? undefined,
      });

      if (result.success && result.sent > 0) {
        this.logger.log(`✅ Push notification sent to user ${event.userId}: ${result.sent} sent`);
      } else if (result.sent === 0) {
        this.logger.warn(`⚠️ No active subscriptions for user ${event.userId}`);
      } else {
        this.logger.error(
          `❌ Failed to send push notification to user ${event.userId}: ${result.failed} failed`
        );
        throw new Error(`Failed to send push: ${result.failed} failed`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to process push notification: ${errorMessage}`);
      throw error; // Bull will retry
    }
  }
}
