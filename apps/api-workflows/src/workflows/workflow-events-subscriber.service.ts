import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WorkflowService } from '@workix/domain/workflows';
import {
  isWorkflowCreateRequestData,
  isWorkflowDeleteRequestData,
  isWorkflowUpdateRequestData,
  PubSubEvent,
  PubSubSubscriberService,
  type WorkflowCreateRequestData,
  type WorkflowDeleteRequestData,
  type WorkflowUpdateRequestData,
} from '@workix/backend/shared/core';

/**
 * WorkflowEventsSubscriberService
 * Subscribes to workflow.* events from API Gateway
 * and processes workflow operations asynchronously
 */
@Injectable()
export class WorkflowEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(WorkflowEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly workflowService: WorkflowService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to workflow.* events
    await this.pubSub.subscribe('workflow.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleWorkflowEvent(event);
    });
    this.logger.log('Subscribed to workflow.* events for workflow operations processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from workflow.* events');
  }

  private async handleWorkflowEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'workflow.create.request') {
        await this.handleCreateRequest(event.data);
      } else if (eventName === 'workflow.update.request') {
        await this.handleUpdateRequest(event.data);
      } else if (eventName === 'workflow.delete.request') {
        await this.handleDeleteRequest(event.data);
      } else if (eventName === 'workflow.execute.request') {
        // Execute is handled by ExecutionsEventsSubscriberService
        this.logger.debug(`Workflow execution request received: ${JSON.stringify(event.data)}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling workflow event: ${errorMessage}`);
    }
  }

  private async handleCreateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWorkflowCreateRequestData(data)) {
        this.logger.warn('Invalid workflow create request data');
        return;
      }

      const createData: WorkflowCreateRequestData = data;

      if (!createData.userId || !createData.name) {
        this.logger.warn('Missing userId or name in create request');
        return;
      }

      this.logger.log(`Processing workflow create request for user ${createData.userId} (taskId: ${createData.taskId})`);

      // Process workflow creation asynchronously
      await this.workflowService.createWorkflow(
        createData.userId,
        createData.name,
        createData.description || '',
        createData.steps || [],
        createData.triggers || []
      );

      this.logger.log(`Workflow created successfully (taskId: ${createData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process workflow create request: ${errorMessage}`);
    }
  }

  private async handleUpdateRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWorkflowUpdateRequestData(data)) {
        this.logger.warn('Invalid workflow update request data');
        return;
      }

      const updateData: WorkflowUpdateRequestData = data;

      if (!updateData.workflowId || !updateData.userId || !updateData.updateData) {
        this.logger.warn('Missing workflowId, userId, or updateData in update request');
        return;
      }

      this.logger.log(`Processing workflow update request for ${updateData.workflowId} (taskId: ${updateData.taskId})`);

      // Process workflow update asynchronously
      // Build update data safely
      const updateDataObj: unknown = updateData.updateData;
      const workflowUpdateData: {
        name?: string;
        description?: string;
        steps?: unknown;
        triggers?: unknown;
        enabled?: boolean;
      } = {};

      if (typeof updateDataObj === 'object' && updateDataObj !== null) {
        if ('name' in updateDataObj && typeof updateDataObj.name === 'string') {
          workflowUpdateData.name = updateDataObj.name;
        }
        if ('description' in updateDataObj && typeof updateDataObj.description === 'string') {
          workflowUpdateData.description = updateDataObj.description;
        }
        if ('steps' in updateDataObj) {
          workflowUpdateData.steps = updateDataObj.steps;
        }
        if ('triggers' in updateDataObj) {
          workflowUpdateData.triggers = updateDataObj.triggers;
        }
        if ('enabled' in updateDataObj && typeof updateDataObj.enabled === 'boolean') {
          workflowUpdateData.enabled = updateDataObj.enabled;
        }
      }

      await this.workflowService.updateWorkflow(updateData.workflowId, workflowUpdateData);

      this.logger.log(`Workflow updated successfully: ${updateData.workflowId} (taskId: ${updateData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process workflow update request: ${errorMessage}`);
    }
  }

  private async handleDeleteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isWorkflowDeleteRequestData(data)) {
        this.logger.warn('Invalid workflow delete request data');
        return;
      }

      const deleteData: WorkflowDeleteRequestData = data;

      if (!deleteData.workflowId || !deleteData.userId) {
        this.logger.warn('Missing workflowId or userId in delete request');
        return;
      }

      this.logger.log(`Processing workflow delete request for ${deleteData.workflowId} (taskId: ${deleteData.taskId})`);

      // Process workflow deletion asynchronously
      await this.workflowService.deleteWorkflow(deleteData.workflowId);

      this.logger.log(`Workflow deleted successfully: ${deleteData.workflowId} (taskId: ${deleteData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process workflow delete request: ${errorMessage}`);
    }
  }
}
