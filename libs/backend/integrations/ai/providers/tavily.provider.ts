import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AICapability,
  AIProvider,
  AIRequest,
  ProviderInfo,
  RateLimit,
  SearchRequest,
  SearchResponse,
  SearchResult,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class TavilyProvider implements AIProvider {
  id = 'tavily';
  name = 'Tavily (Real-time Search)';
  capabilities = [AICapability.SEARCH];
  supportedLanguages = ['en'];

  rateLimit: RateLimit = {
    requestsPerMinute: 60,
  };

  private apiKey: string;
  private apiHost = 'https://api.tavily.com';

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    this.apiKey = this.configService?.get('TAVILY_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('TAVILY_API_KEY not set - Tavily provider will not work');
    }
  }

  async execute<T>(request: AIRequest): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Tavily provider is not configured');
    }

    switch (request.type) {
      case AICapability.SEARCH:
        if (this.isSearchRequest(request)) {
          return this.executeSearch(request) as Promise<T>;
        }
        throw new Error('Invalid search request');
      default:
        throw new Error(`Tavily provider does not support ${request.type}`);
    }
  }

  private isSearchRequest(request: AIRequest): request is SearchRequest {
    return request.type === AICapability.SEARCH && 'query' in request;
  }

  private async executeSearch(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      const endpoint = `${this.apiHost}/search`;
      const maxResults = request.maxResults || 5;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: request.query,
          max_results: maxResults,
          include_answer: request.includeAnswer ?? true,
          search_depth: 'basic',
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const result = (await response.json()) as {
        results?: Array<{ title: string; url: string; snippet: string; score?: number }>;
        answer?: string;
      };
      const responseTimeMs = Date.now() - startTime;

      return {
        id: request.id || `tavily-${Date.now()}`,
        provider: this.id,
        model: 'tavily-search',
        results: (result.results || []).map(
          (r: { title: string; url: string; snippet: string; score?: number }): SearchResult => {
            const searchResult: SearchResult = {
              title: r.title,
              url: r.url,
              snippet: r.snippet,
            };
            if (r.score !== undefined) {
              searchResult.score = r.score;
            }
            return searchResult;
          }
        ),
        answer: result.answer || undefined,
        cost: 0, // Tavily is free tier
        timestamp: new Date(),
        metadata: {
          responseTimeMs,
          resultCount: result.results?.length || 0,
        },
      } as any as SearchResponse;
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
    if (!this.apiKey) return false;
    try {
      const response = await fetch(`${this.apiHost}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: 'test',
          max_results: 1,
        }),
      });
      return response.ok || response.status === 400; // 400 might mean auth ok but invalid query
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
}
