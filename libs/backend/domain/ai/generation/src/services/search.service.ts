import { Injectable, Logger } from '@nestjs/common';
import {
  AICapability,
  AIExecutionRepository,
  AIRouter,
  SearchRequest,
  SearchResponse,
} from '@workix/ai/ai-core';

import {
  CompetitorPriceResult,
  SearchOptions,
  SearchResponseExtended,
} from '../interfaces/generation.interface';

@Injectable()
export class SearchService {
  private logger = new Logger(SearchService.name);
  private cache: Map<string, SearchResponseExtended> = new Map();

  constructor(private aiRouter: AIRouter, private executionRepository: AIExecutionRepository) {}

  /**
   * Perform web search
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResponseExtended> {
    const requestId = `search-${Date.now()}`;
    const startTime = Date.now();
    const cacheKey = `${query}-${options?.maxResults}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      this.logger.debug(`Search cache hit: ${query}`);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Use Tavily for real-time search
      const provider = await this.aiRouter.selectProvider(
        AICapability.SEARCH,
        { qualityWeight: 1.0 } // Search is deterministic, quality = relevance
      );

      const request: SearchRequest = {
        id: requestId,
        type: AICapability.SEARCH,
        query,
        maxResults: options?.maxResults || 5,
        includeAnswer: options?.includeAnswer ?? true,
      };

      const response = await provider.execute<SearchResponse>(request);
      const responseTimeMs = Date.now() - startTime;

      await this.executionRepository.recordExecution({
        requestId,
        providerId: provider.id,
        success: true,
        responseTimeMs,
        cost: response.cost,
        timestamp: new Date(),
      });

      // Cache results (1 hour TTL)
      const searchResponse: SearchResponseExtended = response as SearchResponseExtended;
      this.cache.set(cacheKey, searchResponse);
      setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

      this.logger.debug(
        `Search: ${query} returned ${
          searchResponse.results?.length || 0
        } results in ${responseTimeMs}ms`
      );

      return searchResponse;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Search failed: ${errorMessage}`);

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
   * Search competitor prices
   */
  async searchCompetitorPrices(
    productName: string,
    platforms: string[] = ['Amazon', 'eBay', 'Walmart']
  ): Promise<Record<string, CompetitorPriceResult>> {
    const results: Record<string, CompetitorPriceResult> = {};

    for (const platform of platforms) {
      try {
        const query = `${productName} price ${platform}`;
        const result: SearchResponseExtended = await this.search(query, { maxResults: 3 });
        const priceResult: CompetitorPriceResult = {
          platform,
        };
        if (result.results?.[0]?.url !== undefined) {
          priceResult.url = result.results[0].url;
        }
        results[platform] = priceResult;
      } catch (error) {
        this.logger.warn(`Failed to search on ${platform}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Search market trends
   */
  async searchTrends(topic: string): Promise<SearchResponseExtended> {
    const query = `${topic} trends 2024 2025`;
    return this.search(query, { maxResults: 10, includeAnswer: true });
  }

  /**
   * Search customer reviews
   */
  async searchReviews(productName: string): Promise<SearchResponseExtended> {
    const query = `${productName} reviews feedback ratings`;
    return this.search(query, { maxResults: 5, includeAnswer: true });
  }

  /**
   * Research topic
   */
  async research(
    topic: string,
    depth: 'shallow' | 'deep' = 'shallow'
  ): Promise<SearchResponseExtended> {
    const maxResults = depth === 'deep' ? 20 : 5;
    return this.search(topic, { maxResults, includeAnswer: true });
  }

  /**
   * Batch search multiple queries
   */
  async batchSearch(queries: string[]): Promise<Record<string, SearchResponseExtended | null>> {
    const results: Record<string, SearchResponseExtended | null> = {};

    for (const query of queries) {
      try {
        const result = await this.search(query);
        results[query] = result;
      } catch (error) {
        this.logger.warn(`Failed to search: ${query}`);
        results[query] = null;
      }
    }

    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Search cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
