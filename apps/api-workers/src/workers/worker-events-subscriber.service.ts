import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { VirtualWorkerService, WorkerType } from '@workix/backend/domain/workers';
import {
  isWorkerCreateRequestData,
  isWorkerDeleteRequestData,
  isWorkerUpdateRequestData,
  PubSubEvent,
  PubSubSubscriberService,
  type WorkerCreateRequestData,
  type WorkerDeleteRequestData,
  type WorkerUpdateRequestData,
} from '@workix/backend/shared/core';

import { isValidWorkerType } from './interfaces/worker-type-guards.interface';

/**
 * WorkerEventsSubscriberService
 * Subscribes to worker.* events from API Gateway
 * and processes worker operations asynchronously
 */
@Injectable()
export class WorkerEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(WorkerEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly workerService: VirtualWorkerService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to worker.* events
    await this.pubSub.subscribe('worker.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleWorkerEvent(event);
    });
    this.logger.log('Subscribed to worker.* events for worker operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from worker.* events');
  }

  private async handleWorkerEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'worker.create.request') {
        await this.handleCreateRequest(event.data);
      } else if (eventName === 'worker.update.request') {
        await this.handleUpdateRequest(event.data);
      } else if (eventName === 'worker.delete.request') {
        await this.handleDeleteRequest(event.data);
      } else if (eventName === 'worker.execute.request') {
        // Execute is handled by ExecutionsEventsSubscriberService
        this.logger.debug(`Worker execution request received: ${JSON.stringify(event.data)}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling worker event: ${errorMessage}`);
    }
  }

  private async handleCreateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWorkerCreateRequestData(data)) {
        this.logger.warn('Invalid worker create request data');
        return;
      }

      const createData: WorkerCreateRequestData = data;

      if (!createData.config) {
        this.logger.warn('Missing config in create request');
        return;
      }

      this.logger.log(`Processing worker create request (taskId: ${createData.taskId})`);

      // Process worker creation asynchronously
      // Safely extract WorkerConfig from createData.config
      const configObj: unknown = createData.config;
      if (typeof configObj !== 'object' || configObj === null) {
        this.logger.warn('Invalid config structure in create request');
        return;
      }

      // Build WorkerConfig safely
      const workerConfig: {
        name: string;
        type: WorkerType;
        maxConcurrentTasks: number;
        retryAttempts: number;
        timeout: number;
        customPrompt?: string;
      } = {
        name: '',
        type: 'custom',
        maxConcurrentTasks: 1,
        retryAttempts: 3,
        timeout: 30000,
      };

      if ('name' in configObj && typeof configObj.name === 'string') {
        workerConfig.name = configObj.name;
      }
      if ('type' in configObj && typeof configObj.type === 'string' && isValidWorkerType(configObj.type)) {
        workerConfig.type = configObj.type;
      }
      if ('maxConcurrentTasks' in configObj && typeof configObj.maxConcurrentTasks === 'number') {
        workerConfig.maxConcurrentTasks = configObj.maxConcurrentTasks;
      }
      if ('retryAttempts' in configObj && typeof configObj.retryAttempts === 'number') {
        workerConfig.retryAttempts = configObj.retryAttempts;
      }
      if ('timeout' in configObj && typeof configObj.timeout === 'number') {
        workerConfig.timeout = configObj.timeout;
      }
      if ('customPrompt' in configObj && typeof configObj.customPrompt === 'string') {
        workerConfig.customPrompt = configObj.customPrompt;
      }

      if (!workerConfig.name) {
        this.logger.warn('Missing required name in config');
        return;
      }

      await this.workerService.createWorker(workerConfig);

      this.logger.log(`Worker created successfully (taskId: ${createData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process worker create request: ${errorMessage}`);
    }
  }

  private async handleUpdateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWorkerUpdateRequestData(data)) {
        this.logger.warn('Invalid worker update request data');
        return;
      }

      const updateData: WorkerUpdateRequestData = data;

      if (!updateData.workerId || !updateData.updateData) {
        this.logger.warn('Missing workerId or updateData in update request');
        return;
      }

      this.logger.log(`Processing worker update request for ${updateData.workerId} (taskId: ${updateData.taskId})`);

      // Process worker update asynchronously
      // Safely extract Partial<WorkerConfig> from updateData.updateData
      const updateDataObj: unknown = updateData.updateData;
      if (typeof updateDataObj !== 'object' || updateDataObj === null) {
        this.logger.warn('Invalid updateData structure');
        return;
      }

      // Build Partial<WorkerConfig> safely
      const workerUpdateData: Partial<{
        name: string;
        type: WorkerType;
        maxConcurrentTasks: number;
        retryAttempts: number;
        timeout: number;
        customPrompt?: string;
      }> = {};

      if ('name' in updateDataObj && typeof updateDataObj.name === 'string') {
        workerUpdateData.name = updateDataObj.name;
      }
      if ('type' in updateDataObj && typeof updateDataObj.type === 'string' && isValidWorkerType(updateDataObj.type)) {
        workerUpdateData.type = updateDataObj.type;
      }
      if ('maxConcurrentTasks' in updateDataObj && typeof updateDataObj.maxConcurrentTasks === 'number') {
        workerUpdateData.maxConcurrentTasks = updateDataObj.maxConcurrentTasks;
      }
      if ('retryAttempts' in updateDataObj && typeof updateDataObj.retryAttempts === 'number') {
        workerUpdateData.retryAttempts = updateDataObj.retryAttempts;
      }
      if ('timeout' in updateDataObj && typeof updateDataObj.timeout === 'number') {
        workerUpdateData.timeout = updateDataObj.timeout;
      }
      if ('customPrompt' in updateDataObj && typeof updateDataObj.customPrompt === 'string') {
        workerUpdateData.customPrompt = updateDataObj.customPrompt;
      }


      await this.workerService.updateWorker(updateData.workerId, workerUpdateData);

      this.logger.log(`Worker updated successfully: ${updateData.workerId} (taskId: ${updateData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process worker update request: ${errorMessage}`);
    }
  }

  private async handleDeleteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWorkerDeleteRequestData(data)) {
        this.logger.warn('Invalid worker delete request data');
        return;
      }

      const deleteData: WorkerDeleteRequestData = data;

      if (!deleteData.workerId) {
        this.logger.warn('Missing workerId in delete request');
        return;
      }

      this.logger.log(`Processing worker delete request for ${deleteData.workerId} (taskId: ${deleteData.taskId})`);

      // Process worker deletion asynchronously
      await this.workerService.deleteWorker(deleteData.workerId);

      this.logger.log(`Worker deleted successfully: ${deleteData.workerId} (taskId: ${deleteData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process worker delete request: ${errorMessage}`);
    }
  }
}
