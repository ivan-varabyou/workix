import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/domain/auth';
import { PrismaService } from '@workix/infrastructure/prisma';

import {
  HourlyMetric,
  HourlyMetrics,
  IntegrationEventError,
  ProviderMetrics,
  TypeMetrics,
} from './interfaces/integration-metrics.interface';
import { IntegrationEventWithProvider } from './interfaces/integration-monitoring.interface';
import { getEventMetadata, mapPrismaEventToIntegrationEvent } from './utils/type-mappers';

@ApiTags('integrations')
@Controller('integrations/metrics')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class IntegrationMetricsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getOverallMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 86400000); // Last 24h
    const end = endDate ? new Date(endDate) : new Date();

    const prismaEvents = await this.prisma.integrationEvent.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        provider: true,
      },
    });

    const events: IntegrationEventWithProvider[] = prismaEvents.map(
      mapPrismaEventToIntegrationEvent
    );

    const totalCalls: number = events.length;
    const successful: number = events.filter((e) => e.status === 'SUCCESS').length;
    const failed: number = events.filter((e) => e.status === 'FAILED').length;
    const avgLatency: number =
      events
        .filter((e) => {
          const meta = getEventMetadata(e);
          return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
        })
        .reduce((sum: number, e) => {
          const meta = getEventMetadata(e);
          return sum + (meta?.latencyMs || 0);
        }, 0) /
      (events.filter((e) => {
        const meta = getEventMetadata(e);
        return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
      }).length || 1);
    const totalCost: number = events
      .filter((e) => {
        const meta = getEventMetadata(e);
        return meta?.cost !== null && meta?.cost !== undefined;
      })
      .reduce((sum: number, e) => {
        const meta = getEventMetadata(e);
        return sum + Number(meta?.cost || 0);
      }, 0);

    // Group by provider
    const byProvider = events.reduce<Record<string, ProviderMetrics>>((acc, e) => {
      const providerId = e.providerId;
      if (!acc[providerId]) {
        acc[providerId] = {
          providerId,
          providerName: e.provider.name,
          calls: 0,
          successful: 0,
          failed: 0,
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
    }, {});

    // Group by type
    const byType = events.reduce<Record<string, TypeMetrics>>((acc, e) => {
      const type: string = e.eventType;
      if (!acc[type]) {
        acc[type] = { type, count: 0, successful: 0, failed: 0 };
      }
      acc[type].count++;
      if (e.status === 'SUCCESS') acc[type].successful++;
      if (e.status === 'FAILED') acc[type].failed++;
      return acc;
    }, {});

    return {
      period: { start, end },
      summary: {
        totalCalls,
        successful,
        failed,
        successRate: totalCalls > 0 ? (successful / totalCalls) * 100 : 0,
        avgLatency: Math.round(avgLatency),
        totalCost: totalCost.toFixed(4),
      },
      byProvider: Object.values(byProvider),
      byType: Object.values(byType),
    };
  }

  @Get('provider/:providerId')
  async getProviderMetrics(
    @Param('providerId') providerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const prismaEvents = await this.prisma.integrationEvent.findMany({
      where: {
        providerId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        provider: true,
      },
    });

    const events: IntegrationEventWithProvider[] = prismaEvents.map(
      mapPrismaEventToIntegrationEvent
    );

    const totalCalls: number = events.length;
    const successful: number = events.filter((e) => e.status === 'SUCCESS').length;
    const failed: number = events.filter((e) => e.status === 'FAILED').length;
    const avgLatency: number =
      events
        .filter((e) => {
          const meta = getEventMetadata(e);
          return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
        })
        .reduce((sum: number, e) => {
          const meta = getEventMetadata(e);
          return sum + (meta?.latencyMs || 0);
        }, 0) /
      (events.filter((e) => {
        const meta = getEventMetadata(e);
        return meta?.latencyMs !== null && meta?.latencyMs !== undefined;
      }).length || 1);
    const totalCost: number = events
      .filter((e) => {
        const meta = getEventMetadata(e);
        return meta?.cost !== null && meta?.cost !== undefined;
      })
      .reduce((sum: number, e) => {
        const meta = getEventMetadata(e);
        return sum + Number(meta?.cost || 0);
      }, 0);

    // Hourly breakdown
    const hourly = events.reduce<Record<string, HourlyMetrics>>((acc, e) => {
      const hour = new Date(e.createdAt).toISOString().slice(0, 13) + ':00:00Z';
      if (!acc[hour]) {
        acc[hour] = {
          hour,
          calls: 0,
          successful: 0,
          failed: 0,
          avgLatency: 0,
          totalCost: 0,
        };
      }
      acc[hour].calls++;
      if (e.status === 'SUCCESS') acc[hour].successful++;
      if (e.status === 'FAILED') acc[hour].failed++;
      const meta = getEventMetadata(e);
      if (meta?.latencyMs !== null && meta?.latencyMs !== undefined) {
        acc[hour].avgLatency =
          (acc[hour].avgLatency * (acc[hour].calls - 1) + (meta.latencyMs || 0)) / acc[hour].calls;
      }
      if (meta?.cost !== null && meta?.cost !== undefined) {
        acc[hour].totalCost += Number(meta.cost || 0);
      }
      return acc;
    }, {});

    return {
      providerId,
      period: { start, end },
      summary: {
        totalCalls,
        successful,
        failed,
        successRate: totalCalls > 0 ? (successful / totalCalls) * 100 : 0,
        avgLatency: Math.round(avgLatency),
        totalCost: totalCost.toFixed(4),
      },
      hourly: Object.values(hourly).sort((a: HourlyMetric, b: HourlyMetric): number =>
        a.hour.localeCompare(b.hour)
      ),
    };
  }

  @Get('errors')
  async getRecentErrors(@Query('limit') limit = '50') {
    const events = await this.prisma.integrationEvent.findMany({
      where: {
        status: 'FAILED',
      },
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        provider: true,
      },
    });

    const errors: IntegrationEventError[] = events.map((e) => ({
      id: e.id,
      providerId: e.providerId,
      providerName: e.provider.name,
      type: e.eventType,
      metadata: e.metadata,
      createdAt: e.createdAt,
    }));

    return { errors };
  }
}
