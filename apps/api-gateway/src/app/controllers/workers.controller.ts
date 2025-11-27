import { Body, Controller, Delete, Get, HttpCode, Inject, Optional, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Workers Controller - API Gateway
 * Documents all virtual worker endpoints for Swagger
 * All requests are proxied to Workers Service (port 7107)
 */
@ApiTags('🤖 Workers')
@Controller('workers')
@ApiBearerAuth()
export class WorkersController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  private extractUserIdFromToken(_authHeader?: string): string | undefined {
    return undefined;
  }

  @Post()
  @HttpCode(202)
  @ApiOperation({
    summary: 'Create worker',
    description: 'Create a new virtual worker (asynchronous via Event-Driven). The worker will be created in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' }, template: { type: 'string' } } } })
  @ApiResponse({
    status: 202,
    description: 'Worker creation request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
      },
    },
  })
  async createWorker(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('worker.*', 'worker.create.request', {
        taskId,
        userId,
        workerData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method || 'POST', body, headers);
  }

  @Get()
  @ApiOperation({ summary: 'Get workers', description: 'Get all workers for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of workers' })
  async getWorkers(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get worker by ID', description: 'Get worker by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Worker details' })
  async getWorkerById(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    // id is used in path, not in function body
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Put(':id')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Update worker',
    description: 'Update worker (asynchronous via Event-Driven). The update will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 202, description: 'Worker update request received' })
  async updateWorker(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('worker.*', 'worker.update.request', {
        taskId,
        workerId: id,
        workerData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method || 'POST', body, headers);
  }

  @Delete(':id')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Delete worker',
    description: 'Delete worker (asynchronous via Event-Driven). The deletion will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 202, description: 'Worker deletion request received' })
  async deleteWorker(@Param('id') id: string, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('worker.*', 'worker.delete.request', {
        taskId,
        workerId: id,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method || 'DELETE', undefined, headers);
  }

  @Post(':id/execute')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Execute worker',
    description: 'Execute worker task (asynchronous via Event-Driven). The execution will be started in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 202, description: 'Worker execution started' })
  async executeWorker(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('worker.*', 'worker.execute.request', {
        taskId,
        workerId: id,
        executionData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method || 'POST', body, headers);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get worker status', description: 'Get worker execution status' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Worker status' })
  async getWorkerStatus(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }
}
