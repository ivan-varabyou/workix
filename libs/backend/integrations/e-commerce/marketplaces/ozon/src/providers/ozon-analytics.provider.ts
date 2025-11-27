import { Injectable } from '@nestjs/common';

import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../../../core/src/interfaces/integration-provider.interface';
import {
  OzonBulkUploadResult,
  OzonCategoryStats,
  OzonProductStats,
  OzonSellerMetrics,
  OzonUpdateResult,
  OzonUploadResult,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

@Injectable()
export class OzonAnalyticsProvider implements IntegrationProvider {
  id = 'ozon';
  name = 'Ozon';
  capabilities = [IntegrationCapability.ANALYTICS, IntegrationCapability.UPLOAD];

  supports(operation: string, capability: IntegrationCapability): boolean {
    if (capability === IntegrationCapability.ANALYTICS) {
      return ['getProductStats', 'getCategoryStats', 'getSellerMetrics'].includes(operation);
    }
    if (capability === IntegrationCapability.UPLOAD) {
      return ['uploadProduct', 'updateProductInfo', 'bulkUpload'].includes(operation);
    }
    return false;
  }

  async execute<
    T =
      | OzonProductStats
      | OzonCategoryStats
      | OzonSellerMetrics
      | OzonUploadResult
      | OzonUpdateResult
      | OzonBulkUploadResult
  >(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data:
      | OzonProductStats
      | OzonCategoryStats
      | OzonSellerMetrics
      | OzonUploadResult
      | OzonUpdateResult
      | OzonBulkUploadResult;
    switch (request.operation) {
      case 'getProductStats': {
        const productStats: OzonProductStats = {
          views: Math.floor(Math.random() * 500000),
          sales: Math.floor(Math.random() * 10000),
          revenue: Math.floor(Math.random() * 1000000),
          rating: (Math.random() * 5).toFixed(2),
          reviews: Math.floor(Math.random() * 1000),
        };
        if (typeof p.productId === 'string') {
          productStats.productId = p.productId;
        }
        data = productStats;
        break;
      }
      case 'getCategoryStats': {
        const categoryStats: OzonCategoryStats = {
          totalProducts: Math.floor(Math.random() * 100000),
          totalSales: Math.floor(Math.random() * 10000000),
          avgPrice: Math.floor(Math.random() * 5000),
        };
        if (typeof p.category === 'string') {
          categoryStats.category = p.category;
        }
        data = categoryStats;
        break;
      }
      case 'getSellerMetrics':
        data = {
          totalSales: Math.floor(Math.random() * 5000000),
          orders: Math.floor(Math.random() * 50000),
          rating: (Math.random() * 5).toFixed(2),
          cancellationRate: (Math.random() * 5).toFixed(2),
        };
        break;
      case 'uploadProduct':
        data = { productId: `ozon-${Date.now()}`, status: 'success' };
        break;
      case 'updateProductInfo': {
        const updateResult: OzonUpdateResult = {
          updated: true,
        };
        if (typeof p.productId === 'string') {
          updateResult.productId = p.productId;
        }
        data = updateResult;
        break;
      }
      case 'bulkUpload':
        const itemsValueOzon = p.items;
        const itemsLengthOzon = Array.isArray(itemsValueOzon) ? itemsValueOzon.length : 0;
        data = { uploadedCount: itemsLengthOzon, failedCount: 0 };
        break;
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    return {
      id: request.id || `ozon-${Date.now()}`,
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
