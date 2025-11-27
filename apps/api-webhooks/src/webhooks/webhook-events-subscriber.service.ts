import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WebhookService } from '@workix/domain/webhooks';
import type { WebhookUpdateData } from '@workix/domain/webhooks/src/interfaces/webhook-prisma.interface';
import {
  isWebhookCreateRequestData,
  isWebhookDeleteRequestData,
  isWebhookUpdateRequestData,
  PubSubEvent,
  PubSubSubscriberService,
  type WebhookCreateRequestData,
  type WebhookDeleteRequestData,
  type WebhookUpdateRequestData,
} from '@workix/backend/shared/core';

/**
 * WebhookEventsSubscriberService
 * Subscribes to webhook.* events from API Gateway
 * and processes webhook operations asynchronously
 */
@Injectable()
export class WebhookEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(WebhookEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly webhookService: WebhookService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to webhook.* events
    await this.pubSub.subscribe('webhook.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleWebhookEvent(event);
    });
    this.logger.log('Subscribed to webhook.* events for webhook operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from webhook.* events');
  }

  private async handleWebhookEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'webhook.create.request') {
        await this.handleCreateRequest(event.data);
      } else if (eventName === 'webhook.update.request') {
        await this.handleUpdateRequest(event.data);
      } else if (eventName === 'webhook.delete.request') {
        await this.handleDeleteRequest(event.data);
      } else if (eventName === 'webhook.execute.request') {
        // Execute is handled by ExecutionsEventsSubscriberService
        this.logger.debug(`Webhook execution request received: ${JSON.stringify(event.data)}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling webhook event: ${errorMessage}`);
    }
  }

  private async handleCreateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWebhookCreateRequestData(data)) {
        this.logger.warn('Invalid webhook create request data');
        return;
      }

      const createData: WebhookCreateRequestData = data;

      if (!createData.userId || !createData.webhookData) {
        this.logger.warn('Missing userId or webhookData in create request');
        return;
      }

      this.logger.log(`Processing webhook create request for user ${createData.userId} (taskId: ${createData.taskId})`);

      // Process webhook creation asynchronously
      // Type guard ensures webhookData has correct structure
      if (!createData.webhookData) {
        this.logger.warn('Missing webhookData in create request');
        return;
      }

      const webhookData: unknown = createData.webhookData;
      if (typeof webhookData !== 'object' || webhookData === null) {
        this.logger.warn('Invalid webhookData structure: not an object');
        return;
      }

      // Extract url and events without type assertions
      let url: string = '';
      let events: string[] = [];

      if ('url' in webhookData && typeof webhookData.url === 'string') {
        url = webhookData.url;
      }

      if ('events' in webhookData && Array.isArray(webhookData.events)) {
        events = webhookData.events.filter((event: unknown): event is string => typeof event === 'string');
      }

      if (url && events.length > 0 && createData.userId) {
        await this.webhookService.createWebhook(createData.userId, url, events);
      } else {
        this.logger.warn('Invalid webhookData structure: missing url, events, or userId');
        return;
      }

      this.logger.log(`Webhook created successfully (taskId: ${createData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process webhook create request: ${errorMessage}`);
    }
  }

  private async handleUpdateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWebhookUpdateRequestData(data)) {
        this.logger.warn('Invalid webhook update request data');
        return;
      }

      const updateData: WebhookUpdateRequestData = data;

      if (!updateData.webhookId || !updateData.userId || !updateData.updateData) {
        this.logger.warn('Missing webhookId, userId, or updateData in update request');
        return;
      }

      this.logger.log(`Processing webhook update request for ${updateData.webhookId} (taskId: ${updateData.taskId})`);

      // Process webhook update asynchronously
      // Type guard ensures updateData has correct structure
      if (!updateData.updateData || typeof updateData.updateData !== 'object' || updateData.updateData === null) {
        this.logger.warn('Invalid updateData structure');
        return;
      }

      // Build WebhookUpdateData from validated structure
      const webhookUpdateData: WebhookUpdateData = {};
      const updateDataObj: unknown = updateData.updateData;
      if (typeof updateDataObj === 'object' && updateDataObj !== null) {
        // Helper function to safely extract string property
        function getStringProperty(obj: unknown, key: string): string | undefined {
          const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
          if (desc && 'value' in desc) {
            const val: unknown = desc.value;
            if (typeof val === 'string') {
              return val;
            }
          }
          return undefined;
        }

        // Helper function to safely extract string array property
        function getStringArrayProperty(obj: unknown, key: string): string[] | undefined {
          const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
          if (desc && 'value' in desc) {
            const val: unknown = desc.value;
            if (Array.isArray(val)) {
              const filtered: string[] = val.filter((item: unknown): item is string => typeof item === 'string');
              return filtered;
            }
          }
          return undefined;
        }

        // Helper function to safely extract boolean property
        function getBooleanProperty(obj: unknown, key: string): boolean | undefined {
          const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
          if (desc && 'value' in desc) {
            const val: unknown = desc.value;
            if (typeof val === 'boolean') {
              return val;
            }
          }
          return undefined;
        }

        // Helper function to safely extract number property
        function getNumberProperty(obj: unknown, key: string): number | undefined {
          const desc: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
          if (desc && 'value' in desc) {
            const val: unknown = desc.value;
            if (typeof val === 'number') {
              return val;
            }
          }
          return undefined;
        }

        const urlResult: string | undefined = getStringProperty(updateDataObj, 'url');
        const eventsResult: string[] | undefined = getStringArrayProperty(updateDataObj, 'events');
        const activeResult: boolean | undefined = getBooleanProperty(updateDataObj, 'active');
        const retriesResult: number | undefined = getNumberProperty(updateDataObj, 'retries');
        const timeoutResult: number | undefined = getNumberProperty(updateDataObj, 'timeout');

        // Build WebhookUpdateData object using Record
        const updateDataRecord: Record<string, unknown> = {};
        if (urlResult !== undefined) {
          updateDataRecord.url = urlResult;
        }
        if (eventsResult !== undefined) {
          updateDataRecord.events = eventsResult;
        }
        if (activeResult !== undefined) {
          updateDataRecord.active = activeResult;
        }
        if (retriesResult !== undefined) {
          updateDataRecord.retries = retriesResult;
        }
        if (timeoutResult !== undefined) {
          updateDataRecord.timeout = timeoutResult;
        }

        // Type guard to ensure the record matches WebhookUpdateData structure
        function isWebhookUpdateData(obj: Record<string, unknown>): obj is WebhookUpdateData {
          return (
            (!('url' in obj) || typeof obj.url === 'string') &&
            (!('events' in obj) || Array.isArray(obj.events)) &&
            (!('active' in obj) || typeof obj.active === 'boolean') &&
            (!('retries' in obj) || typeof obj.retries === 'number') &&
            (!('timeout' in obj) || typeof obj.timeout === 'number')
          );
        }

        if (isWebhookUpdateData(updateDataRecord)) {
          await this.webhookService.updateWebhook(updateData.webhookId, updateDataRecord);
        } else {
          await this.webhookService.updateWebhook(updateData.webhookId, {});
        }
      } else {
        // If updateDataObj is not an object, pass empty object
        await this.webhookService.updateWebhook(updateData.webhookId, {});
      }

      this.logger.log(`Webhook updated successfully: ${updateData.webhookId} (taskId: ${updateData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process webhook update request: ${errorMessage}`);
    }
  }

  private async handleDeleteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWebhookDeleteRequestData(data)) {
        this.logger.warn('Invalid webhook delete request data');
        return;
      }

      const deleteData: WebhookDeleteRequestData = data;

      if (!deleteData.webhookId || !deleteData.userId) {
        this.logger.warn('Missing webhookId or userId in delete request');
        return;
      }

      this.logger.log(`Processing webhook delete request for ${deleteData.webhookId} (taskId: ${deleteData.taskId})`);

      // Process webhook deletion asynchronously
      await this.webhookService.deleteWebhook(deleteData.webhookId);

      this.logger.log(`Webhook deleted successfully: ${deleteData.webhookId} (taskId: ${deleteData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process webhook delete request: ${errorMessage}`);
    }
  }
}
