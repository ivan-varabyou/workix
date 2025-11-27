import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIExecutionRepository,
  AIRouter,
  SelectionConstraints,
  TextGenerationRequest,
} from '@workix/ai/ai-core';

export interface TextGenerationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  maxResponseTime?: number;
  language?: string;
  style?: 'formal' | 'casual' | 'creative' | 'professional' | 'friendly';
}

@Injectable()
export class TextGenerationService {
  private logger = new Logger(TextGenerationService.name);

  constructor(private aiRouter: AIRouter, private executionRepository: AIExecutionRepository) {}

  /**
   * Generate text with smart provider selection
   */
  async generateText(prompt: string, options?: TextGenerationOptions): Promise<string> {
    const requestId = `text-gen-${Date.now()}`;
    const startTime = Date.now();

    try {
      // Build enhanced prompt with style
      const enhancedPrompt = this.buildPrompt(prompt, options?.style);

      // Select best provider
      const constraints: SelectionConstraints = {
        qualityWeight: options?.qualityWeight ?? 0.5,
        speedWeight: options?.speedWeight ?? 0.3,
        costWeight: options?.costWeight ?? 0.2,
      };
      if (options?.maxCost !== undefined) {
        constraints.maxCostPerRequest = options.maxCost;
      }
      if (options?.maxResponseTime !== undefined) {
        constraints.maxResponseTimeMs = options.maxResponseTime;
      }
      const provider = await this.aiRouter.selectProvider(AICapability.TEXT_GENERATION, constraints);

      // Execute
      const request: TextGenerationRequest = {
        id: requestId,
        type: AICapability.TEXT_GENERATION,
        prompt: enhancedPrompt,
        maxTokens: 2000,
        temperature: this.getTemperature(options?.style),
      };

      const response: any = (await provider.execute(request)) as any;
      const responseTimeMs = Date.now() - startTime;

      // Track execution
      await this.executionRepository.recordExecution({
        requestId,
        providerId: provider.id,
        modelId: response.model,
        success: true,
        responseTimeMs,
        cost: response.cost,
        timestamp: new Date(),
      });

      this.logger.debug(
        `Text generation: ${provider.id} in ${responseTimeMs}ms, cost: $${response.cost}`
      );

      return response.content || '';
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      this.logger.error(`Text generation failed: ${error}`);

      await this.executionRepository.recordExecution({
        requestId,
        providerId: 'unknown',
        success: false,
        responseTimeMs,
        cost: 0,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Generate multiple text variations for A/B testing
   */
  async generateVariations(
    prompt: string,
    count = 3,
    options?: TextGenerationOptions
  ): Promise<string[]> {
    const styles: Array<'formal' | 'casual' | 'creative' | 'professional' | 'friendly'> = [
      'formal',
      'casual',
      'creative',
      'professional',
      'friendly',
    ];

    const variations: string[] = [];

    for (let i = 0; i < Math.min(count, styles.length); i++) {
      try {
        const variationOptions: TextGenerationOptions = {};
        if (options?.qualityWeight !== undefined) {
          variationOptions.qualityWeight = options.qualityWeight;
        }
        if (options?.speedWeight !== undefined) {
          variationOptions.speedWeight = options.speedWeight;
        }
        if (options?.costWeight !== undefined) {
          variationOptions.costWeight = options.costWeight;
        }
        if (options?.maxCost !== undefined) {
          variationOptions.maxCost = options.maxCost;
        }
        if (options?.maxResponseTime !== undefined) {
          variationOptions.maxResponseTime = options.maxResponseTime;
        }
        if (options?.language !== undefined) {
          variationOptions.language = options.language;
        }
        const currentStyle = styles[i];
        if (currentStyle !== undefined) {
          variationOptions.style = currentStyle;
        }
        const variation = await this.generateText(prompt, variationOptions);
        variations.push(variation);
      } catch (error) {
        this.logger.warn(`Failed to generate variation ${i}: ${error}`);
      }
    }

    return variations;
  }

  /**
   * Generate with specific provider (bypass smart selection)
   */
  async generateWithProvider(
    prompt: string,
    providerId: string,
    options?: TextGenerationOptions
  ): Promise<string> {
    const requestId = `text-gen-${providerId}-${Date.now()}`;
    const startTime = Date.now();

    try {
      const enhancedPrompt = this.buildPrompt(prompt, options?.style);
      const provider = this.aiRouter.selectProvider(AICapability.TEXT_GENERATION, {
        preferredProviders: [providerId],
      });

      if (typeof provider === 'string') {
        throw new Error(`Provider ${providerId} not found`);
      }

      const request: TextGenerationRequest = {
        id: requestId,
        type: AICapability.TEXT_GENERATION,
        prompt: enhancedPrompt,
        maxTokens: 2000,
        temperature: this.getTemperature(options?.style),
      };

      const response = await (await provider).execute(request);
      const responseTimeMs = Date.now() - startTime;

      await this.executionRepository.recordExecution({
        requestId,
        providerId: (await provider).id,
        modelId: response.model,
        success: true,
        responseTimeMs,
        cost: response.cost,
        timestamp: new Date(),
      });

      return (response as any).content || '';
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Text generation with ${providerId} failed: ${errorMessage}`);

      await this.executionRepository.recordExecution({
        requestId,
        providerId,
        success: false,
        responseTimeMs,
        cost: 0,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * A/B test multiple providers
   */
  async abTestProviders(prompt: string, providerIds: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    const parallelResults = await this.aiRouter.executeParallel(
      {
        type: AICapability.TEXT_GENERATION,
        prompt,
      } as TextGenerationRequest,
      AICapability.TEXT_GENERATION,
      Math.min(providerIds.length, 3)
    );

    for (let i = 0; i < parallelResults.length; i++) {
      const result: any = parallelResults[i] as any;
      const providerId = providerIds[i];
      if (providerId) {
        results[providerId] = result.content || '';
      }
    }

    return results;
  }

  // Private helper methods

  private buildPrompt(prompt: string, style?: string): string {
    if (!style) return prompt;

    const stylePrompts: Record<string, string> = {
      formal: `Please respond in a formal, professional tone. ${prompt}`,
      casual: `Please respond in a casual, friendly tone. ${prompt}`,
      creative: `Please respond in a creative and imaginative way. ${prompt}`,
      professional: `Please respond in a professional, business-appropriate tone. ${prompt}`,
      friendly: `Please respond in a warm, friendly, and approachable tone. ${prompt}`,
    };

    return stylePrompts[style] || prompt;
  }

  private getTemperature(style?: string): number {
    const temperatures: Record<string, number> = {
      formal: 0.5,
      casual: 0.7,
      creative: 0.9,
      professional: 0.6,
      friendly: 0.7,
    };

    return temperatures[style || 'casual'] || 0.7;
  }
}
