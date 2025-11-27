import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIExecutionRepository,
  AIRouter,
  ImageGenerationRequest,
  ImageGenerationResponse,
  SelectionConstraints,
} from '@workix/ai/ai-core';

import { ImageGenerationOptions } from '../interfaces/generation.interface';

@Injectable()
export class ImageGenerationService {
  private readonly logger: Logger = new Logger(ImageGenerationService.name);

  constructor(private aiRouter: AIRouter, private executionRepository: AIExecutionRepository) {}

  /**
   * Generate image with smart provider selection
   */
  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<string[]> {
    const requestId: string = `img-gen-${Date.now()}`;
    const startTime: number = Date.now();

    try {
      // Select best provider
      const constraints: SelectionConstraints = {
        qualityWeight: options?.qualityWeight ?? 0.6,
        speedWeight: options?.speedWeight ?? 0.2,
        costWeight: options?.costWeight ?? 0.2,
      };
      if (options?.maxCost !== undefined) {
        constraints.maxCostPerRequest = options.maxCost;
      }
      const provider = await this.aiRouter.selectProvider(AICapability.IMAGE_GENERATION, constraints);

      // Build request
      const request: ImageGenerationRequest = {
        id: requestId,
        type: AICapability.IMAGE_GENERATION,
        prompt: this.buildPrompt(prompt, options?.style),
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        quantity: options?.quantity || 1,
      };
      if (options?.negativePrompt !== undefined) {
        request.negativePrompt = options.negativePrompt;
      }

      const response: ImageGenerationResponse = await provider.execute<ImageGenerationResponse>(request);
      const responseTimeMs: number = Date.now() - startTime;

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
        `Image generation: ${provider.id} (${
          response.images?.length || 0
        } images) in ${responseTimeMs}ms, cost: $${response.cost}`
      );

      return response.images || [];
    } catch (error) {
      const responseTimeMs: number = Date.now() - startTime;
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Image generation failed: ${errorMessage}`);

      await this.executionRepository.recordExecution({
        requestId,
        providerId: 'unknown',
        success: false,
        responseTimeMs,
        cost: 0,
        error: errorMessage,
        timestamp: new Date(),
      });

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Generate multiple image variations
   */
  async generateVariations(
    prompt: string,
    count: number = 4,
    options?: ImageGenerationOptions
  ): Promise<string[][]> {
    const results: string[][] = [];
    const styles: string[] = ['photorealistic', 'artistic', 'minimalist', 'abstract', 'cartoon'];

    for (let i: number = 0; i < Math.min(count, styles.length); i++) {
      try {
        const variationOptions: ImageGenerationOptions = {
          quantity: 1,
        };
        const currentStyle: string | undefined = styles[i];
        if (currentStyle !== undefined) {
          variationOptions.style = currentStyle;
        }
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
        if (options?.quality !== undefined) {
          variationOptions.quality = options.quality;
        }
        if (options?.size !== undefined) {
          variationOptions.size = options.size;
        }
        if (options?.negativePrompt !== undefined) {
          variationOptions.negativePrompt = options.negativePrompt;
        }
        const images: string[] = await this.generateImage(prompt, variationOptions);
        results.push(images);
      } catch (error) {
        this.logger.warn(`Failed to generate variation ${i}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Generate with specific provider
   */
  async generateWithProvider(
    prompt: string,
    providerId: string,
    options?: ImageGenerationOptions
  ): Promise<string[]> {
    const requestId: string = `img-gen-${providerId}-${Date.now()}`;
    const startTime: number = Date.now();

    try {
      const provider: Awaited<ReturnType<typeof this.aiRouter.selectProvider>> = await this.aiRouter.selectProvider(AICapability.IMAGE_GENERATION, {
        preferredProviders: [providerId],
      });

      const request: ImageGenerationRequest = {
        id: requestId,
        type: AICapability.IMAGE_GENERATION,
        prompt: this.buildPrompt(prompt, options?.style),
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        quantity: options?.quantity || 1,
      };
      if (options?.negativePrompt !== undefined) {
        request.negativePrompt = options.negativePrompt;
      }

      const response: ImageGenerationResponse = await provider.execute<ImageGenerationResponse>(request);
      const responseTimeMs: number = Date.now() - startTime;

      await this.executionRepository.recordExecution({
        requestId,
        providerId: provider.id,
        modelId: response.model,
        success: true,
        responseTimeMs,
        cost: response.cost,
        timestamp: new Date(),
      });

      return response.images || [];
    } catch (error) {
      const responseTimeMs: number = Date.now() - startTime;
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Image generation with ${providerId} failed: ${errorMessage}`);

      await this.executionRepository.recordExecution({
        requestId,
        providerId,
        success: false,
        responseTimeMs,
        cost: 0,
        error: errorMessage,
        timestamp: new Date(),
      });

      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * A/B test image providers
   */
  async abTestProviders(prompt: string, providerIds: string[]): Promise<Record<string, string[]>> {
    const results: Record<string, string[]> = {};

    const parallelResults: unknown[] = await this.aiRouter.executeParallel(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Object literal needs explicit cast to ImageGenerationRequest type
      {
        type: AICapability.IMAGE_GENERATION,
        prompt,
        quantity: 1,
      } as ImageGenerationRequest,
      AICapability.IMAGE_GENERATION,
      Math.min(providerIds.length, 2)
    );

    for (let i: number = 0; i < parallelResults.length; i++) {
      const result: unknown = parallelResults[i];
      const providerId: string | undefined = providerIds[i];
      if (providerId && result && typeof result === 'object' && 'images' in result) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Type guard ensures safe assertion
        results[providerId] = (result as ImageGenerationResponse).images || [];
      }
    }

    return results;
  }

  /**
   * Generate batch of images
   */
  async generateBatch(prompts: string[], options?: ImageGenerationOptions): Promise<string[][]> {
    const results: string[][] = [];

    for (const prompt of prompts) {
      try {
        const images: string[] = await this.generateImage(prompt, {
          ...options,
          quantity: 1,
        });
        results.push(images);
      } catch (error) {
        this.logger.warn(`Failed to generate image for prompt: ${error}`);
        results.push([]);
      }
    }

    return results;
  }

  // Private helpers

  private buildPrompt(prompt: string, style?: string): string {
    if (!style) return prompt;

    const stylePrompts: Record<string, string> = {
      photorealistic: `Create a photorealistic image: ${prompt}`,
      artistic: `Create an artistic, stylized image: ${prompt}`,
      minimalist: `Create a minimalist design: ${prompt}`,
      abstract: `Create an abstract artwork: ${prompt}`,
      cartoon: `Create a cartoon/comic style image: ${prompt}`,
    };

    return stylePrompts[style] || prompt;
  }
}
