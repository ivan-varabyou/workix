import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

import {
  AICapability,
  AIProvider,
  AIRequest,
  ProviderInfo,
  RateLimit,
  TextGenerationRequest,
  TextGenerationResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GroqProvider implements AIProvider {
  id = 'groq';
  name = 'Groq (Fast & Cheap)';
  capabilities = [AICapability.TEXT_GENERATION];
  supportedLanguages = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja'];

  rateLimit: RateLimit = {
    requestsPerMinute: 60,
    concurrentRequests: 10,
  };

  private client: Groq;
  private apiKey: string;

  // Models available on Groq
  private supportedModels = [
    'mixtral-8x7b-32768',
    'mixtral-8x7b-instruct-v0.2',
    'llama2-70b-4096',
    'llama-3.1-70b-versatile',
    'llama-3.1-405b-reasoning',
  ];

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    this.apiKey = this.configService?.get('GROQ_API_KEY') || process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  GROQ_API_KEY not set. Groq provider will not work.');
    }
    this.client = new Groq({ apiKey: this.apiKey });
  }

  async execute<T>(request: AIRequest): Promise<T> {
    if (!this.client) {
      throw new Error('Groq provider is not configured');
    }

    switch (request.type) {
      case AICapability.TEXT_GENERATION:
        if (this.isTextGenerationRequest(request)) {
          return this.executeTextGeneration(request) as Promise<T>;
        }
        throw new Error('Invalid text generation request');
      default:
        throw new Error(`Groq provider does not support ${request.type}`);
    }
  }

  private isTextGenerationRequest(request: AIRequest): request is TextGenerationRequest {
    return request.type === AICapability.TEXT_GENERATION && 'prompt' in request;
  }

  private async executeTextGeneration(
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    const startTime = Date.now();

    try {
      // @ts-ignore - Groq SDK types may not match exactly
      const response = await this.client.chat.completions.create({
        model: this.validateModel(request.model || 'mixtral-8x7b-32768'),
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system' as const, content: request.systemPrompt }]
            : []),
          { role: 'user' as const, content: request.prompt },
        ],
        max_tokens: request.maxTokens || 2000,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9,
      });

      const responseTimeMs = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        id: request.id || `groq-${Date.now()}`,
        provider: this.id,
        model: response.model,
        content: response.choices[0]?.message?.content || '',
        finishReason: response.choices[0]?.finish_reason,
        tokensUsed,
        cost: 0, // Groq is often free or very cheap
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          speed: `${(tokensUsed / (responseTimeMs / 1000)).toFixed(0)} tokens/sec`,
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

  async healthCheck(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.chat.completions.create({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 10,
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
        model: 'free',
        currency: 'USD',
      },
      status: this.apiKey ? 'active' : 'inactive',
    };
  }

  private validateModel(model: string): string {
    if (this.supportedModels.includes(model)) {
      return model;
    }
    return 'mixtral-8x7b-32768'; // Fallback to popular model
  }
}
