// Integration Monitoring interfaces

import { BasePayload } from '@workix/integrations/core';

/**
 * Integration Event Metadata
 */
export interface IntegrationEventMetadata extends BasePayload {
  latencyMs?: number;
  cost?: number | string;
  error?: string;
  message?: string;
}

/**
 * Integration Event with Provider
 */
export interface IntegrationEventWithProvider {
  id: string;
  providerId: string;
  eventType: string;
  status: 'SUCCESS' | 'FAILED';
  error: string | null;
  metadata: IntegrationEventMetadata | null;
  createdAt: Date;
  updatedAt: Date;
  provider: {
    id: string;
    name: string;
  };
}

/**
 * Integration Provider with Events
 */
export interface IntegrationProviderWithEvents {
  id: string;
  name: string;
  type: string;
  config: BasePayload | null;
  credentials: BasePayload | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  events: Array<{
    id: string;
    providerId: string;
    eventType: string;
    status: 'SUCCESS' | 'FAILED';
    error: string | null;
    metadata: IntegrationEventMetadata | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

/**
 * Provider Health Status
 */
export interface ProviderHealthStatus {
  providerId: string;
  providerName: string;
  health: 'healthy' | 'degraded' | 'unhealthy';
  successRate: number;
  totalCalls: number;
  successful: number;
  failed: number;
  lastEvent: Date | null;
}

/**
 * Overall Health Response
 */
export interface OverallHealthResponse {
  overall: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    healthScore: number;
  };
  providers: ProviderHealthStatus[];
}

/**
 * Alert Thresholds
 */
export interface AlertThresholds {
  errorRate?: number; // 0-1, e.g., 0.1 = 10%
  latencyMs?: number; // milliseconds
  consecutiveFailures?: number;
}

/**
 * Alert
 */
export interface Alert {
  type: 'HIGH_ERROR_RATE' | 'HIGH_LATENCY' | 'CONSECUTIVE_FAILURES';
  severity: 'critical' | 'high' | 'medium';
  providerId: string;
  providerName: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

/**
 * Alerts Response
 */
export interface AlertsResponse {
  total: number;
  critical: number;
  high: number;
  medium: number;
  alerts: Alert[];
}

/**
 * Time Series Data Point
 */
export interface TimeSeriesDataPoint {
  timestamp: string;
  calls: number;
  successful: number;
  failed: number;
  avgLatency: number;
  totalCost: number;
}

/**
 * Provider Breakdown
 */
export interface ProviderBreakdown {
  providerId: string;
  providerName: string;
  calls: number;
  successful: number;
  failed: number;
  successRate: number;
  avgLatency: number;
  totalCost: number;
}

/**
 * Operation Breakdown
 */
export interface OperationBreakdown {
  operation: string;
  calls: number;
  successful: number;
  failed: number;
  successRate: number;
  avgLatency: number;
}

/**
 * Cost Analysis
 */
export interface CostAnalysis {
  total: number;
  byProvider: Array<{
    providerId: string;
    providerName: string;
    cost: number;
    calls: number;
    avgCostPerCall: number;
  }>;
}

/**
 * Error Analysis
 */
export interface ErrorAnalysis {
  total: number;
  byProvider: Array<{
    providerId: string;
    providerName: string;
    count: number;
    errors: Array<{
      timestamp: Date;
      error: string;
    }>;
  }>;
  recent: Array<{
    id: string;
    providerId: string;
    providerName: string;
    type: string;
    timestamp: Date;
    metadata: IntegrationEventMetadata | null;
  }>;
}

/**
 * Dashboard Data
 */
export interface DashboardData {
  period: {
    start: Date;
    end: Date;
    label: '1h' | '24h' | '7d' | '30d';
  };
  summary: {
    totalCalls: number;
    successful: number;
    failed: number;
    successRate: number;
    avgLatency: number;
    totalCost: number;
  };
  timeSeries: TimeSeriesDataPoint[];
  byProvider: ProviderBreakdown[];
  byOperation: OperationBreakdown[];
  costAnalysis: CostAnalysis;
  errorAnalysis: ErrorAnalysis;
}

/**
 * Интерфейс для метрик провайдера по стоимости
 */
export interface ProviderCostMetrics {
  providerId: string;
  providerName: string;
  cost: number;
  calls: number;
}

/**
 * Интерфейс для метрик ошибок провайдера
 */
export interface ProviderErrorMetrics {
  providerId: string;
  providerName: string;
  count: number;
  errors: Array<{ timestamp: Date; error: string }>;
}
