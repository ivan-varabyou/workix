import { Injectable, Logger } from '@nestjs/common';

import {
  AICapability,
  AIProvider,
  AIRequest,
  AIResponse,
  ExecutionResult,
  ProviderMetrics,
  SelectionConstraints,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class AIRouter {
  private logger: Logger = new Logger(AIRouter.name);
  private providers: Map<string, AIProvider> = new Map();
  private metrics: Map<string, ProviderMetrics> = new Map();
  private executionHistory: ExecutionResult[] = [];

  /**
   * Register a provider
   */
  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
    this.logger.log(`Provider registered: ${provider.id}`);

    // Initialize metrics
    this.metrics.set(provider.id, {
      providerId: provider.id,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTimeMs: 0,
      medianResponseTimeMs: 0,
      p95ResponseTimeMs: 0,
      p99ResponseTimeMs: 0,
      averageCost: 0,
      totalCost: 0,
      successRate: 1,
      errorRate: 0,
      lastUpdated: new Date(),
    });
  }

  /**
   * Get all providers
   */
  getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get providers by capability
   */
  getProvidersByCapability(capability: AICapability): AIProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.capabilities.includes(capability));
  }

  /**
   * Select best provider based on constraints
   */
  async selectProvider(
    capability: AICapability,
    constraints?: SelectionConstraints
  ): Promise<AIProvider> {
    const candidates = this.getProvidersByCapability(capability);

    if (candidates.length === 0) {
      throw new Error(`No providers available for capability: ${capability}`);
    }

    if (candidates.length === 1) {
      const provider = candidates[0];
      if (provider) {
        return provider;
      }
    }

    // Filter out excluded providers
    let filtered = candidates.filter((p) => !constraints?.excludeProviders?.includes(p.id));

    if (filtered.length === 0) {
      filtered = candidates; // Fallback if all excluded
    }

    // Preferred providers first
    if (constraints?.preferredProviders?.length) {
      const preferred = filtered.filter((p) => constraints.preferredProviders?.includes(p.id));
      if (preferred.length > 0) {
        filtered = preferred;
      }
    }

    // Score and sort
    const scored = filtered.map((provider) => ({
      provider,
      score: this.calculateProviderScore(provider.id, constraints),
    }));

    scored.sort((a, b) => b.score - a.score);

    const topProvider = scored[0];
    if (!topProvider) {
      throw new Error('No providers available');
    }

    this.logger.debug(
      `Selected provider: ${topProvider.provider.id} (score: ${topProvider.score.toFixed(2)})`
    );

    return topProvider.provider;
  }

  /**
   * Execute with automatic failover
   */
  async executeWithFailover(
    request: AIRequest,
    capability: AICapability,
    maxRetries = 3
  ): Promise<AIResponse> {
    const providers = this.getProvidersByCapability(capability);

    if (providers.length === 0) {
      throw new Error(`No providers available for ${capability}`);
    }

    let lastError: Error | null = null;
    const excludeProviders: string[] = [];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const provider = await this.selectProvider(capability, {
          excludeProviders,
        });

        const result = await this.executeProvider(provider, request);
        this.recordSuccess(provider.id, result);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < providers.length - 1) {
          excludeProviders.push((error as any).provider || 'unknown');
        }
        this.recordFailure((error as any).provider || 'unknown', lastError);
      }
    }

    throw new Error(`Failed to execute request after ${maxRetries} retries: ${lastError?.message}`);
  }

  /**
   * Execute on single provider
   */
  async executeProvider<T extends AIResponse>(
    provider: AIProvider,
    request: AIRequest
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const response = await provider.execute<T>(request);
      return response;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      throw {
        provider: provider.id,
        error: error instanceof Error ? error.message : String(error),
        responseTimeMs,
      };
    }
  }

  /**
   * Parallel execution for A/B testing
   */
  async executeParallel<T extends AIResponse>(
    request: AIRequest,
    capability: AICapability,
    count = 2
  ): Promise<T[]> {
    const providers = this.getProvidersByCapability(capability)
      .sort((a, b) => {
        const scoreA = this.calculateProviderScore(a.id);
        const scoreB = this.calculateProviderScore(b.id);
        return scoreB - scoreA;
      })
      .slice(0, count);

    if (providers.length === 0) {
      throw new Error(`No providers available for ${capability}`);
    }

    const results = await Promise.allSettled(
      providers.map((provider) => this.executeProvider<T>(provider, request))
    );

    const filtered: T[] = [];
    for (const result of results) {
      const index = results.indexOf(result);
      const provider = providers[index];
      if (!provider) {
        continue;
      }

      if (result.status === 'fulfilled') {
        this.recordSuccess(provider.id, result.value);
        filtered.push(result.value);
      } else {
        this.recordFailure(provider.id, result.reason);
      }
    }
    return filtered;
  }

  /**
   * Get metrics for a provider
   */
  getMetrics(providerId: string): ProviderMetrics | undefined {
    return this.metrics.get(providerId);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): ProviderMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 100): ExecutionResult[] {
    return this.executionHistory.slice(-limit);
  }

  // Private methods

  private calculateProviderScore(providerId: string, constraints?: SelectionConstraints): number {
    const metrics = this.metrics.get(providerId);
    if (!metrics) return 0;

    // Default weights
    const qualityWeight = constraints?.qualityWeight ?? 0.5;
    const speedWeight = constraints?.speedWeight ?? 0.3;
    const costWeight = constraints?.costWeight ?? 0.2;

    // Normalize scores
    const successScore = metrics.successRate; // 0-1
    const speedScore = Math.max(0, 1 - metrics.averageResponseTimeMs / 10000); // Normalize
    const costScore = Math.max(0, 1 - metrics.averageCost / 0.1); // Normalize

    const totalScore =
      successScore * qualityWeight + speedScore * speedWeight + costScore * costWeight;

    // Apply hard constraints
    if (
      constraints?.maxResponseTimeMs &&
      metrics.averageResponseTimeMs > constraints.maxResponseTimeMs
    ) {
      return 0;
    }

    if (constraints?.maxCostPerRequest && metrics.averageCost > constraints.maxCostPerRequest) {
      return 0;
    }

    if (constraints?.maxFailureRate && metrics.errorRate > constraints.maxFailureRate) {
      return 0;
    }

    return totalScore;
  }

  private recordSuccess(providerId: string, response: AIResponse): void {
    const metrics = this.metrics.get(providerId);
    if (!metrics) return;

    metrics.totalRequests++;
    metrics.successfulRequests++;
    metrics.totalCost += response.cost;
    metrics.averageCost =
      (metrics.averageCost * (metrics.successfulRequests - 1) + response.cost) /
      metrics.successfulRequests;
    metrics.successRate = metrics.successfulRequests / metrics.totalRequests;
    metrics.errorRate = metrics.failedRequests / metrics.totalRequests;
    metrics.lastUpdated = new Date();
  }

  private recordFailure(_providerId: string, _error: Error): void {
    // Record failure metrics for provider
    // const _metrics = this.metrics.get(_providerId);
  }
}
