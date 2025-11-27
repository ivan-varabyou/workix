import { Body, Controller, Delete, Get, HttpCode, Inject, Optional, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Workflows Controller - API Gateway
 * Documents all workflow endpoints for Swagger
 * All requests are proxied to Workflows Service (port 7106)
 */
@ApiTags('🔄 Workflows')
@Controller('workflows')
@ApiBearerAuth()
export class WorkflowsController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  /**
   * Extract userId from JWT token (simplified - в реальности нужно декодировать токен)
   */
  private extractUserIdFromToken(_authHeader?: string): string | undefined {
    return undefined;
  }

  @Post()
  @HttpCode(202) // 202 Accepted для асинхронной обработки
  @ApiOperation({
    summary: 'Create workflow',
    description: 'Create a new workflow (asynchronous via Event-Driven). The workflow will be created in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' }, steps: { type: 'array' } } } })
  @ApiResponse({
    status: 202,
    description: 'Workflow creation request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
      },
    },
  })
  async createWorkflow(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('workflow.*', 'workflow.create.request', {
        taskId,
        userId,
        workflowData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method || 'POST', body, headers);
  }

  @Get()
  @ApiOperation({ summary: 'Get workflows', description: 'Get all workflows for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  async getWorkflows(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID', description: 'Get workflow by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Workflow details' })
  async getWorkflowById(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    // id is used in path, not in function body
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Put(':id')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Update workflow',
    description: 'Update workflow (asynchronous via Event-Driven). The update will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 202, description: 'Workflow update request received' })
  async updateWorkflow(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('workflow.*', 'workflow.update.request', {
        taskId,
        workflowId: id,
        workflowData: body,
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
    summary: 'Delete workflow',
    description: 'Delete workflow (asynchronous via Event-Driven). The deletion will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 202, description: 'Workflow deletion request received' })
  async deleteWorkflow(@Param('id') id: string, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('workflow.*', 'workflow.delete.request', {
        taskId,
        workflowId: id,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method || 'DELETE', undefined, headers);
  }

  @Post(':id/run')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Run workflow',
    description: 'Execute workflow (asynchronous via Event-Driven). The execution will be started in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 202, description: 'Workflow execution started' })
  async runWorkflow(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('workflow.*', 'workflow.run.request', {
        taskId,
        workflowId: id,
        runData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method || 'POST', body, headers);
  }

  @Get(':id/runs')
  @ApiOperation({ summary: 'Get workflow runs', description: 'Get execution history for workflow' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of workflow runs' })
  async getWorkflowRuns(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    // id is used in path, not in function body
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }
}
