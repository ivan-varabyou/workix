// Main Service
export * from './services/ab-testing.service';
export * from './services/analytics-collection.service';

// Types and Interfaces
export * from './interfaces/ab-testing.interface';
export type {
  AggregatedMetrics,
  MetricsCollectionResult,
  PerformanceMetric,
} from './services/analytics-collection.service';
