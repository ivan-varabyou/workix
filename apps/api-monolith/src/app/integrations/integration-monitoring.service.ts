import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@workix/infrastructure/prisma';
import { BasePayload } from '@workix/integrations/core';

import { ProviderCostMetric } from './interfaces/integration-metrics.interface';
import {
  Alert,
  AlertsResponse,
  AlertThresholds,
  CostAnalysis,
  DashboardData,
  ErrorAnalysis,
  IntegrationEventWithProvider,
  IntegrationProviderWithEvents,
  OperationBreakdown,
  OverallHealthResponse,
  ProviderBreakdown,
  ProviderCostMetrics,
  ProviderErrorMetrics,
  ProviderHealthStatus,
  TimeSeriesDataPoint,
} from './interfaces/integration-monitoring.interface';
import { PrismaProviderForMapping } from './interfaces/type-mappers.interface';
import {
  basePayloadToJsonValue,
  getEventMetadata,
  mapPrismaEventToIntegrationEvent,
  mapPrismaProviderToProviderWithEvents,
} from './utils/type-mappers';

@Injectable()
export class IntegrationMonitoringService {
  private readonly logger = new Logger(IntegrationMonitoringService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get overall health status of all providers
   */
  async getOverallHealth(): Promise<OverallHealthResponse> {
    const prismaProviders = await this.prisma.integrationProvider.findMany({
      include: {
        events: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const providers: IntegrationProviderWithEvents[] = prismaProviders.map((prismaProvider) => {
      // Transform Prisma data to PrismaProviderForMapping format
      const providerForMapping: PrismaProviderForMapping = {
        id: prismaProvider.id,
        name: prismaProvider.name,
        type: prismaProvider.type,
        config: prismaProvider.config,
        credentials: prismaProvider.credentials,
        isActive: prismaProvider.isActive,
        createdAt: prismaProvider.createdAt,
        updatedAt: prismaProvider.updatedAt,
        events: prismaProvider.events.map((event) => ({
          id: event.id,
          providerId: event.providerId,
          eventType: event.eventType,
          status: event.status,
          error: event.error,
          metadata: event.metadata,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })),
      };
      return mapPrismaProviderToProviderWithEvents(providerForMapping);
    });

    const healthStatus: ProviderHealthStatus[] = providers.map((provider) => {
      const recentEvents = provider.events;
      const lastHour = recentEvents.filter((e) => e.createdAt >= new Date(Date.now() - 3600000));

      const successCount = lastHour.filter((e) => e.status === 'SUCCESS').length;
      const failedCount = lastHour.filter((e) => e.status === 'FAILED').length;
      const totalCount = lastHour.length;

      let health: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (totalCount > 0) {
        const successRate = successCount / totalCount;
        if (successRate < 0.5) {
          health = 'unhealthy';
        } else if (successRate < 0.8 || failedCount > 5) {
          health = 'degraded';
        }
      }

      // Update provider health status in config JSON field
      const config: BasePayload = provider.config || {};
      config.healthStatus = health.toUpperCase();
      const configValue = basePayloadToJsonValue(config);
      const updateData: {
        config: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
      } = {
        config: configValue ?? Prisma.DbNull,
      };
      this.prisma.integrationProvider
        .update({
          where: { id: provider.id },
          data: updateData,
        })
        .catch((err: unknown) => this.logger.error(`Failed to update health for ${provider.name}:`, err));

      return {
        providerId: provider.id,
        providerName: provider.name,
        health,
        successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 100,
        totalCalls: totalCount,
        successful: successCount,
        failed: failedCount,
        lastEvent: recentEvents[0]?.createdAt || null,
      };
    });

    const healthyCount = healthStatus.filter((h) => h.health === 'healthy').length;
    const degradedCount = healthStatus.filter((h) => h.health === 'degraded').length;
    const unhealthyCount = healthStatus.filter((h) => h.health === 'unhealthy').length;

    return {
      overall: {
        total: providers.length,
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount,
        healthScore: providers.length > 0 ? (healthyCount / providers.length) * 100 : 100,
      },
      providers: healthStatus,
    };
  }

  /**
   * Get alerts for integration events
   */
  async getAlerts(thresholds: AlertThresholds = {}): Promise<AlertsResponse> {
    const { errorRate = 0.1, latencyMs = 5000, consecutiveFailures = 5 } = thresholds;

    const prismaProviders = await this.prisma.integrationProvider.findMany({
      include: {
        events: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const providers: IntegrationProviderWithEvents[] = prismaProviders.map((prismaProvider) => {
      // Transform Prisma data to PrismaProviderForMapping format
      const providerForMapping: PrismaProviderForMapping = {
        id: prismaProvider.id,
        name: prismaProvider.name,
        type: prismaProvider.type,
        config: prismaProvider.config,
        credentials: prismaProvider.credentials,
        isActive: prismaProvider.isActive,
        createdAt: prismaProvider.createdAt,
        updatedAt: prismaProvider.updatedAt,
        events: prismaProvider.events.map((event) => ({
          id: event.id,
          providerId: event.providerId,
          eventType: event.eventType,
          status: event.status,
          error: event.error,
          metadata: event.metadata,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })),
      };
      return mapPrismaProviderToProviderWithEvents(providerForMapping);
    });

    const alerts: Alert[] = [];

    for (const provider of providers) {
      const recentEvents = provider.events;
      if (recentEvents.length === 0) continue;

      const lastHour = recentEvents.filter((e) => e.createdAt >= new Date(Date.now() - 3600000));

      // Check error rate
      const failedCount = lastHour.filter((e) => e.status === 'FAILED').length;
      const errorRateActual = lastHour.length > 0 ? failedCount / lastHour.length : 0;
      if (errorRateActual > errorRate) {
        alerts.push({
          type: 'HIGH_ERROR_RATE',
          severity: 'high',
          providerId: provider.id,
          providerName: provider.name,
          message: `Error rate ${(errorRateActual * 100).toFixed(1)}% exceeds threshold ${(
            errorRate * 100
          ).toFixed(1)}%`,
          value: errorRateActual,
          threshold: errorRate,
          timestamp: new Date(),
        });
      }

      // Check latency
      const avgLatency: number =
        lastHour
          .filter((e) => {
            const meta = getEventMetadata(e);
            return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
          })
          .reduce((sum: number, e) => {
            const meta = getEventMetadata(e);
            return sum + (meta?.latencyMs || 0);
          }, 0) /
        (lastHour.filter((e) => {
          const meta = getEventMetadata(e);
          return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
        }).length || 1);
      if (avgLatency > latencyMs) {
        alerts.push({
          type: 'HIGH_LATENCY',
          severity: 'medium',
          providerId: provider.id,
          providerName: provider.name,
          message: `Average latency ${Math.round(avgLatency)}ms exceeds threshold ${latencyMs}ms`,
          value: avgLatency,
          threshold: latencyMs,
          timestamp: new Date(),
        });
      }

      // Check consecutive failures
      let consecutiveFailuresCount = 0;
      for (const event of recentEvents.slice(0, consecutiveFailures)) {
        if (event.status === 'FAILED') {
          consecutiveFailuresCount++;
        } else {
          break;
        }
      }
      if (consecutiveFailuresCount >= consecutiveFailures) {
        alerts.push({
          type: 'CONSECUTIVE_FAILURES',
          severity: 'critical',
          providerId: provider.id,
          providerName: provider.name,
          message: `${consecutiveFailuresCount} consecutive failures detected`,
          value: consecutiveFailuresCount,
          threshold: consecutiveFailures,
          timestamp: new Date(),
        });
      }
    }

    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      alerts: alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
    };
  }

  /**
   * Get dashboard data for integration metrics
   */
  async getDashboardData(period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<DashboardData> {
    const periodMs = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
    }[period];

    const startDate = new Date(Date.now() - periodMs);
    const endDate = new Date();

    const prismaEvents = await this.prisma.integrationEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        provider: true,
      },
    });

    const events: IntegrationEventWithProvider[] = prismaEvents.map(
      mapPrismaEventToIntegrationEvent
    );

    // Time series data (hourly or daily depending on period)
    const interval = period === '1h' ? 60000 : period === '24h' ? 3600000 : 86400000; // 1min, 1h, or 1d
    const timeSeries = this.generateTimeSeries(startDate, endDate, interval, events);

    // Provider breakdown
    const byProvider = this.groupByProvider(events);

    // Operation breakdown
    const byOperation = this.groupByOperation(events);

    // Cost analysis
    const costAnalysis = this.analyzeCosts(events);

    // Error analysis
    const errorAnalysis = this.analyzeErrors(events);

    return {
      period: { start: startDate, end: endDate, label: period },
      summary: {
        totalCalls: events.length,
        successful: events.filter((e) => e.status === 'SUCCESS').length,
        failed: events.filter((e) => e.status === 'FAILED').length,
        successRate:
          events.length > 0
            ? (events.filter((e) => e.status === 'SUCCESS').length / events.length) * 100
            : 0,
        avgLatency:
          events
            .filter((e: IntegrationEventWithProvider) => {
              const meta = getEventMetadata(e);
              return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
            })
            .reduce((sum: number, e: IntegrationEventWithProvider) => {
              const meta = getEventMetadata(e);
              return sum + (meta?.latencyMs || 0);
            }, 0) /
          (events.filter((e: IntegrationEventWithProvider) => {
            const meta = getEventMetadata(e);
            return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
          }).length || 1),
        totalCost: events
          .filter((e: IntegrationEventWithProvider) => {
            const meta = getEventMetadata(e);
            return meta?.cost !== null && meta?.cost !== undefined;
          })
          .reduce((sum: number, e: IntegrationEventWithProvider) => {
            const meta = getEventMetadata(e);
            return sum + Number(meta?.cost || 0);
          }, 0),
      },
      timeSeries,
      byProvider,
      byOperation,
      costAnalysis,
      errorAnalysis,
    };
  }

  /**
   * Generate time series data
   */
  private generateTimeSeries(
    startDate: Date,
    endDate: Date,
    interval: number,
    events: IntegrationEventWithProvider[]
  ): TimeSeriesDataPoint[] {
    const series: TimeSeriesDataPoint[] = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const next = new Date(current.getTime() + interval);
      const periodEvents = events.filter((e) => e.createdAt >= current && e.createdAt < next);

      series.push({
        timestamp: current.toISOString(),
        calls: periodEvents.length,
        successful: periodEvents.filter((e) => e.status === 'SUCCESS').length,
        failed: periodEvents.filter((e) => e.status === 'FAILED').length,
        avgLatency:
          periodEvents
            .filter((e: IntegrationEventWithProvider) => {
              const meta = getEventMetadata(e);
              return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
            })
            .reduce((sum: number, e: IntegrationEventWithProvider) => {
              const meta = getEventMetadata(e);
              return sum + (meta?.latencyMs || 0);
            }, 0) /
          (periodEvents.filter((e: IntegrationEventWithProvider) => {
            const meta = getEventMetadata(e);
            return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
          }).length || 1),
        totalCost: periodEvents
          .filter((e: IntegrationEventWithProvider) => {
            const meta = getEventMetadata(e);
            return meta?.cost !== null && meta?.cost !== undefined;
          })
          .reduce((sum: number, e: IntegrationEventWithProvider) => {
            const meta = getEventMetadata(e);
            return sum + Number(meta?.cost || 0);
          }, 0),
      });

      current = next;
    }

    return series;
  }

  /**
   * Group events by provider
   */
  private groupByProvider(events: IntegrationEventWithProvider[]): ProviderBreakdown[] {
    const grouped = events.reduce<Record<string, ProviderBreakdown>>(
      (acc, e: IntegrationEventWithProvider) => {
        const providerId = e.providerId;
        if (!acc[providerId]) {
          acc[providerId] = {
            providerId,
            providerName: e.provider.name,
            calls: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
            avgLatency: 0,
            totalCost: 0,
          };
        }
        acc[providerId].calls++;
        if (e.status === 'SUCCESS') acc[providerId].successful++;
        if (e.status === 'FAILED') acc[providerId].failed++;
        const meta = getEventMetadata(e);
        if (meta?.latencyMs !== null && meta?.latencyMs !== undefined) {
          acc[providerId].avgLatency =
            (acc[providerId].avgLatency * (acc[providerId].calls - 1) + (meta.latencyMs || 0)) /
            acc[providerId].calls;
        }
        if (meta?.cost !== null && meta?.cost !== undefined) {
          acc[providerId].totalCost += Number(meta.cost || 0);
        }
        return acc;
      },
      {}
    );

    return Object.values(grouped).map((p: ProviderBreakdown) => ({
      ...p,
      successRate: p.calls > 0 ? (p.successful / p.calls) * 100 : 0,
      avgLatency: Math.round(p.avgLatency),
    }));
  }

  /**
   * Group events by operation
   */
  private groupByOperation(events: IntegrationEventWithProvider[]): OperationBreakdown[] {
    const grouped = events.reduce<Record<string, OperationBreakdown>>(
      (acc, e: IntegrationEventWithProvider) => {
        const operation = e.eventType || 'UNKNOWN';
        if (!acc[operation]) {
          acc[operation] = {
            operation,
            calls: 0,
            successful: 0,
            failed: 0,
            successRate: 0,
            avgLatency: 0,
          };
        }
        acc[operation].calls++;
        if (e.status === 'SUCCESS') acc[operation].successful++;
        if (e.status === 'FAILED') acc[operation].failed++;
        const meta = getEventMetadata(e);
        if (meta?.latencyMs !== null && meta?.latencyMs !== undefined) {
          acc[operation].avgLatency =
            (acc[operation].avgLatency * (acc[operation].calls - 1) + (meta.latencyMs || 0)) /
            acc[operation].calls;
        }
        return acc;
      },
      {}
    );

    return Object.values(grouped).map((o: OperationBreakdown) => ({
      ...o,
      successRate: o.calls > 0 ? (o.successful / o.calls) * 100 : 0,
      avgLatency: Math.round(o.avgLatency),
    }));
  }

  /**
   * Analyze costs
   */
  private analyzeCosts(events: IntegrationEventWithProvider[]): CostAnalysis {
    const totalCost: number = events
      .filter((e) => {
        const meta = getEventMetadata(e);
        return meta?.cost !== null && meta?.cost !== undefined;
      })
      .reduce((sum: number, e) => {
        const meta = getEventMetadata(e);
        return sum + Number(meta?.cost || 0);
      }, 0);

    const byProvider = events
      .filter((e) => {
        const meta = getEventMetadata(e);
        return meta?.cost !== null && meta?.cost !== undefined;
      })
      .reduce<Record<string, ProviderCostMetrics>>((acc, e) => {
        const providerId = e.providerId;
        if (!acc[providerId]) {
          acc[providerId] = {
            providerId,
            providerName: e.provider.name,
            cost: 0,
            calls: 0,
          };
        }
        const meta = getEventMetadata(e);
        acc[providerId].cost += Number(meta?.cost || 0);
        acc[providerId].calls++;
        return acc;
      }, {});

    return {
      total: totalCost,
      byProvider: Object.values(byProvider).map(
        (p: ProviderCostMetric): ProviderCostMetric & { avgCostPerCall: number } => ({
          ...p,
          avgCostPerCall: p.calls > 0 ? (p.cost || 0) / p.calls : 0,
        })
      ),
    };
  }

  /**
   * Analyze errors
   */
  private analyzeErrors(events: IntegrationEventWithProvider[]): ErrorAnalysis {
    const failedEvents: IntegrationEventWithProvider[] = events.filter(
      (e) => e.status === 'FAILED'
    );

    const byProvider = failedEvents.reduce<Record<string, ProviderErrorMetrics>>((acc, e) => {
      const providerId = e.providerId;
      if (!acc[providerId]) {
        acc[providerId] = {
          providerId,
          providerName: e.provider.name,
          count: 0,
          errors: [],
        };
      }
      acc[providerId].count++;
      const meta = getEventMetadata(e);
      if (meta) {
        const errorMsg: string = meta.error || meta.message || 'Unknown error';
        acc[providerId].errors.push({
          timestamp: e.createdAt,
          error: errorMsg,
        });
      }
      return acc;
    }, {});

    return {
      total: failedEvents.length,
      byProvider: Object.values(byProvider),
      recent: failedEvents.slice(0, 10).map((e) => ({
        id: e.id,
        providerId: e.providerId,
        providerName: e.provider.name,
        type: e.eventType,
        timestamp: e.createdAt,
        metadata: e.metadata,
      })),
    };
  }

  /**
   * Periodic health check (can be called manually or via cron job)
   */
  async periodicHealthCheck(): Promise<void> {
    this.logger.log('Running periodic health check for integration providers');
    try {
      await this.getOverallHealth();
      const alerts = await this.getAlerts();

      if (alerts.total > 0) {
        this.logger.warn(
          `Health check found ${alerts.total} alerts: ${alerts.critical} critical, ${alerts.high} high, ${alerts.medium} medium`
        );
      } else {
        this.logger.log('Health check passed: all providers healthy');
      }
    } catch (error) {
      this.logger.error('Health check failed:', error);
    }
  }
}
