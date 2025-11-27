import { Inject, Injectable, Optional } from '@nestjs/common';
import { BasePayload } from '@workix/integrations/core';

import {
  ExecutionPrismaService,
  ExecutionStats,
  ExecutionStatus,
  ExecutionStepResults,
  PipelineExecution,
  StepResult,
} from '../interfaces/pipeline-execution.interface';

/**
 * ExecutionService
 * Manages pipeline executions
 * Uses PrismaService injected from the service that uses this library
 */
@Injectable()
export class ExecutionService {
  // private readonly _logger = new Logger(ExecutionService.name); // Reserved for future use
  private readonly prisma: ExecutionPrismaService;

  constructor(@Optional() @Inject('PrismaService') prisma?: ExecutionPrismaService) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Use PipelinesModule.forRoot(prismaService)');
    }
    this.prisma = prisma;
  }

  /**
   * Create new execution
   */
  async create(
    pipelineId: string,
    userId: string,
    inputs: BasePayload = {}
  ): Promise<PipelineExecution> {
    const execution: PipelineExecution = await this.prisma.execution.create({
      data: {
        pipelineId,
        userId,
        inputs,
        status: 'pending',
        outputs: {},
        stepResults: {},
        stepsExecuted: 0,
        stepsFailed: 0,
        startedAt: new Date(),
      },
    });
    return execution;
  }

  /**
   * Get execution by ID
   */
  async findById(id: string): Promise<PipelineExecution | null> {
    return await this.prisma.execution.findUnique({ where: { id } });
  }

  /**
   * Get user's executions
   */
  async findByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<[PipelineExecution[], number]> {
    const findManyArgs: {
      where: { userId: string };
      orderBy: { createdAt: string };
      take?: number;
      skip?: number;
    } = {
      where: { userId },
      orderBy: { createdAt: 'desc' },
    };
    if (options.limit !== undefined) {
      findManyArgs.take = options.limit;
    }
    if (options.offset !== undefined) {
      findManyArgs.skip = options.offset;
    }
    const [executions, total] = await Promise.all([
      this.prisma.execution.findMany(findManyArgs),
      this.prisma.execution.count({ where: { userId } }),
    ]);
    return [executions, total];
  }

  /**
   * Update execution status
   */
  async updateStatus(
    id: string,
    status: ExecutionStatus,
    error?: string
  ): Promise<PipelineExecution | null> {
    const execution: PipelineExecution | null = await this.findById(id);
    if (!execution) return null;

    const updateData: {
      status: ExecutionStatus;
      error?: string;
      errorMessage?: string;
      completedAt?: Date;
      durationMs?: number;
    } = { status };
    if (error) {
      updateData.error = error;
      updateData.errorMessage = error;
    }
    if (status !== 'pending' && status !== 'running') {
      const completedAt = new Date();
      updateData.completedAt = completedAt;
      if (execution.startedAt) {
        updateData.durationMs = completedAt.getTime() - new Date(execution.startedAt).getTime();
      }
    }

    return await this.prisma.execution.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Update step results
   */
  async addStepResult(
    id: string,
    stepId: string,
    result: BasePayload | null,
    error?: string
  ): Promise<void> {
    const execution: PipelineExecution | null = await this.findById(id);
    if (!execution) return;

    const stepResults: ExecutionStepResults = execution.stepResults || {};
    const stepResult: StepResult = {
      result: result || {},
      timestamp: new Date(),
    };
    if (error !== undefined) {
      stepResult.error = error;
    }
    stepResults[stepId] = stepResult;

    await this.prisma.execution.update({
      where: { id },
      data: {
        stepResults,
        stepsExecuted: execution.stepsExecuted + 1,
        stepsFailed: error ? execution.stepsFailed + 1 : execution.stepsFailed,
      },
    });
  }

  /**
   * Set final outputs
   */
  async setOutputs(id: string, outputs: BasePayload): Promise<void> {
    await this.prisma.execution.update({
      where: { id },
      data: { outputs },
    });
  }

  /**
   * Get statistics
   */
  async getStats(pipelineId: string): Promise<ExecutionStats> {
    const executions: PipelineExecution[] = await this.prisma.execution.findMany({
      where: { pipelineId },
    });

    const total: number = executions.length;
    const successful: number = executions.filter(
      (e: PipelineExecution) => e.status === 'success'
    ).length;
    const failed: number = executions.filter(
      (e: PipelineExecution) => e.status === 'failed'
    ).length;
    const executionsWithDuration: PipelineExecution[] = executions.filter(
      (e: PipelineExecution) => e.durationMs !== undefined
    );
    const avgDuration: number =
      executionsWithDuration.reduce(
        (sum: number, e: PipelineExecution) => sum + (e.durationMs || 0),
        0
      ) / Math.max(1, executionsWithDuration.length);

    return { total, successful, failed, avgDuration };
  }
}
