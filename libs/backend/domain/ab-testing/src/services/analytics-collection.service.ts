import { Injectable, Logger } from '@nestjs/common';

import { EventMetadata } from '../interfaces/ab-testing.interface';
import { ABTestingService, ABTestResult } from './ab-testing.service';

/**
 * Performance Metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  metadata?: EventMetadata;
}

/**
 * Aggregated Metrics
 */
export interface AggregatedMetrics {
  avgConversionRate: number;
  avgLatency: number;
  totalViews: number;
  totalConversions: number;
  totalMetrics?: number;
  confidence?: number;
  [key: string]: number | undefined;
}

/**
 * Metrics Collection Result
 */
export interface MetricsCollectionResult {
  testId: string;
  variantId: string;
  metrics: PerformanceMetric[];
  aggregated: AggregatedMetrics;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Analytics Collection Service
 * Collects performance metrics for A/B testing
 */
@Injectable()
export class AnalyticsCollectionService {
  private readonly logger = new Logger(AnalyticsCollectionService.name);
  private metrics: Map<string, PerformanceMetric[]> = new Map();

  constructor(private abTestingService: ABTestingService) {}

  /**
   * Collect metrics for A/B test
   */
  async collectMetrics(
    testId: string,
    variantId: string,
    period?: { start: Date; end: Date }
  ): Promise<MetricsCollectionResult> {
    this.logger.log(`Collecting metrics for test ${testId}, variant ${variantId}`);

    try {
      // Get test results
      const results = await this.abTestingService.getResults(testId);
      const variantResult = results.results.find((r: ABTestResult) => r.variantId === variantId);

      if (!variantResult) {
        throw new Error(`Variant ${variantId} not found in test ${testId}`);
      }

      // Get stored metrics for this variant
      const key = `${testId}:${variantId}`;
      const storedMetrics = this.metrics.get(key) || [];

      // Filter by period if provided
      let filteredMetrics = storedMetrics;
      if (period) {
        filteredMetrics = storedMetrics.filter(
          (m) => m.timestamp >= period.start && m.timestamp <= period.end
        );
      }

      // Calculate aggregated metrics
      const aggregated = this.calculateAggregated(variantResult, filteredMetrics);

      return {
        testId,
        variantId,
        metrics: filteredMetrics,
        aggregated: {
          ...aggregated,
          avgConversionRate: aggregated.avgConversionRate || 0,
          avgLatency: aggregated.avgLatency || 0,
          totalViews: aggregated.totalViews || 0,
          totalConversions: aggregated.totalConversions || 0,
        },
        period: period || {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          end: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to collect metrics for test ${testId}, variant ${variantId}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Record performance metric
   */
  async recordMetric(
    testId: string,
    variantId: string,
    metric: Omit<PerformanceMetric, 'timestamp'>
  ): Promise<void> {
    const key = `${testId}:${variantId}`;
    const metrics = this.metrics.get(key) || [];

    metrics.push({
      ...metric,
      timestamp: new Date(),
    });

    // Keep only last 1000 metrics per variant
    if (metrics.length > 1000) {
      metrics.shift();
    }

    this.metrics.set(key, metrics);

    this.logger.debug(`Metric recorded: ${testId}:${variantId} - ${metric.name} = ${metric.value}`);
  }

  /**
   * Record multiple metrics at once
   */
  async recordMetrics(
    testId: string,
    variantId: string,
    metrics: Omit<PerformanceMetric, 'timestamp'>[]
  ): Promise<void> {
    for (const metric of metrics) {
      await this.recordMetric(testId, variantId, metric);
    }
  }

  /**
   * Record conversion event with performance metrics
   */
  async recordConversion(
    testId: string,
    variantId: string,
    latencyMs?: number,
    metadata?: EventMetadata
  ): Promise<void> {
    // Track conversion in A/B testing service
    await this.abTestingService.trackEvent(testId, variantId, 'conversion', metadata);

    // Record performance metrics
    if (latencyMs !== undefined) {
      const metric: Omit<PerformanceMetric, 'timestamp'> = {
        name: 'conversion_latency',
        value: latencyMs,
        unit: 'ms',
      };
      if (metadata !== undefined) {
        metric.metadata = metadata;
      }
      await this.recordMetric(testId, variantId, metric);
    }

    const conversionMetric: Omit<PerformanceMetric, 'timestamp'> = {
      name: 'conversion',
      value: 1,
    };
    if (metadata !== undefined) {
      conversionMetric.metadata = metadata;
    }
    await this.recordMetric(testId, variantId, conversionMetric);
  }

  /**
   * Record view event with performance metrics
   */
  async recordView(
    testId: string,
    variantId: string,
    latencyMs?: number,
    metadata?: EventMetadata
  ): Promise<void> {
    // Track view in A/B testing service
    await this.abTestingService.trackEvent(testId, variantId, 'view', metadata);

    // Record performance metrics
    if (latencyMs !== undefined) {
      const metric: Omit<PerformanceMetric, 'timestamp'> = {
        name: 'view_latency',
        value: latencyMs,
        unit: 'ms',
      };
      if (metadata !== undefined) {
        metric.metadata = metadata;
      }
      await this.recordMetric(testId, variantId, metric);
    }

    const viewMetric: Omit<PerformanceMetric, 'timestamp'> = {
      name: 'view',
      value: 1,
    };
    if (metadata !== undefined) {
      viewMetric.metadata = metadata;
    }
    await this.recordMetric(testId, variantId, viewMetric);
  }

  /**
   * Get metrics summary for all variants
   */
  async getMetricsSummary(testId: string): Promise<Record<string, MetricsCollectionResult>> {
    const results = await this.abTestingService.getResults(testId);
    const summary: Record<string, MetricsCollectionResult> = {};

    for (const result of results.results) {
      summary[result.variantId] = await this.collectMetrics(testId, result.variantId);
    }

    return summary;
  }

  /**
   * Compare metrics between variants
   */
  async compareVariants(
    testId: string,
    variantIds: string[]
  ): Promise<{
    variants: Record<string, MetricsCollectionResult>;
    comparison: {
      bestVariant: string;
      improvement: number;
      confidence: number;
    };
  }> {
    const variants: Record<string, MetricsCollectionResult> = {};

    for (const variantId of variantIds) {
      variants[variantId] = await this.collectMetrics(testId, variantId);
    }

    // Find best variant by conversion rate
    if (variantIds.length === 0) {
      throw new Error('No variants found');
    }
    const firstVariantId = variantIds[0];
    if (firstVariantId === undefined) {
      throw new Error('First variant ID is undefined');
    }
    let bestVariant: string = firstVariantId;
    let bestRate = variants[bestVariant]?.aggregated.avgConversionRate || 0;

    for (const variantId of variantIds.slice(1)) {
      if (variantId !== undefined) {
        const rate = variants[variantId]?.aggregated.avgConversionRate || 0;
        if (rate > bestRate) {
          bestRate = rate;
          bestVariant = variantId;
        }
      }
    }

    // Calculate improvement
    const baseline = variants[firstVariantId]?.aggregated.avgConversionRate || 0;
    const improvement = baseline > 0 ? ((bestRate - baseline) / baseline) * 100 : 0;

    // Get confidence from test results
    const testResults = await this.abTestingService.getResults(testId);
    const confidence = testResults.statisticalSignificance || 0;

    return {
      variants,
      comparison: {
        bestVariant,
        improvement,
        confidence,
      },
    };
  }

  /**
   * Calculate aggregated metrics
   */
  private calculateAggregated(
    variantResult: ABTestResult,
    metrics: PerformanceMetric[]
  ): AggregatedMetrics {
    const latencyMetrics = metrics.filter((m) => m.name.includes('latency'));

    const avgLatency =
      latencyMetrics.length > 0
        ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) / latencyMetrics.length
        : 0;

    return {
      avgConversionRate: variantResult.conversionRate,
      avgLatency,
      totalViews: variantResult.views,
      totalConversions: variantResult.conversions,
      totalMetrics: metrics.length,
      confidence: variantResult.confidence,
    };
  }

  /**
   * Clear metrics for a test
   */
  clearMetrics(testId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.metrics.keys()) {
      if (key.startsWith(`${testId}:`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.metrics.delete(key);
    }

    this.logger.log(`Cleared metrics for test ${testId}`);
  }
}
