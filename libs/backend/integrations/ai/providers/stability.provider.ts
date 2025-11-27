import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AICapability,
  AIProvider,
  AIRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ProviderInfo,
  RateLimit,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class StabilityProvider implements AIProvider {
  id = 'stability';
  name = 'Stability AI (Stable Diffusion)';
  capabilities = [AICapability.IMAGE_GENERATION];
  supportedLanguages = ['en'];

  rateLimit: RateLimit = {
    requestsPerMinute: 15,
  };

  private apiKey: string;
  private apiHost = 'https://api.stability.ai';

  // Available models
  private supportedModels = [
    'stable-diffusion-xl-1024-v1-0',
    'stable-diffusion-3-large',
    'stable-diffusion-3-large-turbo',
  ];

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    this.apiKey = this.configService?.get('STABILITY_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('STABILITY_API_KEY not set - Stability provider will not work');
    }
  }

  async execute<T>(request: AIRequest): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Stability provider is not configured');
    }

    switch (request.type) {
      case AICapability.IMAGE_GENERATION:
        if (this.isImageGenerationRequest(request)) {
          return this.executeImageGeneration(request) as Promise<T>;
        }
        throw new Error('Invalid image generation request');
      default:
        throw new Error(`Stability provider does not support ${request.type}`);
    }
  }

  private isImageGenerationRequest(request: AIRequest): request is ImageGenerationRequest {
    return request.type === AICapability.IMAGE_GENERATION && 'prompt' in request;
  }

  private async executeImageGeneration(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const startTime = Date.now();

    try {
      const model = this.validateModel(request.model || 'stable-diffusion-xl-1024-v1-0');
      const endpoint = `${this.apiHost}/v1/generation/${model}/text-to-image`;

      const formData = new FormData();
      formData.append('text_prompts', JSON.stringify([{ text: request.prompt, weight: 1 }]));
      formData.append('cfg_scale', '7');
      formData.append('height', request.size?.split('x')[1] || '1024');
      formData.append('width', request.size?.split('x')[0] || '1024');
      formData.append('samples', String(request.quantity || 1));
      formData.append('steps', '30');

      if (request.negativePrompt) {
        formData.append(
          'text_prompts',
          JSON.stringify([{ text: request.negativePrompt, weight: -1 }])
        );
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Stability API error: ${response.statusText}`);
      }

      const result = (await response.json()) as { artifacts?: Array<{ base64: string }> };
      const responseTimeMs = Date.now() - startTime;
      const cost = this.calculateCost(model, request.quantity || 1);

      return {
        id: request.id || `stability-img-${Date.now()}`,
        provider: this.id,
        model,
        images:
          result.artifacts?.map(
            (art: { base64: string }) => `data:image/png;base64,${art.base64}`
          ) || [],
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          quantity: request.quantity || 1,
        },
      } as any as ImageGenerationResponse;
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
      const response = await fetch(
        `${this.apiHost}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${this.apiKey}`,
          },
          body: new FormData(),
        }
      );
      return response.ok || response.status === 400; // 400 means auth worked but missing params
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
        costPerUnit: 0.025, // $0.025 per image
        currency: 'USD',
      },
      status: this.apiKey ? 'active' : 'inactive',
    };
  }

  private calculateCost(_model: string, quantity: number): number {
    // Stability pricing
    const costPerImage = 0.025; // $0.025 per image
    return costPerImage * quantity;
  }

  private validateModel(model: string): string {
    if (this.supportedModels.includes(model)) {
      return model;
    }
    return 'stable-diffusion-xl-1024-v1-0'; // Fallback
  }
}
