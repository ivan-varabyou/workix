import { Injectable, Logger } from '@nestjs/common';
import { AICapability, AIRouter, EmbeddingRequest, EmbeddingResponse } from '@workix/ai/ai-core';

import { GenerationCacheService } from './generation-cache.service';

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
  normalize?: boolean;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  cached: boolean;
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(private router: AIRouter, private cache: GenerationCacheService) {}

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text: string, options: EmbeddingOptions = {}): Promise<EmbeddingResult> {
    const cacheKey = `embedding:${text}:${options.model || 'default'}`;
    const cached = (await this.cache.get(cacheKey)) as EmbeddingResult | null;
    if (cached) {
      this.logger.debug(`Embedding cache hit for text: ${text.substring(0, 50)}...`);
      return { ...cached, cached: true };
    }

    const startTime = Date.now();
    const requestId = `embedding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Generating embedding`, {
      textLength: text.length,
      model: options.model,
    });

    try {
      const request: EmbeddingRequest = {
        id: requestId,
        type: AICapability.EMBEDDINGS,
        texts: [text],
        model: options.model || 'text-embedding-3-small',
        metadata: {
          dimensions: options.dimensions,
          normalize: options.normalize,
        },
      };

      const result = (await this.router.executeWithFailover(
        request,
        AICapability.EMBEDDINGS,
        3
      )) as EmbeddingResponse;

      const embedding = result.embeddings?.[0] || [];
      const model = result.model || options.model || 'text-embedding-3-small';
      const dimensions = result.dimensions || embedding.length;

      const embeddingResult: EmbeddingResult = {
        embedding,
        model,
        dimensions,
        cached: false,
      };

      // Cache the result
      await this.cache.set(cacheKey, embeddingResult, 86400000); // 24 hours

      const latencyMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Embedding generated`, {
        provider: result.provider,
        model: result.model,
        dimensions,
        latencyMs,
      });

      return embeddingResult;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Embedding generation failed`, {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateEmbeddings(
    texts: string[],
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResult[]> {
    const results = await Promise.all(texts.map((text) => this.generateEmbedding(text, options)));
    return results;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      const val1 = embedding1[i];
      const val2 = embedding2[i];
      if (val1 !== undefined && val2 !== undefined) {
        dotProduct += val1 * val2;
        norm1 += val1 * val1;
        norm2 += val2 * val2;
      }
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return similarity;
  }

  /**
   * Find most similar embeddings
   */
  findMostSimilar(
    queryEmbedding: number[],
    candidateEmbeddings: Array<{ id: string; embedding: number[] }>,
    topK = 5
  ): Array<{ id: string; similarity: number }> {
    const similarities = candidateEmbeddings.map((candidate) => ({
      id: candidate.id,
      similarity: this.calculateSimilarity(queryEmbedding, candidate.embedding),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
  }
}
