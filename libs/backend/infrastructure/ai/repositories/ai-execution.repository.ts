import { Injectable } from '@nestjs/common';

import {
  AIExecutionHistory,
  AIExecutionPrismaService,
  AIProviderEntity,
} from '../interfaces/ai-prisma.interface';
import {
  AICapability,
  AIResponse,
  ExecutionResult,
  ProviderMetrics,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class AIExecutionRepository {
  constructor(private prisma: AIExecutionPrismaService) {}

  /**
   * Record execution result
   */
  async recordExecution(result: ExecutionResult): Promise<void> {
    const createData: {
      requestId: string;
      providerId: string;
      modelId?: string | null;
      success: boolean;
      responseTimeMs: number;
      cost: number;
      userRating?: number | null;
      feedback?: string | null;
      timestamp: Date;
      metadata: string | null;
    } = {
      requestId: result.requestId,
      providerId: result.providerId,
      success: result.success,
      responseTimeMs: result.responseTimeMs,
      cost: result.cost,
      timestamp: result.timestamp,
      metadata: result.response
        ? JSON.stringify({
            tokensUsed: (result.response as AIResponse).tokensUsed,
            model: (result.response as AIResponse).model,
          })
        : result.error
        ? JSON.stringify({
            error: result.error instanceof Error ? result.error.message : result.error,
          })
        : null,
    };
    if (result.modelId !== undefined) {
      createData.modelId = result.modelId;
    }
    if (result.userRating !== undefined) {
      createData.userRating = result.userRating;
    }
    if (result.feedback !== undefined) {
      createData.feedback = result.feedback;
    }
    await this.prisma.aiExecutionHistory.create({
      data: createData,
    });
  }

  /**
   * Get provider metrics
   */
  async getProviderMetrics(providerId: string, days = 30): Promise<ProviderMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const executions = await this.prisma.aiExecutionHistory.findMany({
      where: {
        providerId,
        timestamp: { gte: startDate },
      },
    });

    if (executions.length === 0) {
      return {
        providerId,
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
      };
    }

    const successful: AIExecutionHistory[] = executions.filter(
      (e: AIExecutionHistory) => e.success
    );
    const failed: AIExecutionHistory[] = executions.filter((e: AIExecutionHistory) => !e.success);
    const responseTimes: number[] = successful
      .map((e: AIExecutionHistory) => e.responseTimeMs)
      .sort((a: number, b: number) => a - b);

    const avgResponseTime: number =
      successful.length > 0
        ? successful.reduce((sum: number, e: AIExecutionHistory) => sum + e.responseTimeMs, 0) /
          successful.length
        : 0;

    const medianResponseTime: number =
      responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length / 2)] || 0 : 0;

    const p95ResponseTime: number =
      responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.95)] || 0 : 0;

    const p99ResponseTime: number =
      responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.99)] || 0 : 0;

    const totalCost: number = successful.reduce(
      (sum: number, e: AIExecutionHistory) => sum + e.cost,
      0
    );
    const avgCost = totalCost / successful.length || 0;

    return {
      providerId,
      totalRequests: executions.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTimeMs: avgResponseTime,
      medianResponseTimeMs: medianResponseTime,
      p95ResponseTimeMs: p95ResponseTime,
      p99ResponseTimeMs: p99ResponseTime,
      averageCost: avgCost,
      totalCost,
      successRate: successful.length / executions.length,
      errorRate: failed.length / executions.length,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get metrics for all providers
   */
  async getAllProviderMetrics(days = 30): Promise<ProviderMetrics[]> {
    const providers: AIProviderEntity[] = await this.prisma.aiProvider.findMany({
      select: { providerId: true },
      distinct: ['providerId'],
    });

    const metrics: ProviderMetrics[] = await Promise.all(
      providers.map((p: AIProviderEntity) => this.getProviderMetrics(p.providerId, days))
    );

    return metrics;
  }

  /**
   * Get metrics by capability
   */
  async getMetricsByCapability(capability: AICapability, days = 30): Promise<ProviderMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const providers = await this.prisma.aiProvider.findMany({
      where: {
        capabilities: { has: capability },
      },
      select: { providerId: true },
    });

    const metrics: ProviderMetrics[] = await Promise.all(
      providers.map((p: AIProviderEntity) => this.getProviderMetrics(p.providerId, days))
    );

    return metrics.sort((a: ProviderMetrics, b: ProviderMetrics) => b.successRate - a.successRate);
  }

  /**
   * Get best provider for capability
   */
  async getBestProvider(
    capability: AICapability,
    strategy: 'quality' | 'speed' | 'cost' = 'quality',
    days = 30
  ): Promise<string | null> {
    const metrics = await this.getMetricsByCapability(capability, days);

    if (metrics.length === 0) return null;

    // Filter only successful providers
    const viable = metrics.filter((m) => m.successRate > 0.9);

    if (viable.length === 0) {
      const firstMetric = metrics[0];
      return firstMetric ? firstMetric.providerId : null;
    }

    let best = viable[0];

    switch (strategy) {
      case 'quality':
        // Highest success rate + user rating
        best = viable.reduce((prev, current) => {
          const prevScore = prev.successRate * (prev.averageUserRating || 0);
          const currentScore = current.successRate * (current.averageUserRating || 0);
          return currentScore > prevScore ? current : prev;
        });
        break;

      case 'speed':
        // Lowest response time
        best = viable.reduce((prev, current) =>
          current.averageResponseTimeMs < prev.averageResponseTimeMs ? current : prev
        );
        break;

      case 'cost':
        // Lowest cost
        best = viable.reduce((prev, current) =>
          current.averageCost < prev.averageCost ? current : prev
        );
        break;
    }

    return best.providerId;
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(providerId?: string, limit = 100): Promise<ExecutionResult[]> {
    const executions = await this.prisma.aiExecutionHistory.findMany({
      where: providerId ? { providerId } : {},
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return executions.map((e: AIExecutionHistory): ExecutionResult => {
      const executionResult: ExecutionResult = {
        requestId: e.requestId,
        providerId: e.providerId,
        success: e.success,
        responseTimeMs: e.responseTimeMs,
        cost: e.cost,
        timestamp: e.timestamp,
      };
      if (e.modelId !== undefined && e.modelId !== null) {
        executionResult.modelId = e.modelId;
      }
      if (e.userRating !== undefined && e.userRating !== null) {
        executionResult.userRating = e.userRating;
      }
      if (e.feedback !== undefined && e.feedback !== null) {
        executionResult.feedback = e.feedback;
      }
      return executionResult;
    });
  }

  /**
   * Get average user rating per provider
   */
  async getAverageUserRating(providerId: string, days = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.prisma.aiExecutionHistory.aggregate({
      where: {
        providerId,
        userRating: { not: null },
        timestamp: { gte: startDate },
      },
      _avg: { userRating: true },
    });

    return result._avg.userRating || 0;
  }

  /**
   * Record user feedback
   */
  async recordUserFeedback(executionId: string, rating: number, feedback?: string): Promise<void> {
    const updateData: {
      userRating: number;
      feedback?: string | null;
    } = {
      userRating: rating,
    };
    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }
    await this.prisma.aiExecutionHistory.update({
      where: { id: executionId },
      data: updateData,
    });
  }

  /**
   * Compare providers for same task
   */
  async compareProviders(
    providers: string[],
    _capability: AICapability,
    days = 30
  ): Promise<Record<string, ProviderMetrics>> {
    const result: Record<string, ProviderMetrics> = {};

    for (const providerId of providers) {
      result[providerId] = await this.getProviderMetrics(providerId, days);
    }

    return result;
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis(
    _capability: AICapability,
    days = 30
  ): Promise<
    Array<{
      providerId: string;
      totalCost: number;
      requestCount: number;
      avgCostPerRequest: number;
    }>
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await this.prisma.aiExecutionHistory.groupBy({
      by: ['providerId'],
      where: {
        timestamp: { gte: startDate },
        success: true,
      },
      _sum: { cost: true },
      _count: true,
    });

    return results.map(
      (r: { providerId: string; _sum: { cost: number | null }; _count: number }) => ({
        providerId: r.providerId,
        totalCost: r._sum.cost || 0,
        requestCount: r._count,
        avgCostPerRequest: (r._sum.cost || 0) / r._count,
      })
    );
  }

  /**
   * Get performance trends
   */
  async getPerformanceTrends(
    providerId: string,
    days = 30,
    intervalDays = 1
  ): Promise<
    Array<{
      date: Date;
      successRate: number;
      avgResponseTimeMs: number;
      avgCost: number;
      requestCount: number;
    }>
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const executions = await this.prisma.aiExecutionHistory.findMany({
      where: {
        providerId,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    const trends: Array<{
      date: Date;
      successRate: number;
      avgResponseTimeMs: number;
      avgCost: number;
      requestCount: number;
    }> = [];

    for (let i = 0; i < days; i += intervalDays) {
      const intervalStart = new Date();
      intervalStart.setDate(intervalStart.getDate() - days + i);
      const intervalEnd = new Date(intervalStart);
      intervalEnd.setDate(intervalEnd.getDate() + intervalDays);

      const dayExecutions: AIExecutionHistory[] = executions.filter(
        (e: AIExecutionHistory) => e.timestamp >= intervalStart && e.timestamp < intervalEnd
      );

      if (dayExecutions.length > 0) {
        const successful: AIExecutionHistory[] = dayExecutions.filter(
          (e: AIExecutionHistory) => e.success
        );
        trends.push({
          date: intervalStart,
          successRate: successful.length / dayExecutions.length,
          avgResponseTimeMs:
            successful.length > 0
              ? successful.reduce(
                  (sum: number, e: AIExecutionHistory) => sum + e.responseTimeMs,
                  0
                ) / successful.length
              : 0,
          avgCost:
            successful.length > 0
              ? successful.reduce((sum: number, e: AIExecutionHistory) => sum + e.cost, 0) /
                successful.length
              : 0,
          requestCount: dayExecutions.length,
        });
      }
    }

    return trends;
  }
}
