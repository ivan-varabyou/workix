import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  extractUserIdFromEventData,
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';
import type { Cache } from 'cache-manager';

/**
 * UserEventsSubscriberService
 * Subscribes to user.* events from api-auth and handles cache invalidation
 *
 * Events handled:
 * - user.registered - Invalidate user cache
 * - user.login - Invalidate user cache
 * - user.profile.updated - Invalidate user profile cache
 * - user.deleted - Invalidate user cache
 */
@Injectable()
export class UserEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(UserEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to user.* events
    await this.pubSub.subscribe('user.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleUserEvent(event);
    });
    this.logger.log('Subscribed to user.* events for cache invalidation');
  }

  async onModuleDestroy(): Promise<void> {
    // Unsubscribe is handled by PubSubSubscriberService
    this.logger.log('Unsubscribed from user.* events');
  }

  /**
   * Handle user events and invalidate cache
   */
  private async handleUserEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;
      const eventData: unknown = event.data;

      // Extract userId from event data using shared utility
      const userId: string | undefined = extractUserIdFromEventData(eventData);

      if (!userId) {
        this.logger.warn(`No userId found in event ${eventName}`);
        return;
      }

      // Invalidate user cache based on event type
      switch (eventName) {
        case 'user.registered':
        case 'user.login':
        case 'user.profile.updated':
        case 'user.deleted':
          await this.invalidateUserCache(userId);
          this.logger.debug(`Invalidated cache for user ${userId} (event: ${eventName})`);
          break;
        default:
          this.logger.debug(`Unhandled user event: ${eventName}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling user event: ${errorMessage}`);
      // Don't throw - allow service to continue
    }
  }


  /**
   * Invalidate user cache
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      // Invalidate user profile cache
      const userProfileKey: string = `user:profile:${userId}`;
      await this.cacheManager.del(userProfileKey);

      // Invalidate user data cache
      const userDataKey: string = `user:data:${userId}`;
      await this.cacheManager.del(userDataKey);

      // Invalidate user sessions cache
      const userSessionsKey: string = `user:sessions:${userId}`;
      await this.cacheManager.del(userSessionsKey);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to invalidate cache for user ${userId}: ${errorMessage}`);
      // Don't throw - cache invalidation failure shouldn't break the service
    }
  }
}
