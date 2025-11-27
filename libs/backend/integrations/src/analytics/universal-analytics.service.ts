import { Injectable, Logger } from '@nestjs/common';

import { IntegrationCapability } from '../../core/src/interfaces/integration-provider.interface';
import { IntegrationRouter } from '../../core/src/router/integration.router';
import {
  AudienceMetric,
  RetentionDataPoint,
  VideoComparisonData,
  VideoStats,
} from './interfaces/analytics.interface';

@Injectable()
export class UniversalAnalyticsService {
  private readonly logger = new Logger(UniversalAnalyticsService.name);

  constructor(private router: IntegrationRouter) {}

  async analyzeVideoPerformance(providerOrder: string[], stats: VideoStats) {
    const startTime = Date.now();
    const requestId = `analyze-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Starting video performance analysis`, {
      providerOrder,
      videoId: stats?.videoId,
    });

    try {
      const result = await this.router.execute(
        {
          id: requestId,
          capability: IntegrationCapability.ANALYTICS,
          operation: 'analyzePerformance',
          payload: { stats },
        },
        providerOrder
      );

      const latencyMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Video performance analysis completed`, {
        provider: result.provider,
        latencyMs,
      });

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Video performance analysis failed`, {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });
      throw error;
    }
  }

  async analyzeRetention(providerOrder: string[], retentionData: RetentionDataPoint[]) {
    const startTime = Date.now();
    const requestId = `retention-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Starting retention analysis`, {
      providerOrder,
      dataPoints: retentionData.length,
    });

    try {
      const result = await this.router.execute(
        {
          id: requestId,
          capability: IntegrationCapability.ANALYTICS,
          operation: 'retentionCurve',
          payload: { retentionData },
        },
        providerOrder
      );

      const latencyMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Retention analysis completed`, {
        provider: result.provider,
        latencyMs,
      });

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Retention analysis failed`, {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });
      throw error;
    }
  }

  async predictPostingTime(providerOrder: string[], audienceMetrics: AudienceMetric[]) {
    const startTime = Date.now();
    const requestId = `predict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Starting posting time prediction`, {
      providerOrder,
      metrics: audienceMetrics.length,
    });

    try {
      const result = await this.router.execute(
        {
          id: requestId,
          capability: IntegrationCapability.ANALYTICS,
          operation: 'predictPostingTime',
          payload: { audienceMetrics },
        },
        providerOrder
      );

      const latencyMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Posting time prediction completed`, {
        provider: result.provider,
        latencyMs,
      });

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Posting time prediction failed`, {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });
      throw error;
    }
  }

  async compareVideos(
    providerOrder: string[],
    video1: VideoComparisonData,
    video2: VideoComparisonData
  ) {
    const startTime = Date.now();
    const requestId = `compare-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${requestId}] Starting video comparison`, {
      providerOrder,
      video1Id: video1?.videoId,
      video2Id: video2?.videoId,
    });

    try {
      const result = await this.router.execute(
        {
          id: requestId,
          capability: IntegrationCapability.ANALYTICS,
          operation: 'compareVideos',
          payload: { video1, video2 },
        },
        providerOrder
      );

      const latencyMs = Date.now() - startTime;
      this.logger.log(`[${requestId}] Video comparison completed`, {
        provider: result.provider,
        latencyMs,
      });

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.logger.error(`[${requestId}] Video comparison failed`, {
        error: error instanceof Error ? error.message : String(error),
        latencyMs,
      });
      throw error;
    }
  }
}
