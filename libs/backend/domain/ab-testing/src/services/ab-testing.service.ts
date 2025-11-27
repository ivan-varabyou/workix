import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import {
  ABTest,
  ABTestConfig,
  ABTestEntity,
  ABTestPrismaService,
  ABTestResult,
  ABTestResultsResponse,
  ABTestUpdateData,
  EventMetadata,
  TrafficSplit,
} from '../interfaces/ab-testing.interface';

// Re-export ABTestResult for use in other services
export type { ABTestResult };

@Injectable()
export class ABTestingService {
  private logger = new Logger(ABTestingService.name);
  private tests: Map<string, ABTest> = new Map();

  constructor(private prisma: ABTestPrismaService) {}

  /**
   * Create A/B test
   */
  async createTest(config: ABTestConfig): Promise<ABTest> {
    const testId: string = uuid();
    const test: ABTest = {
      id: testId,
      ...config,
      status: 'running',
      createdAt: new Date(),
      updatedAt: new Date(),
      results: {},
    };

    this.tests.set(testId, test);

    // Calculate traffic split from variants
    const trafficSplit: TrafficSplit = {};
    const totalWeight: number = config.variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    config.variants.forEach((v) => {
      trafficSplit[v.id] = ((v.weight || 1) / totalWeight) * 100;
    });

    // Persist to database
    await this.prisma.abTest.create({
      data: {
        id: testId,
        name: config.name,
        description: config.description || null,
        type: config.metric, // Use metric as type
        status: 'running',
        variants: config.variants,
        trafficSplit: trafficSplit,
        startDate: new Date(),
      },
    });

    this.logger.log(`A/B test created: ${testId} with ${config.variants.length} variants`);

    return test;
  }

  /**
   * Track event (view/conversion)
   */
  async trackEvent(
    testId: string,
    variantId: string,
    event: 'view' | 'conversion',
    metadata?: EventMetadata
  ): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    // Initialize variant result if needed
    if (!test.results[variantId]) {
      test.results[variantId] = {
        variantId,
        views: 0,
        conversions: 0,
        conversionRate: 0,
        confidence: 0,
      };
    }

    const result = test.results[variantId];

    if (event === 'view') {
      result.views++;
    } else if (event === 'conversion') {
      result.conversions++;
      result.views++; // Conversion is also a view
    }

    result.conversionRate = result.conversions / result.views || 0;

    // Persist event
    await this.prisma.abTestEvent.create({
      data: {
        id: uuid(),
        testId,
        variant: variantId,
        eventType: event,
        metadata: metadata || {},
      },
    });
  }

  /**
   * Get test results
   */
  async getResults(testId: string): Promise<ABTestResultsResponse> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    const results: ABTestResult[] = Object.values(test.results);

    if (results.length < 2) {
      return {
        testId,
        status: test.status,
        results,
        recommendation: 'Insufficient data for comparison',
      };
    }

    // Calculate statistical significance using Chi-square test
    const significance = this.calculateChiSquare(results);
    const winner = this.determineWinner(results, significance);

    const response: ABTestResultsResponse = {
      testId,
      status: test.status,
      results,
      statisticalSignificance: significance,
      recommendation: this.generateRecommendation(winner, significance, results),
    };
    if (winner !== undefined) {
      response.winner = winner;
    }
    return response;
  }

  /**
   * End test
   */
  async endTest(testId: string): Promise<ABTestResultsResponse> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    test.status = 'completed';
    test.completedAt = new Date();

    // Get results to determine winner
    const results = await this.getResults(testId);

    const updateData: ABTestUpdateData = {
      status: 'completed',
      endDate: new Date(),
    };
    if (results.winner !== undefined) {
      updateData.winnerVariant = results.winner;
    }
    if (results.statisticalSignificance !== undefined) {
      updateData.confidenceLevel = results.statisticalSignificance * 100;
    }
    await this.prisma.abTest.update({
      where: { id: testId },
      data: updateData,
    });

    this.logger.log(`A/B test ended: ${testId}, winner: ${results.winner}`);

    return results;
  }

  /**
   * Calculate confidence interval
   */
  calculateConfidenceInterval(
    successes: number,
    trials: number,
    confidenceLevel = 0.95
  ): { lower: number; upper: number } {
    const p = successes / trials;
    const z = this.getZScore(confidenceLevel);
    const se = Math.sqrt((p * (1 - p)) / trials);

    return {
      lower: Math.max(0, p - z * se),
      upper: Math.min(1, p + z * se),
    };
  }

  /**
   * Calculate chi-square test
   */
  private calculateChiSquare(results: ABTestResult[]): number {
    if (results.length < 2) return 0;

    const variant1 = results[0];
    const variant2 = results[1];
    if (variant1 === undefined || variant2 === undefined) return 0;

    const contingencyTable = [
      [variant1.conversions, variant1.views - variant1.conversions],
      [variant2.conversions, variant2.views - variant2.conversions],
    ];

    const totalViews = variant1.views + variant2.views;
    const totalConversions = variant1.conversions + variant2.conversions;

    let chiSquare = 0;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const expected =
          ((i === 0 ? variant1.views : variant2.views) / totalViews) *
          (j === 0 ? totalConversions : totalViews - totalConversions);

        if (expected > 0) {
          const tableValue = contingencyTable[i];
          if (tableValue !== undefined) {
            const cellValue = tableValue[j];
            if (cellValue !== undefined) {
              const diff = cellValue - expected;
              chiSquare += (diff * diff) / expected;
            }
          }
        }
      }
    }

    // Convert chi-square to p-value (approximation)
    return this.chiSquareToPValue(chiSquare);
  }

  /**
   * Convert chi-square to p-value
   */
  private chiSquareToPValue(chiSquare: number): number {
    if (chiSquare < 2.706) return 0.1;
    if (chiSquare < 3.841) return 0.05;
    if (chiSquare < 5.024) return 0.025;
    if (chiSquare < 6.635) return 0.01;
    return 0.001;
  }

  /**
   * Get Z-score for confidence level
   */
  private getZScore(confidenceLevel: number): number {
    const zScores: Record<number, number> = {
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };

    return zScores[confidenceLevel] || 1.96;
  }

  /**
   * Determine winner
   */
  private determineWinner(results: ABTestResult[], significance: number): string | undefined {
    if (significance > 0.05) {
      return undefined; // Not statistically significant
    }

    if (results.length === 0) {
      return undefined;
    }

    let winner = results[0];
    if (winner === undefined) {
      return undefined;
    }

    for (const result of results.slice(1)) {
      if (result !== undefined && result.conversionRate > winner.conversionRate) {
        winner = result;
      }
    }

    return winner.variantId;
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    winner: string | undefined,
    _significance: number,
    results: ABTestResult[]
  ): string {
    if (!winner) {
      return 'No statistically significant difference detected. Continue testing or increase sample size.';
    }

    const winnerResult = results.find((r) => r.variantId === winner);
    const baselineResult = results[0];
    if (baselineResult === undefined) {
      return 'Insufficient data for recommendation.';
    }

    const winnerRate = winnerResult?.conversionRate || 0;
    const baselineRate = baselineResult.conversionRate || 0;
    const improvement = baselineRate > 0 ? (winnerRate - baselineRate) / baselineRate : 0;

    return `Variant ${winner} is the clear winner with ${(improvement * 100).toFixed(
      1
    )}% improvement. Recommend rolling out to 100%.`;
  }

  /**
   * Get all tests
   */
  async getAllTests(): Promise<ABTest[]> {
    return Array.from(this.tests.values());
  }

  /**
   * List tests with optional filter
   */
  async listTests(status?: string): Promise<ABTest[]> {
    let tests: ABTest[] = Array.from(this.tests.values());
    if (status) {
      tests = tests.filter((t) => t.status === status);
    }
    return tests;
  }

  /**
   * Get test by ID
   */
  async getTest(testId: string): Promise<ABTest> {
    const test: ABTest | undefined = this.tests.get(testId);
    if (!test) {
      // Try to load from database
      const dbTest: ABTestEntity | null = await this.prisma.abTest.findUnique({
        where: { id: testId },
        include: { events: true },
      });
      if (dbTest) {
        const convertedTest: ABTest = {
          id: dbTest.id,
          name: dbTest.name,
          variants: dbTest.variants,
          metric: dbTest.type || 'conversion_rate',
          status: dbTest.status as 'running' | 'paused' | 'completed',
          createdAt: dbTest.createdAt,
          updatedAt: dbTest.updatedAt,
          results: (dbTest.results as Record<string, ABTestResult>) || {},
        };
        if (dbTest.description !== null && dbTest.description !== undefined) {
          convertedTest.description = dbTest.description;
        }
        if (dbTest.endDate !== null && dbTest.endDate !== undefined) {
          convertedTest.completedAt = dbTest.endDate;
        }
        return convertedTest;
      }
      throw new Error(`Test ${testId} not found`);
    }
    return test;
  }

  /**
   * Pause test
   */
  async pauseTest(testId: string): Promise<ABTest> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    test.status = 'paused';
    test.updatedAt = new Date();

    await this.prisma.abTest.update({
      where: { id: testId },
      data: { status: 'paused' },
    });

    this.logger.log(`A/B test paused: ${testId}`);
    return test;
  }

  /**
   * Resume test
   */
  async resumeTest(testId: string): Promise<ABTest> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    test.status = 'running';
    test.updatedAt = new Date();

    await this.prisma.abTest.update({
      where: { id: testId },
      data: { status: 'running' },
    });

    this.logger.log(`A/B test resumed: ${testId}`);
    return test;
  }

  /**
   * Calculate sample size needed
   */
  calculateSampleSize(
    baselineConversionRate: number,
    minEffectSize: number,
    confidenceLevel = 0.95,
    powerLevel = 0.8
  ): number {
    const z_alpha = this.getZScore(confidenceLevel);
    const z_beta = this.getZScore(powerLevel + 0.05); // Approximate

    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate * (1 + minEffectSize);
    const pooledP = (p1 + p2) / 2;

    const numerator = (z_alpha + z_beta) ** 2 * 2 * pooledP * (1 - pooledP);
    const denominator = (p2 - p1) ** 2;

    return Math.ceil(numerator / denominator);
  }
}
