import { Body, Controller, Get, Inject, Optional,Param, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';
import { CreateExecutionDto } from './dto/create-execution.dto';

/**
 * Executions Controller - API Gateway
 * Documents all execution endpoints for Swagger
 * All requests are proxied to Pipeline Service (port 5002)
 */
@ApiTags('⚙️ Executions')
@Controller('executions')
@ApiBearerAuth()
export class ExecutionsController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  /**
   * Create execution
   */
  @Post()
  @ApiOperation({
    summary: 'Create new execution',
    description: 'Starts a new pipeline execution',
  })
  @ApiBody({ type: CreateExecutionDto })
  @ApiResponse({
    status: 201,
    description: 'Execution created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'execution_123' },
        pipelineId: { type: 'string', example: 'pipeline_123' },
        userId: { type: 'string', example: 'user_123' },
        status: { type: 'string', example: 'pending' },
        inputs: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  async createExecution(@Body() dto: CreateExecutionDto, @Req() req: Request): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('pipeline.*', 'pipeline.execute.request', {
        taskId,
        pipelineId: dto.pipelineId,
        userId,
        inputs: dto.inputs,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Pipeline execution request received. You will receive a notification when completed.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/executions', 'POST', dto, headers);
  }

  /**
   * Extract userId from JWT token (simplified - в реальности нужно декодировать токен)
   */
  private extractUserIdFromToken(_authHeader?: string): string | undefined {
    // TODO: Декодировать JWT токен для получения userId
    // Пока возвращаем undefined - будет добавлено позже
    return undefined;
  }

  /**
   * Get execution by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get execution by ID',
    description: 'Retrieves a specific execution by ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Execution ID (UUID)',
    example: 'execution_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Execution found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        pipelineId: { type: 'string' },
        userId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['pending', 'running', 'success', 'failed', 'timeout'],
        },
        inputs: { type: 'object' },
        outputs: { type: 'object' },
        stepResults: { type: 'object' },
        error: { type: 'string' },
        durationMs: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExecution(@Param('id') id: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/executions/${id}`, 'GET', null, headers);
  }

  /**
   * Get user's executions
   */
  @Get()
  @ApiOperation({
    summary: 'Get user executions',
    description: 'Retrieves all executions for the authenticated user',
  })
  @ApiQuery({
    name: 'pipelineId',
    required: false,
    type: String,
    description: 'Filter by pipeline ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
    enum: ['pending', 'running', 'success', 'failed', 'timeout'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit results',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset results',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Executions retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          pipelineId: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserExecutions(
    @Req() req: Request,
    @Query('pipelineId') pipelineId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    const query: URLSearchParams = new URLSearchParams();
    if (pipelineId) query.append('pipelineId', pipelineId);
    if (status) query.append('status', status);
    if (limit) query.append('limit', String(limit));
    if (offset) query.append('offset', String(offset));
    const queryString: string = query.toString() ? `?${query.toString()}` : '';
    return await this.proxyService.routeRequest(
      `/api/executions${queryString}`,
      'GET',
      null,
      headers
    );
  }
}
