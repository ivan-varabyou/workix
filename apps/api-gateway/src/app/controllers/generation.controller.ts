import { Body, Controller, HttpCode, Inject, Optional, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PubSubPublisherService } from '@workix/shared/backend/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Generation Controller - API Gateway
 * Documents all AI generation endpoints for Swagger
 * All requests are proxied to Generation Service (port 7111)
 */
@ApiTags('🎨 Generation')
@Controller('generation')
@ApiBearerAuth()
export class GenerationController {
  constructor(
    private proxyService: ProxyService,
    @Optional() @Inject(PubSubPublisherService) private pubSub?: PubSubPublisherService
  ) {}

  private extractUserIdFromToken(_authHeader?: string): string | undefined {
    return undefined;
  }

  @Post('text')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Generate text',
    description: 'Generate text using AI (asynchronous via Event-Driven). The generation will be processed in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { prompt: { type: 'string' }, model: { type: 'string' } } } })
  @ApiResponse({
    status: 202,
    description: 'Text generation request received and is being processed',
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', example: 'uuid_123' },
        status: { type: 'string', example: 'processing' },
      },
    },
  })
  async generateText(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('generation.*', 'generation.text.request', {
        taskId,
        userId,
        generationData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Post('image')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Generate image',
    description: 'Generate image using AI (asynchronous via Event-Driven). The generation will be processed in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { prompt: { type: 'string' }, size: { type: 'string' } } } })
  @ApiResponse({ status: 202, description: 'Image generation request received' })
  async generateImage(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('generation.*', 'generation.image.request', {
        taskId,
        userId,
        generationData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Post('video')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Generate video',
    description: 'Generate video using AI (asynchronous via Event-Driven). The generation will be processed in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { prompt: { type: 'string' }, duration: { type: 'number' } } } })
  @ApiResponse({ status: 202, description: 'Video generation request received' })
  async generateVideo(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('generation.*', 'generation.video.request', {
        taskId,
        userId,
        generationData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Post('speech')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Generate speech',
    description: 'Generate speech from text using AI (asynchronous via Event-Driven). The generation will be processed in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { text: { type: 'string' }, voice: { type: 'string' } } } })
  @ApiResponse({ status: 202, description: 'Speech generation request received' })
  async generateSpeech(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('generation.*', 'generation.speech.request', {
        taskId,
        userId,
        generationData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Post('embedding')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Generate embedding',
    description: 'Generate text embedding using AI (asynchronous via Event-Driven). The generation will be processed in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { text: { type: 'string' }, model: { type: 'string' } } } })
  @ApiResponse({ status: 202, description: 'Embedding generation request received' })
  async generateEmbedding(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('generation.*', 'generation.embedding.request', {
        taskId,
        userId,
        generationData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }

  @Post('translate')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Translate text',
    description: 'Translate text using AI (asynchronous via Event-Driven). The translation will be processed in the background.',
  })
  @ApiBody({ schema: { type: 'object', properties: { text: { type: 'string' }, targetLanguage: { type: 'string' } } } })
  @ApiResponse({ status: 202, description: 'Translation request received' })
  async translateText(@Body() body: unknown, @Req() req: Request): Promise<{ taskId: string; status: string } | unknown> {
    if (this.pubSub) {
      const taskId: string = randomUUID();
      const userId: string | undefined = this.extractUserIdFromToken(req.headers.authorization);
      await this.pubSub.publish('generation.*', 'generation.translate.request', {
        taskId,
        userId,
        generationData: body,
        timestamp: new Date().toISOString(),
      });
      return { taskId, status: 'processing' };
    }
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(req.path, req.method, body, headers);
  }
}
