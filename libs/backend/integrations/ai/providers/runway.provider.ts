import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AICapability,
  AIProvider,
  AIRequest,
  ProviderInfo,
  RateLimit,
  VideoGenerationRequest,
  VideoGenerationResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class RunwayProvider implements AIProvider {
  id = 'runway';
  name = 'Runway ML (Video Generation)';
  capabilities = [AICapability.VIDEO_GENERATION];
  supportedLanguages = ['en'];

  rateLimit: RateLimit = {
    requestsPerMinute: 5,
    concurrentRequests: 2,
  };

  private apiKey: string;
  private apiHost = 'https://api.runwayml.com';

  // Available models
  private supportedModels = ['gen3', 'gen3-alpha', 'gen2'];

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    this.apiKey = this.configService?.get('RUNWAY_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('RUNWAY_API_KEY not set - Runway provider will not work');
    }
  }

  async execute<T>(request: AIRequest): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Runway provider is not configured');
    }

    switch (request.type) {
      case AICapability.VIDEO_GENERATION:
        if (this.isVideoGenerationRequest(request)) {
          return this.executeVideoGeneration(request) as Promise<T>;
        }
        throw new Error('Invalid video generation request');
      default:
        throw new Error(`Runway provider does not support ${request.type}`);
    }
  }

  private isVideoGenerationRequest(request: AIRequest): request is VideoGenerationRequest {
    return request.type === AICapability.VIDEO_GENERATION && 'prompt' in request;
  }

  private async executeVideoGeneration(
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResponse> {
    const startTime = Date.now();

    try {
      const model = this.validateModel(request.model || 'gen3');
      const endpoint = `${this.apiHost}/v1/generation/generate`;

      // Determine task based on inputs
      let taskType = 'text_to_video';
      if (request.imageUrl) {
        taskType = 'image_to_video';
      } else if (request.videoUrl) {
        taskType = 'video_variation';
      }

      const payload: {
        model: string;
        task_type: string;
        duration: number;
        resolution: string;
        prompt_text?: string;
        image_url?: string;
        video_url?: string;
        motion_intensity?: number;
      } = {
        model,
        task_type: taskType,
        duration: request.duration || 5,
        resolution: request.resolution || '1280x720',
      };

      if (request.prompt) {
        payload.prompt_text = request.prompt;
      }
      if (request.imageUrl) {
        payload.image_url = request.imageUrl;
      }
      if (request.videoUrl) {
        payload.video_url = request.videoUrl;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.statusText}`);
      }

      const result: any = (await response.json()) as any;
      const responseTimeMs = Date.now() - startTime;
      const cost = this.calculateCost(model, request.duration || 5);

      return {
        id: request.id || `runway-video-${Date.now()}`,
        provider: this.id,
        model,
        videoUrl: result.video_url || result.output_url || '',
        duration: request.duration || 5,
        resolution: request.resolution || '1280x720',
        format: 'mp4',
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          taskType,
          taskId: result.task_id,
        },
      } as any as VideoGenerationResponse;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      throw {
        provider: this.id,
        error: error instanceof Error ? error.message : String(error),
        responseTimeMs,
        cost: 0,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(`${this.apiHost}/v1/health`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      capabilities: this.capabilities,
      supportedLanguages: this.supportedLanguages,
      rateLimit: this.rateLimit,
      pricing: {
        model: 'per_request',
        currency: 'USD',
      },
      status: this.apiKey ? 'active' : 'inactive',
    };
  }

  private calculateCost(model: string, duration: number): number {
    // Runway pricing (approximate, varies by model)
    // Gen-3: $0.10 per second
    // Gen-2: $0.05 per second
    const costPerSecond = model === 'gen3' ? 0.1 : 0.05;
    return costPerSecond * duration;
  }

  private validateModel(model: string): string {
    if (this.supportedModels.includes(model)) {
      return model;
    }
    return 'gen3'; // Fallback
  }
}
