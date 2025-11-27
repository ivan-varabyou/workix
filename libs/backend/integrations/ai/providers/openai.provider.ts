import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import {
  AICapability,
  AIProvider,
  AIRequest,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ProviderInfo,
  RateLimit,
  TextGenerationRequest,
  TextGenerationResponse,
  VisionAnalysisRequest,
  VisionAnalysisResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  capabilities = [
    AICapability.TEXT_GENERATION,
    AICapability.IMAGE_GENERATION,
    AICapability.VISION_ANALYSIS,
  ];
  supportedLanguages = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ar'];

  rateLimit: RateLimit = {
    requestsPerMinute: 3500,
    requestsPerHour: 200000,
    tokensPerMinute: 90000,
  };

  private client: OpenAI;
  private apiKey: string;

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    // Try ConfigService first, fallback to process.env
    this.apiKey = this.configService?.get('OPENAI_API_KEY') || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not set. OpenAI provider will not work.');
    }
    this.client = new OpenAI({ apiKey: this.apiKey });
  }

  async execute<T>(request: AIRequest): Promise<T> {
    switch (request.type) {
      case AICapability.TEXT_GENERATION:
        if (this.isTextGenerationRequest(request)) {
          return this.executeTextGeneration(request) as Promise<T>;
        }
        throw new Error('Invalid text generation request');
      case AICapability.IMAGE_GENERATION:
        if (this.isImageGenerationRequest(request)) {
          return this.executeImageGeneration(request) as Promise<T>;
        }
        throw new Error('Invalid image generation request');
      case AICapability.VISION_ANALYSIS:
        if (this.isVisionAnalysisRequest(request)) {
          return this.executeVisionAnalysis(request) as Promise<T>;
        }
        throw new Error('Invalid vision analysis request');
      default:
        throw new Error(`Unsupported capability: ${request.type}`);
    }
  }

  private isTextGenerationRequest(request: AIRequest): request is TextGenerationRequest {
    return request.type === AICapability.TEXT_GENERATION && 'prompt' in request;
  }

  private isImageGenerationRequest(request: AIRequest): request is ImageGenerationRequest {
    return request.type === AICapability.IMAGE_GENERATION && 'prompt' in request;
  }

  private isVisionAnalysisRequest(request: AIRequest): request is VisionAnalysisRequest {
    return (
      request.type === AICapability.VISION_ANALYSIS && 'imageUrl' in request && 'prompt' in request
    );
  }

  private async executeTextGeneration(
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: request.model || 'gpt-4-turbo',
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system' as const, content: request.systemPrompt }]
            : []),
          { role: 'user', content: request.prompt },
        ],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9,
        frequency_penalty: request.frequencyPenalty ?? 0,
        presence_penalty: request.presencePenalty ?? 0,
      });

      const responseTimeMs = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;
      const cost = this.calculateTextCost(
        response.model,
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      );

      return {
        id: request.id || `openai-${Date.now()}`,
        provider: this.id,
        model: response.model,
        content: response.choices[0]?.message?.content || '',
        finishReason: response.choices[0]?.finish_reason,
        tokensUsed,
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
        },
      } as TextGenerationResponse;
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

  private async executeImageGeneration(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.images.generate({
        model: request.model || 'dall-e-3',
        prompt: request.prompt,
        n: request.quantity || 1,
        size:
          (request.size as '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792') ||
          '1024x1024',
        quality: (request.quality as 'standard' | 'hd') || 'standard',
        style: (request.style as 'vivid' | 'natural') || 'natural',
      });

      const responseTimeMs = Date.now() - startTime;
      const cost = this.calculateImageCost(request.model || 'dall-e-3', request.quality);

      if (!response.data) {
        throw new Error('No image data in response');
      }
      return {
        id: request.id || `openai-img-${Date.now()}`,
        provider: this.id,
        model: request.model || 'dall-e-3',
        images: response.data.map((img: { url?: string }) => img.url || ''),
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          quantity: response.data.length,
        },
      } as ImageGenerationResponse;
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

  private async executeVisionAnalysis(
    request: VisionAnalysisRequest
  ): Promise<VisionAnalysisResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: request.model || 'gpt-4-vision',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: request.prompt },
              {
                type: 'image_url',
                image_url: {
                  url: request.imageUrl,
                  detail: request.detail || 'auto',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const responseTimeMs = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;
      const cost = this.calculateVisionCost(request.detail);

      return {
        id: request.id || `openai-vision-${Date.now()}`,
        provider: this.id,
        model: response.model,
        analysis: response.choices[0]?.message?.content || '',
        tokensUsed,
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
        },
      } as VisionAnalysisResponse;
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
    try {
      await this.client.models.list();
      return true;
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
        model: 'per_token',
        currency: 'USD',
      },
      status: 'active',
    };
  }

  // Private helper methods
  private calculateTextCost(model: string, inputTokens: number, outputTokens: number): number {
    // Pricing as of 2024
    const pricing: Record<string, [number, number]> = {
      'gpt-4-turbo': [0.01 / 1000, 0.03 / 1000],
      'gpt-4o': [0.005 / 1000, 0.015 / 1000],
      'gpt-4': [0.03 / 1000, 0.06 / 1000],
      'gpt-3.5-turbo': [0.0005 / 1000, 0.0015 / 1000],
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo'];
    if (!modelPricing) {
      throw new Error(`Unknown model pricing for: ${model}`);
    }
    const [inputPrice, outputPrice] = modelPricing;
    return inputTokens * inputPrice + outputTokens * outputPrice;
  }

  private calculateImageCost(model: string, quality?: string): number {
    // DALL-E 3 pricing
    if (model === 'dall-e-3') {
      return quality === 'hd' ? 0.08 : 0.04;
    }
    // DALL-E 2 pricing
    return 0.016;
  }

  private calculateVisionCost(detail?: string): number {
    // GPT-4 Vision pricing
    // const _baseCost: number = 0.01 / 1000; // per token
    if (detail === 'high') {
      return 0.03; // Approximate for high detail
    }
    return 0.01; // Approximate for low/auto detail
  }
}
