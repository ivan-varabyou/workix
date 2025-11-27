// Load testing service interfaces

export interface LoadTestResult {
  summary: {
    duration: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    rps: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: {
    bytesReceived: number;
    bytesSent: number;
    bytesPerSecond: number;
  };
  errors: Array<{
    status: number;
    count: number;
    message: string;
  }>;
  bottlenecks: Array<{
    endpoint: string;
    avgLatency: number;
  }>;
}

export interface StressTestResult {
  breakPoint: {
    rps: number;
    errorRate: number;
    latency: number;
  };
  recommendations: string[];
}

export interface SpikeTestResult {
  recoveryTime: number;
  peakErrorRate: number;
  maxLatency: number;
  healthStatus: string;
}

export interface PerformanceMetrics {
  latency: {
    p95: number;
    [key: string]: number;
  };
  throughput: {
    rps: number;
    [key: string]: number;
  };
}

export interface PerformanceRegressionResult {
  hasRegression: boolean;
  regressions: string[];
  changeDetails: {
    latencyChange: string;
    throughputChange: string;
  };
}
