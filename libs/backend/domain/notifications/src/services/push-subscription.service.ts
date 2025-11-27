import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { PushSubscription } from '@workix/infrastructure/notifications';

/**
 * Push Subscription Service
 * Manages push notification subscriptions for users
 */
@Injectable()
export class PushSubscriptionService {
  private readonly logger: Logger = new Logger(PushSubscriptionService.name);

  constructor(
    @Inject('AuthPrismaService') private readonly prisma: PrismaClient | null
  ) {}

  /**
   * Register push subscription for user
   */
  async registerSubscription(
    userId: string,
    subscription: PushSubscription,
    userAgent?: string
  ): Promise<{ id: string }> {
    if (!this.prisma) {
      throw new Error('Prisma client not available');
    }

    try {
      // Check if subscription already exists
      const existing = await this.prisma.pushSubscription.findUnique({
        where: {
          idx_push_subscription_user_endpoint: {
            userId,
            endpoint: subscription.endpoint,
          },
        },
      });

      if (existing) {
        // Update existing subscription
        const updated = await this.prisma.pushSubscription.update({
          where: { id: existing.id },
          data: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            userAgent: userAgent || existing.userAgent,
            isActive: true,
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Updated push subscription ${updated.id} for user ${userId}`);
        return { id: updated.id };
      }

      // Create new subscription
      const created = await this.prisma.pushSubscription.create({
        data: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: userAgent ?? null,
          isActive: true,
        },
      });

      this.logger.log(`Registered push subscription ${created.id} for user ${userId}`);
      return { id: created.id };
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to register push subscription: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Unregister push subscription
   */
  async unregisterSubscription(userId: string, subscriptionId: string): Promise<void> {
    if (!this.prisma) {
      throw new Error('Prisma client not available');
    }

    try {
      // First check that subscription exists and belongs to user
      const subscription = await this.prisma.pushSubscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.userId !== userId) {
        throw new Error('Subscription does not belong to user');
      }

      // Delete subscription
      await this.prisma.pushSubscription.delete({
        where: { id: subscriptionId },
      });

      this.logger.log(`Unregistered push subscription ${subscriptionId} for user ${userId}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to unregister push subscription: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get all active subscriptions for user
   */
  async getUserSubscriptions(userId: string): Promise<Array<{ id: string; endpoint: string; createdAt: Date }>> {
    if (!this.prisma) {
      return [];
    }

    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          endpoint: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return subscriptions;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get user subscriptions: ${errorMessage}`);
      return [];
    }
  }
}
