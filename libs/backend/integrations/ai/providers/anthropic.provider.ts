import Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AICapability,
  AIProvider,
  AIRequest,
  ProviderInfo,
  RateLimit,
  TextGenerationRequest,
  TextGenerationResponse,
  VisionAnalysisRequest,
  VisionAnalysisResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  name = 'Anthropic (Claude)';
  capabilities = [AICapability.TEXT_GENERATION, AICapability.VISION_ANALYSIS];
  supportedLanguages = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'pt', 'ko'];

  rateLimit: RateLimit = {
    requestsPerMinute: 50,
    tokensPerMinute: 40000,
  };

  private client: Anthropic;
  private apiKey: string;

  // Available models
  private supportedModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20250219',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ];

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    this.apiKey =
      this.configService?.get('ANTHROPIC_API_KEY') || process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not set. Anthropic provider will not work.');
    }
    this.client = new Anthropic({ apiKey: this.apiKey });
  }

  async execute<T>(request: AIRequest): Promise<T> {
    switch (request.type) {
      case AICapability.TEXT_GENERATION:
        if (this.isTextGenerationRequest(request)) {
          return this.executeTextGeneration(request) as Promise<T>;
        }
        throw new Error('Invalid text generation request');
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
      // @ts-ignore - Anthropic SDK types may not match exactly
      const response = await this.client.messages.create({
        model: this.validateModel(request.model || 'claude-3-5-sonnet-20241022'),
        max_tokens: request.maxTokens || 2000,
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'user' as const, content: `System: ${request.systemPrompt}` }]
            : []),
          { role: 'user' as const, content: request.prompt },
        ],
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9,
      });

      const responseTimeMs = Date.now() - startTime;
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      const cost = this.calculateCost(
        request.model || 'claude-3-5-sonnet-20241022',
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      return {
        id: request.id || `anthropic-${Date.now()}`,
        provider: this.id,
        model: response.model,
        content:
          response.content[0] &&
          response.content[0].type === 'text' &&
          'text' in response.content[0]
            ? response.content[0].text
            : '',
        finishReason: response.stop_reason,
        tokensUsed,
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      } as any as TextGenerationResponse;
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
      // Fetch image as base64
      const imageBase64 = await this.fetchImageAsBase64(request.imageUrl);

      const response = await this.client.messages.create({
        model: request.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: request.prompt,
              },
            ],
          },
        ],
      });

      const responseTimeMs = Date.now() - startTime;
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      const cost = this.calculateCost(
        request.model || 'claude-3-5-sonnet-20241022',
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      return {
        id: request.id || `anthropic-vision-${Date.now()}`,
        provider: this.id,
        model: response.model,
        analysis:
          response.content[0] &&
          response.content[0].type === 'text' &&
          'text' in response.content[0]
            ? response.content[0].text
            : '',
        tokensUsed,
        cost,
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      } as any as VisionAnalysisResponse;
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
      await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });
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
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Pricing as of 2024
    const pricing: Record<string, [number, number]> = {
      'claude-3-5-sonnet-20241022': [0.003 / 1000, 0.015 / 1000],
      'claude-3-opus-20250219': [0.015 / 1000, 0.075 / 1000],
      'claude-3-sonnet-20240229': [0.003 / 1000, 0.015 / 1000],
      'claude-3-haiku-20240307': [0.00025 / 1000, 0.00125 / 1000],
    };

    const modelPricing = pricing[model] || pricing['claude-3-5-sonnet-20241022'];
    if (!modelPricing) {
      throw new Error(`Unknown model pricing for: ${model}`);
    }
    const [inputPrice, outputPrice] = modelPricing;
    return inputTokens * inputPrice + outputTokens * outputPrice;
  }

  private validateModel(model: string): string {
    if (this.supportedModels.includes(model)) {
      return model;
    }
    return 'claude-3-5-sonnet-20241022'; // Fallback
  }

  private async fetchImageAsBase64(_imageUrl: string): Promise<string> {
    // In production, implement actual image fetching
    // For now, return placeholder
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
}
