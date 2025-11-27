import { Body, Controller, Delete, Get, HttpCode, Inject, Optional, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * A/B Testing Controller - API Gateway
 * Documents all A/B testing endpoints for Swagger
 * All requests are proxied to A/B Testing Service (port 7108)
 */
@ApiTags('🧪 A/B Testing')
@Controller('ab-tests')
@ApiBearerAuth()
export class AbTestingController {
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
    summary: 'Create A/B test',
    description: 'Create a new A/B test (asynchronous via Event-Driven). The test will be created in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' }, variants: { type: 'array' } } } })
  @ApiResponse({
    status: 202,
    description: 'A/B test creation request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
      },
    },
  })
  async createAbTest(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('ab-test.*', 'ab-test.create.request', {
        taskId,
        userId,
        testData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Get()
  @ApiOperation({ summary: 'Get A/B tests', description: 'Get all A/B tests for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of A/B tests' })
  async getAbTests(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, undefined, req.headers as Record<string, string>);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get A/B test by ID', description: 'Get A/B test by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'A/B test details' })
  async getAbTestById(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Put(':id')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Update A/B test',
    description: 'Update A/B test (asynchronous via Event-Driven). The update will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 202, description: 'A/B test update request received' })
  async updateAbTest(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('ab-test.*', 'ab-test.update.request', {
        taskId,
        testId: id,
        testData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Delete(':id')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Delete A/B test',
    description: 'Delete A/B test (asynchronous via Event-Driven). The deletion will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 202, description: 'A/B test deletion request received' })
  async deleteAbTest(@Param('id') id: string, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('ab-test.*', 'ab-test.delete.request', {
        taskId,
        testId: id,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, undefined, headers);
  }

  @Post(':id/track')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Track A/B test event',
    description: 'Track event for A/B test variant (asynchronous via Event-Driven). The event will be tracked in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { variant: { type: 'string' }, event: { type: 'string' } } } })
  @ApiResponse({ status: 202, description: 'Event tracking request received' })
  async trackAbTest(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('ab-test.*', 'ab-test.track.request', {
        taskId,
        testId: id,
        trackData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get A/B test results', description: 'Get A/B test analytics and results' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'A/B test results' })
  async getAbTestResults(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }
}
