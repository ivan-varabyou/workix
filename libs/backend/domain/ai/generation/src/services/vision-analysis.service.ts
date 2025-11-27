import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIExecutionRepository,
  AIRouter,
  VisionAnalysisRequest,
  VisionAnalysisResponse,
} from '@workix/ai/ai-core';

export interface VisionAnalysisOptions {
  detail?: 'low' | 'high' | 'auto';
  qualityWeight?: number;
  speedWeight?: number;
  costWeight?: number;
}

export interface ImageAnalysisResult {
  analysis: string;
  objects?: string[];
  text?: string;
  colors?: string[];
  quality_score?: number;
}

@Injectable()
export class VisionAnalysisService {
  private logger = new Logger(VisionAnalysisService.name);

  constructor(private aiRouter: AIRouter, private executionRepository: AIExecutionRepository) {}

  /**
   * Analyze image with smart provider selection
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    options?: VisionAnalysisOptions
  ): Promise<ImageAnalysisResult> {
    const requestId = `vision-${Date.now()}`;
    const startTime = Date.now();

    try {
      const provider = await this.aiRouter.selectProvider(AICapability.VISION_ANALYSIS, {
        qualityWeight: options?.qualityWeight ?? 0.7,
        speedWeight: options?.speedWeight ?? 0.2,
        costWeight: options?.costWeight ?? 0.1,
      });

      const request: VisionAnalysisRequest = {
        id: requestId,
        type: AICapability.VISION_ANALYSIS,
        imageUrl,
        prompt,
        detail: options?.detail || 'auto',
      };

      const response = await provider.execute<VisionAnalysisResponse>(request);
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
        `Vision analysis: ${provider.id} in ${responseTimeMs}ms, cost: $${response.cost}`
      );

      // Parse response for structured data
      return this.parseAnalysis(response.analysis || '');
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      this.logger.error(`Vision analysis failed: ${error}`);

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
   * Analyze product image for e-commerce
   */
  async analyzeProductImage(imageUrl: string): Promise<ImageAnalysisResult> {
    const prompt = `Analyze this product image and provide:
    1. Product type and category
    2. Key features and details visible
    3. Quality assessment (1-10)
    4. Color analysis
    5. Composition analysis
    6. Recommended improvements
    7. Estimated market positioning`;

    return this.analyzeImage(imageUrl, prompt, { detail: 'high' });
  }

  /**
   * Analyze multiple images
   */
  async analyzeBatch(
    imageUrls: string[],
    prompt: string,
    options?: VisionAnalysisOptions
  ): Promise<ImageAnalysisResult[]> {
    const results: ImageAnalysisResult[] = [];

    for (const url of imageUrls) {
      try {
        const result = await this.analyzeImage(url, prompt, options);
        results.push(result);
      } catch (error) {
        this.logger.warn(`Failed to analyze image: ${error}`);
        results.push({ analysis: '' });
      }
    }

    return results;
  }

  /**
   * Quality check for generated images
   */
  async qualityCheck(imageUrl: string): Promise<number> {
    const prompt = `Rate the quality of this image on a scale of 1-10. Provide only a number.`;

    try {
      const result = await this.analyzeImage(imageUrl, prompt, { detail: 'low' });
      const match = result.analysis.match(/\d+/);
      return match ? parseInt(match[0]) : 5;
    } catch (error) {
      this.logger.warn(`Quality check failed: ${error}`);
      return 0;
    }
  }

  /**
   * Extract text from image (OCR)
   */
  async extractText(imageUrl: string): Promise<string> {
    const prompt = `Extract all text visible in this image. Return only the extracted text.`;

    try {
      const result = await this.analyzeImage(imageUrl, prompt);
      return result.text || result.analysis;
    } catch (error) {
      this.logger.warn(`Text extraction failed: ${error}`);
      return '';
    }
  }

  // Private helpers

  private parseAnalysis(analysis: string): ImageAnalysisResult {
    // Try to extract structured data from response
    const lines = analysis.split('\n');
    const objects: string[] = [];
    const text = '';
    let quality_score = 5;

    for (const line of lines) {
      if (line.match(/quality|score|rating/i)) {
        const match = line.match(/\d+/);
        if (match) quality_score = parseInt(match[0]);
      }
    }

    return {
      analysis,
      objects,
      text,
      quality_score,
    };
  }
}
