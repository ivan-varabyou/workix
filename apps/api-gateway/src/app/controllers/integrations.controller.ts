import { Body, Controller, Get, HttpCode, Inject, Optional, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Integrations Controller - API Gateway
 * Documents all integration endpoints for Swagger
 * All requests are proxied to Integrations Service (port 7110)
 */
@ApiTags('🔗 Integrations')
@Controller('integrations')
@ApiBearerAuth()
export class IntegrationsController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  private extractUserIdFromToken(_authHeader?: string): string | undefined {
    return undefined;
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get integration providers', description: 'Get list of available integration providers' })
  @ApiResponse({ status: 200, description: 'List of integration providers' })
  async getProviders(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, undefined, req.headers as Record<string, string>);
  }

  @Post('providers')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Create integration provider',
    description: 'Create new integration provider (asynchronous via Event-Driven). The provider will be created in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string' } } } })
  @ApiResponse({
    status: 202,
    description: 'Integration provider creation request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
      },
    },
  })
  async createProvider(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('integration.*', 'integration.provider.create.request', {
        taskId,
        userId,
        providerData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get integration provider by ID', description: 'Get integration provider by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Integration provider details' })
  async getProviderById(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Put('providers/:id')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Update integration provider',
    description: 'Update integration provider (asynchronous via Event-Driven). The update will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 202, description: 'Integration provider update request received' })
  async updateProvider(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('integration.*', 'integration.provider.update.request', {
        taskId,
        providerId: id,
        providerData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Post('providers/:id/credentials')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Set integration credentials',
    description: 'Set credentials for integration provider (asynchronous via Event-Driven). The credentials will be set in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { credentials: { type: 'object' } } } })
  @ApiResponse({ status: 202, description: 'Credentials setting request received' })
  async setCredentials(@Param('id') id: string, @Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('integration.*', 'integration.credentials.set.request', {
        taskId,
        providerId: id,
        credentialsData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Post('providers/:id/connect')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Connect integration',
    description: 'Connect to integration provider (asynchronous via Event-Driven). The connection will be established in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 202, description: 'Integration connection request received' })
  async connectIntegration(@Param('id') id: string, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('integration.*', 'integration.connect.request', {
        taskId,
        providerId: id,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, undefined, headers);
  }

  @Post('providers/:id/disconnect')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Disconnect integration',
    description: 'Disconnect from integration provider (asynchronous via Event-Driven). The disconnection will be processed in the background.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 202, description: 'Integration disconnection request received' })
  async disconnectIntegration(@Param('id') id: string, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      await this.pubSub.publish('integration.*', 'integration.disconnect.request', {
        taskId,
        providerId: id,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, undefined, headers);
  }
}
