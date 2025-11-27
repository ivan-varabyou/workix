import { Injectable } from '@nestjs/common';

import { BasePayload } from '../../../core/src/interfaces/integration-payload.interface';
import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../core/src/interfaces/integration-provider.interface';

@Injectable()
export class InstagramAnalyticsProvider implements IntegrationProvider {
  id = 'instagram';
  name = 'Instagram';
  capabilities = [IntegrationCapability.ANALYTICS];

  supports(operation: string, capability: IntegrationCapability): boolean {
    if (capability !== IntegrationCapability.ANALYTICS) return false;
    return ['getPostStats', 'getProfileStats', 'getHashtagInsights'].includes(operation);
  }

  async execute<T = BasePayload>(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data: BasePayload;
    switch (request.operation) {
      case 'getPostStats':
        data = {
          postId: p.postId,
          likes: Math.floor(Math.random() * 100000),
          comments: Math.floor(Math.random() * 10000),
          shares: Math.floor(Math.random() * 5000),
          saves: Math.floor(Math.random() * 8000),
          impressions: Math.floor(Math.random() * 500000),
        };
        break;
      case 'getProfileStats':
        data = {
          followers: Math.floor(Math.random() * 5000000),
          following: Math.floor(Math.random() * 1000),
          postCount: Math.floor(Math.random() * 5000),
          engagementRate: (Math.random() * 10).toFixed(2),
        };
        break;
      case 'getHashtagInsights':
        data = {
          hashtag: p.hashtag,
          totalPosts: Math.floor(Math.random() * 10000000),
          recentPosts: Math.floor(Math.random() * 10000),
          topCountries: ['US', 'BR', 'IN'],
        };
        break;
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    return {
      id: request.id || `ig-analytics-${Date.now()}`,
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
