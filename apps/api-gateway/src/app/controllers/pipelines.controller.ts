import { Body, Controller, Delete, Get, HttpCode, Inject, Optional, Param, Post, Put, Query, Req } from '@nestjs/common';
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
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';

/**
 * Pipelines Controller - API Gateway
 * Documents all pipeline endpoints for Swagger
 * All requests are proxied to Pipeline Service (port 5002)
 */
@ApiTags('📦 Pipelines')
@Controller('pipelines')
@ApiBearerAuth()
export class PipelinesController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  /**
   * Create pipeline (Event-Driven - асинхронная обработка)
   */
  @Post()
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Create new pipeline',
    description: 'Creates a new pipeline for the authenticated user (asynchronous via Event-Driven). The pipeline will be created in the background.',
  })
  @ApiBody({ type: CreatePipelineDto })
  @ApiResponse({
    status: 202,
    description: 'Pipeline creation request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'Pipeline creation request received. The pipeline will be created in the background.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreatePipelineDto, @Req() req: Request): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('pipeline.*', 'pipeline.create.request', {
        taskId,
        userId,
        pipelineData: dto,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Pipeline creation request received. The pipeline will be created in the background.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/pipelines', 'POST', dto, headers);
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
   * Get user's pipelines
   */
  @Get()
  @ApiOperation({
    summary: 'Get user pipelines',
    description: 'Retrieves all pipelines for the authenticated user',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipelines retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          userId: { type: 'string' },
          isPublic: { type: 'boolean' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPipelines(
    @Req() req: Request,
    @Query('isActive') isActive?: boolean,
    @Query('category') category?: string
  ): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    const query: URLSearchParams = new URLSearchParams();
    if (isActive !== undefined) query.append('isActive', String(isActive));
    if (category) query.append('category', category);
    const queryString: string = query.toString() ? `?${query.toString()}` : '';
    return await this.proxyService.routeRequest(
      `/api/pipelines${queryString}`,
      'GET',
      null,
      headers
    );
  }

  /**
   * Get pipeline by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get pipeline by ID',
    description: 'Retrieves a specific pipeline by ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Pipeline ID (UUID)',
    example: 'pipeline_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        userId: { type: 'string' },
        isPublic: { type: 'boolean' },
        graph: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPipeline(@Param('id') id: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/pipelines/${id}`, 'GET', null, headers);
  }

  /**
   * Update pipeline (Event-Driven - асинхронная обработка)
   */
  @Put(':id')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Update pipeline',
    description: 'Updates an existing pipeline (asynchronous via Event-Driven). The update will be processed in the background.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Pipeline ID (UUID)',
    example: 'pipeline_123',
  })
  @ApiBody({ type: UpdatePipelineDto })
  @ApiResponse({
    status: 202,
    description: 'Pipeline update request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'Pipeline update request received. The update will be processed in the background.' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePipeline(
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
    @Req() req: Request
  ): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('pipeline.*', 'pipeline.update.request', {
        taskId,
        pipelineId: id,
        userId,
        updateData: dto,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Pipeline update request received. The update will be processed in the background.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/pipelines/${id}`, 'PUT', dto, headers);
  }

  /**
   * Delete pipeline (Event-Driven - асинхронная обработка)
   */
  @Delete(':id')
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Delete pipeline',
    description: 'Soft-deletes a pipeline (asynchronous via Event-Driven). The deletion will be processed in the background.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Pipeline ID (UUID)',
    example: 'pipeline_123',
  })
  @ApiResponse({
    status: 202,
    description: 'Pipeline deletion request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
        message: { type: 'string', example: 'Pipeline deletion request received. The deletion will be processed in the background.' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deletePipeline(@Param('id') id: string, @Req() req: Request): Promise<{ taskId: string; status: string; message: string } | unknown> {
    // Асинхронная операция - публикуем событие вместо HTTP проксирования
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);

      // Публикуем событие для асинхронной обработки
      await this.pubSub.publish('pipeline.*', 'pipeline.delete.request', {
        taskId,
        pipelineId: id,
        userId,
        timestamp: new Date().toISOString(),
      });

      return {
        taskId,
        status: 'processing',
        message: 'Pipeline deletion request received. The deletion will be processed in the background.',
      };
    }

    // Fallback: HTTP проксирование, если PubSub недоступен
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/pipelines/${id}`, 'DELETE', null, headers);
  }

  /**
   * Publish pipeline
   */
  @Post(':id/publish')
  @ApiOperation({
    summary: 'Publish pipeline',
    description: 'Makes a pipeline public and available in marketplace',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Pipeline ID (UUID)',
    example: 'pipeline_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline published successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        isPublic: { type: 'boolean', example: true },
        publishedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async publishPipeline(@Param('id') id: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(
      `/api/pipelines/${id}/publish`,
      'POST',
      null,
      headers
    );
  }

  /**
   * Unpublish pipeline
   */
  @Post(':id/unpublish')
  @ApiOperation({
    summary: 'Unpublish pipeline',
    description: 'Makes a pipeline private',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Pipeline ID (UUID)',
    example: 'pipeline_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline unpublished successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        isPublic: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unpublishPipeline(@Param('id') id: string, @Req() req: Request) {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(
      `/api/pipelines/${id}/unpublish`,
      'POST',
      null,
      headers
    );
  }

  /**
   * Get public pipelines
   */
  @Get('public')
  @ApiOperation({
    summary: 'Get public pipelines',
    description: 'Retrieves all public pipelines (marketplace)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
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
    description: 'Public pipelines retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          isPublic: { type: 'boolean', example: true },
        },
      },
    },
  })
  async getPublicPipelines(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (limit) query.append('limit', String(limit));
    if (offset) query.append('offset', String(offset));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await this.proxyService.routeRequest(`/api/pipelines/public${queryString}`, 'GET');
  }
}
