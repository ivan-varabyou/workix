import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PipelineService } from '@workix/backend/domain/pipelines';
import {
  isPipelineCreateRequestData,
  isPipelineDeleteRequestData,
  isPipelineUpdateRequestData,
  type PipelineCreateRequestData,
  type PipelineDeleteRequestData,
  type PipelineUpdateRequestData,
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';

/**
 * PipelineEventsSubscriberService
 * Subscribes to pipeline.* events from API Gateway
 * and processes pipeline operations asynchronously
 */
@Injectable()
export class PipelineEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(PipelineEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly pipelineService: PipelineService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to pipeline.* events
    await this.pubSub.subscribe('pipeline.*', async (event: PubSubEvent): Promise<void> => {
      await this.handlePipelineEvent(event);
    });
    this.logger.log('Subscribed to pipeline.* events for pipeline operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from pipeline.* events');
  }

  private async handlePipelineEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'pipeline.create.request') {
        await this.handleCreateRequest(event.data);
      } else if (eventName === 'pipeline.update.request') {
        await this.handleUpdateRequest(event.data);
      } else if (eventName === 'pipeline.delete.request') {
        await this.handleDeleteRequest(event.data);
      } else if (eventName === 'pipeline.execute.request') {
        // Execute is handled by ExecutionsEventsSubscriberService
        this.logger.debug(`Pipeline execution request received: ${JSON.stringify(event.data)}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling pipeline event: ${errorMessage}`);
    }
  }

  private async handleCreateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isPipelineCreateRequestData(data)) {
        this.logger.warn('Invalid pipeline create request data');
        return;
      }

      const createData: PipelineCreateRequestData = data;

      if (!createData.userId || !createData.pipelineData) {
        this.logger.warn('Missing userId or pipelineData in create request');
        return;
      }

      this.logger.log(`Processing pipeline create request for user ${createData.userId} (taskId: ${createData.taskId})`);

      // Process pipeline creation asynchronously
      await this.pipelineService.create(createData.userId, createData.pipelineData);

      this.logger.log(`Pipeline created successfully (taskId: ${createData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process pipeline create request: ${errorMessage}`);
    }
  }

  private async handleUpdateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isPipelineUpdateRequestData(data)) {
        this.logger.warn('Invalid pipeline update request data');
        return;
      }

      const updateData: PipelineUpdateRequestData = data;

      if (!updateData.pipelineId || !updateData.userId || !updateData.updateData) {
        this.logger.warn('Missing pipelineId, userId, or updateData in update request');
        return;
      }

      this.logger.log(`Processing pipeline update request for ${updateData.pipelineId} (taskId: ${updateData.taskId})`);

      // Process pipeline update asynchronously
      await this.pipelineService.update(updateData.pipelineId, updateData.userId, updateData.updateData);

      this.logger.log(`Pipeline updated successfully: ${updateData.pipelineId} (taskId: ${updateData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process pipeline update request: ${errorMessage}`);
    }
  }

  private async handleDeleteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isPipelineDeleteRequestData(data)) {
        this.logger.warn('Invalid pipeline delete request data');
        return;
      }

      const deleteData: PipelineDeleteRequestData = data;

      if (!deleteData.pipelineId || !deleteData.userId) {
        this.logger.warn('Missing pipelineId or userId in delete request');
        return;
      }

      this.logger.log(`Processing pipeline delete request for ${deleteData.pipelineId} (taskId: ${deleteData.taskId})`);

      // Process pipeline deletion asynchronously
      await this.pipelineService.delete(deleteData.pipelineId, deleteData.userId);

      this.logger.log(`Pipeline deleted successfully: ${deleteData.pipelineId} (taskId: ${deleteData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process pipeline delete request: ${errorMessage}`);
    }
  }
}
