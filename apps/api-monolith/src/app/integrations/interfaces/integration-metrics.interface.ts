/**
 * Integration Metrics Interfaces
 * Интерфейсы для метрик интеграций
 */

/**
 * Интерфейс для часовой метрики
 */
export interface HourlyMetric {
  hour: string;
}

/**
 * Integration Event Error Response
 */
export interface IntegrationEventError {
  id: string;
  providerId: string;
  providerName: string;
  type: string;
  metadata: unknown;
  createdAt: Date;
}

export interface ProviderCostMetric {
  providerId: string;
  providerName: string;
  cost: number;
  calls: number;
}

/**
 * Интерфейс для метрик провайдера
 */
export interface ProviderMetrics {
  providerId: string;
  providerName: string;
  calls: number;
  successful: number;
  failed: number;
  avgLatency: number;
  totalCost: number;
}

/**
 * Интерфейс для метрик типа события
 */
export interface TypeMetrics {
  type: string;
  count: number;
  successful: number;
  failed: number;
}

/**
 * Интерфейс для часовых метрик
 */
export interface HourlyMetrics {
  hour: string;
  calls: number;
  successful: number;
  failed: number;
  avgLatency: number;
  totalCost: number;
}
