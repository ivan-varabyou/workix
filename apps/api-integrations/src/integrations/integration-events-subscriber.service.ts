import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';

/**
 * IntegrationEventsSubscriberService
 * Subscribes to integration.* events from API Gateway
 * and processes integration operations asynchronously
 */
@Injectable()
export class IntegrationEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(IntegrationEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to integration.* events
    await this.pubSub.subscribe('integration.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleIntegrationEvent(event);
    });
    this.logger.log('Subscribed to integration.* events for integration operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from integration.* events');
  }

  private async handleIntegrationEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;
      this.logger.debug(`Received integration event: ${eventName}`);
      // TODO: Implement integration event handlers
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling integration event: ${errorMessage}`);
    }
  }
}

