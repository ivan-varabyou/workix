import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';
import { BasePayload } from '@workix/integrations/core';

import {
  ExecutionPrismaService,
  PipelineExecution,
  PipelineExecutionResult,
  PipelinePrismaService,
  PipelineWithSteps,
} from '../interfaces/pipeline-execution.interface';
import { StepExecutorService } from './step-executor.service';

/**
 * Pipeline Executor Service
 * Orchestrates pipeline execution
 */
@Injectable()
export class PipelineExecutorService {
  private readonly logger = new Logger(PipelineExecutorService.name);
  private readonly prisma: PipelinePrismaService & ExecutionPrismaService;

  constructor(
    @Inject('PrismaService') prisma: PipelinePrismaService & ExecutionPrismaService,
    private readonly stepExecutor: StepExecutorService,
    private readonly i18n: I18nService
  ) {
    this.prisma = prisma;
  }

  /**
   * Execute pipeline
   */
  async executePipeline(
    pipelineId: string,
    input: BasePayload = {}
  ): Promise<PipelineExecutionResult> {
    const pipelineResult = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    const pipeline: PipelineWithSteps | null =
      pipelineResult && 'steps' in pipelineResult ? (pipelineResult as PipelineWithSteps) : null;

    if (!pipeline) {
      throw new BadRequestException(this.i18n.translate('pipelines.not_found'));
    }

    const execution: PipelineExecution = await this.prisma.execution.create({
      data: {
        pipelineId,
        status: 'running',
        input: JSON.stringify(input),
      },
    });

    let current: BasePayload = input;
    const startTime: number = Date.now();

    try {
      for (const step of pipeline.steps) {
        const result = await this.stepExecutor.executeStep(step.id, execution.id, current);

        if (!result.success) {
          throw new Error(result.error);
        }

        current = result.output || {};
      }

      const duration: number = Date.now() - startTime;

      await this.prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'success',
          outputs: current,
          durationMs: duration,
        },
      });

      this.logger.log(`Pipeline executed successfully: ${pipelineId}`);
      return { executionId: execution.id, output: current, duration };
    } catch (error: unknown) {
      const duration: number = Date.now() - startTime;
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      await this.prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          error: errorMessage,
          durationMs: duration,
        },
      });

      this.logger.error(`Pipeline execution failed: ${pipelineId} - ${errorMessage}`);
      throw new BadRequestException(`Pipeline execution failed: ${errorMessage}`);
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<PipelineExecution | null> {
    return await this.prisma.execution.findUnique({
      where: { id: executionId },
    });
  }

  /**
   * Get pipeline executions
   */
  async getPipelineExecutions(pipelineId: string, take = 10): Promise<PipelineExecution[]> {
    return await this.prisma.execution.findMany({
      where: { pipelineId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /**
   * Retry execution
   */
  async retryExecution(executionId: string): Promise<PipelineExecutionResult> {
    const execution: PipelineExecution | null = await this.prisma.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new BadRequestException(this.i18n.translate('pipelines.execution_not_found'));
    }

    const input: BasePayload =
      typeof execution.inputs === 'string' ? JSON.parse(execution.inputs) : execution.inputs;
    return await this.executePipeline(execution.pipelineId, input);
  }
}
