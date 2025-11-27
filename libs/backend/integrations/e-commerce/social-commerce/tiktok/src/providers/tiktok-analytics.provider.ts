import { Injectable } from '@nestjs/common';

import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../../../core/src/interfaces/integration-provider.interface';
import {
  TikTokAudienceInsights,
  TikTokChannelStats,
  TikTokVideoStats,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

@Injectable()
export class TikTokAnalyticsProvider implements IntegrationProvider {
  id = 'tiktok';
  name = 'TikTok';
  capabilities = [IntegrationCapability.ANALYTICS];

  supports(operation: string, capability: IntegrationCapability): boolean {
    if (capability !== IntegrationCapability.ANALYTICS) return false;
    return ['getVideoStats', 'getChannelStats', 'getAudienceInsights'].includes(operation);
  }

  async execute<T = TikTokVideoStats | TikTokChannelStats | TikTokAudienceInsights>(
    request: IntegrationRequest
  ): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data: TikTokVideoStats | TikTokChannelStats | TikTokAudienceInsights;
    switch (request.operation) {
      case 'getVideoStats': {
        const videoStats: TikTokVideoStats = {
          views: Math.floor(Math.random() * 1000000),
          likes: Math.floor(Math.random() * 100000),
          shares: Math.floor(Math.random() * 10000),
          comments: Math.floor(Math.random() * 5000),
        };
        if (typeof p.videoId === 'string') {
          videoStats.videoId = p.videoId;
        }
        data = videoStats;
        break;
      }
      case 'getChannelStats':
        data = {
          followers: Math.floor(Math.random() * 10000000),
          videoCount: Math.floor(Math.random() * 1000),
          totalViews: Math.floor(Math.random() * 100000000),
        };
        break;
      case 'getAudienceInsights':
        data = {
          topCountries: ['US', 'IN', 'BR'],
          ageGroups: { '13-24': 45, '25-34': 35, '35-44': 15, '45+': 5 },
          gender: { male: 48, female: 52 },
        };
        break;
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    return {
      id: request.id || `tt-analytics-${Date.now()}`,
      provider: this.id,
      operation: request.operation,
      data,
      timestamp: new Date(),
    } as IntegrationResponse<T>;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      capabilities: this.capabilities,
      status: 'active' as const,
    };
  }
}
