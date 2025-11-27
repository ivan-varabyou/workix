import { Injectable } from '@nestjs/common';

import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../../../core/src/interfaces/integration-provider.interface';
import {
  EbayBulkUploadResult,
  EbayListingStats,
  EbayMarketMetrics,
  EbaySellerFeedback,
  EbayUpdateResult,
  EbayUploadResult,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

@Injectable()
export class EbayAnalyticsProvider implements IntegrationProvider {
  id = 'ebay';
  name = 'eBay';
  capabilities = [IntegrationCapability.ANALYTICS, IntegrationCapability.UPLOAD];

  supports(operation: string, capability: IntegrationCapability): boolean {
    if (capability === IntegrationCapability.ANALYTICS) {
      return ['getListingStats', 'getSellerFeedback', 'getMarketMetrics'].includes(operation);
    }
    if (capability === IntegrationCapability.UPLOAD) {
      return ['uploadListing', 'updateListing', 'bulkUpload'].includes(operation);
    }
    return false;
  }

  async execute<
    T =
      | EbayListingStats
      | EbaySellerFeedback
      | EbayMarketMetrics
      | EbayUploadResult
      | EbayUpdateResult
      | EbayBulkUploadResult
  >(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data:
      | EbayListingStats
      | EbaySellerFeedback
      | EbayMarketMetrics
      | EbayUploadResult
      | EbayUpdateResult
      | EbayBulkUploadResult;
    switch (request.operation) {
      case 'getListingStats': {
        const listingStats: EbayListingStats = {
          views: Math.floor(Math.random() * 2000000),
          watchers: Math.floor(Math.random() * 50000),
          sales: Math.floor(Math.random() * 30000),
          revenue: Math.floor(Math.random() * 3000000),
          avgPrice: Math.floor(Math.random() * 500),
        };
        if (typeof p.listingId === 'string') {
          listingStats.listingId = p.listingId;
        }
        data = listingStats;
        break;
      }
      case 'getSellerFeedback':
        data = {
          positiveFeedback: Math.floor(Math.random() * 100000),
          neutralFeedback: Math.floor(Math.random() * 1000),
          negativeFeedback: Math.floor(Math.random() * 100),
          rating: (95 + Math.random() * 5).toFixed(2),
        };
        break;
      case 'getMarketMetrics': {
        const trendValue = ['up', 'down', 'stable'][Math.floor(Math.random() * 3)];
        const marketMetrics: EbayMarketMetrics = {
          totalListings: Math.floor(Math.random() * 500000),
          avgPrice: Math.floor(Math.random() * 1000),
          trend: trendValue as 'up' | 'down' | 'stable',
        };
        if (typeof p.category === 'string') {
          marketMetrics.category = p.category;
        }
        data = marketMetrics;
        break;
      }
      case 'uploadListing':
        data = { listingId: `ebay-${Date.now()}`, status: 'active' };
        break;
      case 'updateListing': {
        const updateResult: EbayUpdateResult = {
          updated: true,
        };
        if (typeof p.listingId === 'string') {
          updateResult.listingId = p.listingId;
        }
        data = updateResult;
        break;
      }
      case 'bulkUpload':
        const itemsValueEbay = p.items;
        const itemsLengthEbay = Array.isArray(itemsValueEbay) ? itemsValueEbay.length : 0;
        data = { uploadedCount: itemsLengthEbay, failedCount: 0 };
        break;
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    return {
      id: request.id || `ebay-${Date.now()}`,
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
