import { Body, Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtGuard } from '@workix/domain/auth';
import { ExecutionService, PipelineExecutorService } from '@workix/domain/pipelines';
import { BasePayload } from '@workix/integrations/core';

@Controller('executions')
@ApiTags('executions')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ExecutionsController {
  constructor(
    private executionService: ExecutionService,
    private pipelineExecutor: PipelineExecutorService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Start pipeline execution' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
        input: {
          type: 'object',
          description: 'Input data for pipeline execution',
          additionalProperties: true,
        },
        options: {
          type: 'object',
          properties: {
            async: { type: 'boolean', description: 'Run asynchronously' },
          },
        },
      },
      required: ['pipelineId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Execution started successfully' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async createExecution(
    @Body()
    body: {
      pipelineId: string;
      input?: BasePayload;
      options?: { async?: boolean };
    },
    @CurrentUser('userId') userId: string
  ) {
    const { pipelineId, input = {}, options } = body;

    if (!pipelineId) {
      throw new NotFoundException('Pipeline ID is required');
    }

    // If async, create execution record and return immediately
    if (options?.async) {
      const execution = await this.executionService.create(pipelineId, userId, input);
      // TODO: Queue execution for async processing
      return { executionId: execution.id, status: 'pending', message: 'Execution queued' };
    }

    // Synchronous execution
    try {
      const result = await this.pipelineExecutor.executePipeline(pipelineId, input);
      return {
        executionId: result.executionId,
        status: 'success',
        output: result.output,
        duration: result.duration,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get execution by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Execution ID' })
  @ApiResponse({ status: 200, description: 'Execution details' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async getExecution(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string
  ) {
    const execution = await this.executionService.findById(id);

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    // Check if user owns this execution
    if (execution.userId !== userId) {
      throw new NotFoundException('Execution not found');
    }

    return execution;
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get execution statistics' })
  @ApiParam({ name: 'id', type: 'string', description: 'Execution ID' })
  @ApiResponse({ status: 200, description: 'Execution statistics' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async getExecutionStats(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string
  ) {
    const execution = await this.executionService.findById(id);

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    // Check if user owns this execution
    if (execution.userId !== userId) {
      throw new NotFoundException('Execution not found');
    }

    // Calculate stats from execution data
    const stats = {
      executionId: execution.id,
      status: execution.status,
      durationMs: execution.durationMs || 0,
      stepsExecuted: execution.stepsExecuted || 0,
      stepsFailed: execution.stepsFailed || 0,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      successRate:
        execution.stepsExecuted > 0
          ? ((execution.stepsExecuted - execution.stepsFailed) / execution.stepsExecuted) * 100
          : 0,
      hasError: !!execution.error,
      errorMessage: execution.errorMessage || null,
    };

    return stats;
  }

  @Get()
  @ApiOperation({ summary: 'Get user executions' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'User executions retrieved' })
  async getUserExecutions(
    @CurrentUser('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    const options: { limit?: number; offset?: number } = {};
    if (limit !== undefined) {
      options.limit = Number(limit);
    }
    if (offset !== undefined) {
      options.offset = Number(offset);
    }
    const [executions, total] = await this.executionService.findByUserId(userId, options);
    return { executions, total, page: Math.floor((options.offset || 0) / (options.limit || 10)) + 1 };
  }
}
