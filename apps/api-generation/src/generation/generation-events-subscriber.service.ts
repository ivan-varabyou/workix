import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';

/**
 * GenerationEventsSubscriberService
 * Subscribes to generation.* events from API Gateway
 * and processes AI generation operations asynchronously
 */
@Injectable()
export class GenerationEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(GenerationEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to generation.* events
    await this.pubSub.subscribe('generation.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleGenerationEvent(event);
    });
    this.logger.log('Subscribed to generation.* events for AI generation operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from generation.* events');
  }

  private async handleGenerationEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;
      this.logger.debug(`Received generation event: ${eventName}`);
      // TODO: Implement generation event handlers
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling generation event: ${errorMessage}`);
    }
  }
}

