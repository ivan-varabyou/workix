import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ExecutionService, PipelineExecutorService } from '@workix/backend/domain/pipelines';
import {
  isPipelineExecutionRequestData,
  type PipelineExecutionRequestData,
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';

/**
 * ExecutionsEventsSubscriberService
 * Subscribes to pipeline.execute.request events from API Gateway
 * and processes pipeline executions asynchronously
 */
@Injectable()
export class ExecutionsEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(ExecutionsEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly executionService: ExecutionService,
    private readonly pipelineExecutor: PipelineExecutorService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to pipeline.* events for execution requests
    await this.pubSub.subscribe('pipeline.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleExecutionEvent(event);
    });
    this.logger.log('Subscribed to pipeline.* events for execution processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from pipeline.* events');
  }

  private async handleExecutionEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'pipeline.execute.request') {
        await this.handleExecuteRequest(event.data);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling execution event: ${errorMessage}`);
    }
  }

  private async handleExecuteRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isPipelineExecutionRequestData(data)) {
        this.logger.warn('Invalid pipeline execute request data');
        return;
      }

      const executeData: PipelineExecutionRequestData = data;

      if (!executeData.pipelineId || !executeData.userId) {
        this.logger.warn('Missing pipelineId or userId in execute request');
        return;
      }

      this.logger.log(`Processing pipeline execution request for ${executeData.pipelineId} (taskId: ${executeData.taskId})`);

      // Create execution record with userId first
      const execution: { id: string } = await this.executionService.create(
        executeData.pipelineId,
        executeData.userId,
        executeData.inputs || {}
      );

      // Execute pipeline asynchronously
      // Note: executePipeline creates its own execution, so we'll update our execution after
      try {
        const result: { output: unknown } = await this.pipelineExecutor.executePipeline(
          executeData.pipelineId,
          executeData.inputs || {}
        );

        // Update our execution with results from executePipeline
        // Note: executePipeline creates a separate execution, so we sync the status
        await this.executionService.updateStatus(execution.id, 'success');
        await this.executionService.setOutputs(execution.id, result.output);

        this.logger.log(`Pipeline execution completed successfully: ${execution.id} (taskId: ${executeData.taskId})`);
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        // Update our execution with error status
        await this.executionService.updateStatus(execution.id, 'failed', errorMessage);
        this.logger.error(`Pipeline execution failed: ${execution.id} (taskId: ${executeData.taskId}) - ${errorMessage}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process pipeline execute request: ${errorMessage}`);
    }
  }
}
