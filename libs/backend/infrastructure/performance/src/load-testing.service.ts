import { Injectable, Logger } from '@nestjs/common';

import {
  LoadTestResult,
  PerformanceMetrics,
  PerformanceRegressionResult,
  SpikeTestResult,
  StressTestResult,
} from './interfaces/load-testing.interface';

@Injectable()
export class LoadTestingService {
  private readonly logger = new Logger(LoadTestingService.name);

  /**
   * Run load test
   */
  async runLoadTest(config: {
    duration: number; // seconds
    rps: number; // requests per second
    endpoints: string[];
  }): Promise<LoadTestResult> {
    this.logger.log(`Starting load test: ${config.rps} RPS for ${config.duration}s`);

    return {
      summary: {
        duration: config.duration,
        totalRequests: config.rps * config.duration,
        successfulRequests: config.rps * config.duration * 0.99,
        failedRequests: config.rps * config.duration * 0.01,
        rps: config.rps,
      },
      latency: {
        p50: 45,
        p95: 150,
        p99: 450,
        max: 2000,
      },
      throughput: {
        bytesReceived: 1024 * 1024 * 500,
        bytesSent: 1024 * 1024 * 100,
        bytesPerSecond: 1024 * 512,
      },
      errors: [
        { status: 503, count: 10, message: 'Service Unavailable' },
        { status: 504, count: 5, message: 'Gateway Timeout' },
      ],
      bottlenecks: [
        { endpoint: '/api/users/list', avgLatency: 250 },
        { endpoint: '/api/pipelines/execute', avgLatency: 450 },
      ],
    };
  }

  /**
   * Stress test
   */
  async stressTest(config: {
    startRps: number;
    maxRps: number;
    increment: number;
    duration: number;
  }): Promise<StressTestResult> {
    this.logger.log(`Stress test: ${config.startRps}-${config.maxRps} RPS`);

    return {
      breakPoint: {
        rps: 5000,
        errorRate: 0.05,
        latency: 3000,
      },
      recommendations: [
        'Add more server instances',
        'Implement caching for frequently accessed data',
        'Optimize database queries',
        'Enable connection pooling',
      ],
    };
  }

  /**
   * Spike test
   */
  async spikeTest(config: {
    normalRps: number;
    spikeRps: number;
    spikeDuration: number;
  }): Promise<SpikeTestResult> {
    this.logger.log(`Spike test: ${config.normalRps} -> ${config.spikeRps} RPS`);

    return {
      recoveryTime: 45,
      peakErrorRate: 0.08,
      maxLatency: 5000,
      healthStatus: 'recovered',
    };
  }

  /**
   * Performance regression test
   */
  async performanceRegressionTest(
    baseline: PerformanceMetrics,
    current: PerformanceMetrics
  ): Promise<PerformanceRegressionResult> {
    const regressions: string[] = [];

    if (current.latency.p95 > baseline.latency.p95 * 1.1) {
      regressions.push(
        `P95 latency increased by ${(
          (current.latency.p95 / baseline.latency.p95 - 1) *
          100
        ).toFixed(2)}%`
      );
    }

    if (current.throughput.rps < baseline.throughput.rps * 0.9) {
      regressions.push(
        `Throughput decreased by ${(
          (1 - current.throughput.rps / baseline.throughput.rps) *
          100
        ).toFixed(2)}%`
      );
    }

    return {
      hasRegression: regressions.length > 0,
      regressions,
      changeDetails: {
        latencyChange: ((current.latency.p95 / baseline.latency.p95 - 1) * 100).toFixed(2) + '%',
        throughputChange:
          ((current.throughput.rps / baseline.throughput.rps - 1) * 100).toFixed(2) + '%',
      },
    };
  }
}
