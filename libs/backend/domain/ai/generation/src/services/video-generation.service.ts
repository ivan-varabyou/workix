import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIExecutionRepository,
  AIRouter,
  SelectionConstraints,
  VideoGenerationRequest,
  VideoGenerationResponse,
} from '@workix/ai/ai-core';

export interface VideoGenerationOptions {
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
  maxCost?: number;
  duration?: number;
  resolution?: '720p' | '1080p' | '1280x720' | '1920x1080';
  motionIntensity?: number;
}

@Injectable()
export class VideoGenerationService {
  private logger = new Logger(VideoGenerationService.name);

  constructor(private aiRouter: AIRouter, private executionRepository: AIExecutionRepository) {}

  /**
   * Generate video from text (text-to-video)
   */
  async generateFromText(prompt: string, options?: VideoGenerationOptions): Promise<string> {
    const requestId = `vid-gen-${Date.now()}`;
    const startTime = Date.now();

    try {
      // Select best provider
      const constraints: SelectionConstraints = {
        qualityWeight: options?.qualityWeight ?? 0.7,
        speedWeight: options?.speedWeight ?? 0.15,
        costWeight: options?.costWeight ?? 0.15,
      };
      if (options?.maxCost !== undefined) {
        constraints.maxCostPerRequest = options.maxCost;
      }
      const provider = await this.aiRouter.selectProvider(AICapability.VIDEO_GENERATION, constraints);

      const request: VideoGenerationRequest = {
        id: requestId,
        type: AICapability.VIDEO_GENERATION,
        prompt,
        duration: options?.duration || 5,
        resolution: options?.resolution || '1280x720',
      };

      const response = await provider.execute<VideoGenerationResponse>(request);
      const responseTimeMs = Date.now() - startTime;

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
        `Video generation: ${provider.id} (${
          response.duration || 0
        }s) in ${responseTimeMs}ms, cost: $${response.cost}`
      );

      return (response as VideoGenerationResponse & { videoUrl?: string }).videoUrl || '';
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      this.logger.error(`Video generation failed: ${error}`);

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
   * Generate video from image (photo animation)
   */
  async animateImage(
    imageUrl: string,
    options?: VideoGenerationOptions & { description?: string }
  ): Promise<string> {
    const requestId = `vid-anim-${Date.now()}`;
    const startTime = Date.now();

    try {
      const provider = await this.aiRouter.selectProvider(AICapability.VIDEO_GENERATION, {
        qualityWeight: options?.qualityWeight ?? 0.7,
        speedWeight: options?.speedWeight ?? 0.15,
        costWeight: options?.costWeight ?? 0.15,
      });

      const request: VideoGenerationRequest = {
        id: requestId,
        type: AICapability.VIDEO_GENERATION,
        imageUrl,
        prompt: options?.description || 'Animate this image with subtle motion',
        duration: options?.duration || 5,
        resolution: options?.resolution || '1280x720',
        motionIntensity: options?.motionIntensity || 0.5,
      };

      const response = await provider.execute(request);
      const responseTimeMs = Date.now() - startTime;

      await this.executionRepository.recordExecution({
        requestId,
        providerId: provider.id,
        modelId: response.model,
        success: true,
        responseTimeMs,
        cost: response.cost,
        timestamp: new Date(),
      });

      return (response as VideoGenerationResponse & { videoUrl?: string }).videoUrl || '';
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      this.logger.error(`Image animation failed: ${error}`);

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
   * Generate product showcase video from multiple images
   */
  async generateProductShowcase(
    imageUrls: string[],
    productInfo: {
      name: string;
      description: string;
      price?: string;
    },
    options?: VideoGenerationOptions
  ): Promise<string> {
    this.logger.log(
      `Generating product showcase for ${productInfo.name} with ${imageUrls.length} images`
    );

    // For multi-image, we'd typically create a montage
    // This is a simplified version
    const prompt = `Create a professional product showcase video for ${productInfo.name}.
    Product description: ${productInfo.description}
    ${productInfo.price ? `Price: ${productInfo.price}` : ''}
    Show the product from different angles with smooth transitions.`;

    return this.generateFromText(prompt, {
      ...options,
      duration: imageUrls.length * 3, // 3 seconds per image
    });
  }

  /**
   * Generate batch of videos
   */
  async generateBatch(prompts: string[], options?: VideoGenerationOptions): Promise<string[]> {
    const results: string[] = [];

    for (const prompt of prompts) {
      try {
        const videoUrl = await this.generateFromText(prompt, options);
        results.push(videoUrl);
      } catch (error) {
        this.logger.warn(`Failed to generate video: ${error}`);
        results.push('');
      }
    }

    return results;
  }

  /**
   * A/B test video variations
   */
  async abTestVariations(
    prompt: string,
    variations = 2,
    options?: VideoGenerationOptions
  ): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < variations; i++) {
      try {
        const videoUrl = await this.generateFromText(prompt, {
          ...options,
          motionIntensity: 0.3 + i * 0.2, // Vary motion intensity
        });
        results.push(videoUrl);
      } catch (error) {
        this.logger.warn(`Failed to generate variation ${i}: ${error}`);
      }
    }

    return results;
  }
}
