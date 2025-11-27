import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIExecutionRepository,
  AIRouter,
  SelectionConstraints,
  SpeechGenerationRequest,
  SpeechGenerationResponse,
} from '@workix/ai/ai-core';

export interface SpeechGenerationOptions {
  language?: string;
  voice?: string;
  speed?: number;
  stability?: number;
  maxCost?: number;
}

@Injectable()
export class SpeechGenerationService {
  private logger = new Logger(SpeechGenerationService.name);

  constructor(private aiRouter: AIRouter, private executionRepository: AIExecutionRepository) {}

  /**
   * Generate speech from text
   */
  async generateSpeech(text: string, options?: SpeechGenerationOptions): Promise<string> {
    const requestId = `speech-gen-${Date.now()}`;
    const startTime = Date.now();

    try {
      // Select best provider
      const constraints: SelectionConstraints = {
        qualityWeight: 0.7,
        speedWeight: 0.2,
        costWeight: 0.1,
      };
      if (options?.maxCost !== undefined) {
        constraints.maxCostPerRequest = options.maxCost;
      }
      const provider = await this.aiRouter.selectProvider(AICapability.SPEECH_GENERATION, constraints);

      const request: SpeechGenerationRequest = {
        id: requestId,
        type: AICapability.SPEECH_GENERATION,
        text,
        language: options?.language || 'en',
      };
      if (options?.voice !== undefined) {
        request.voice = options.voice;
      }
      if (options?.speed !== undefined) {
        request.speed = options.speed;
      }
      if (options?.stability !== undefined) {
        request.stability = options.stability;
      }

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

      this.logger.debug(
        `Speech generation: ${provider.id} (${text.length} chars) in ${responseTimeMs}ms, cost: $${response.cost}`
      );

      return (response as SpeechGenerationResponse & { audioUrl?: string }).audioUrl || '';
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Speech generation failed: ${errorMessage}`);

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
   * Generate multilingual speech
   */
  async generateMultilingual(text: string, languages: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const lang of languages) {
      try {
        const audioUrl = await this.generateSpeech(text, { language: lang });
        results[lang] = audioUrl;
      } catch (error) {
        this.logger.warn(`Failed to generate speech in ${lang}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Generate batch speeches
   */
  async generateBatch(texts: string[], options?: SpeechGenerationOptions): Promise<string[]> {
    const results: string[] = [];

    for (const text of texts) {
      try {
        const audioUrl = await this.generateSpeech(text, options);
        results.push(audioUrl);
      } catch (error) {
        this.logger.warn(`Failed to generate speech: ${error}`);
        results.push('');
      }
    }

    return results;
  }

  /**
   * Generate with specific voice
   */
  async generateWithVoice(
    text: string,
    voiceId: string,
    options?: SpeechGenerationOptions
  ): Promise<string> {
    const requestId = `speech-voice-${Date.now()}`;
    const startTime = Date.now();

    try {
      const provider = await this.aiRouter.selectProvider(AICapability.SPEECH_GENERATION, {
        qualityWeight: 0.8,
      });

      const request: SpeechGenerationRequest = {
        id: requestId,
        type: AICapability.SPEECH_GENERATION,
        text,
        voice: voiceId,
        language: options?.language || 'en',
      };
      if (options?.speed !== undefined) {
        request.speed = options.speed;
      }
      if (options?.stability !== undefined) {
        request.stability = options.stability;
      }

      const response = await provider.execute<SpeechGenerationResponse>(request);
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

      return response.audioUrl || '';
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      this.logger.error(`Speech generation with voice failed: ${error}`);

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
}
