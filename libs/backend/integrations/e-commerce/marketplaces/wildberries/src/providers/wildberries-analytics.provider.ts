import { Injectable } from '@nestjs/common';

import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../../../core/src/interfaces/integration-provider.interface';
import {
  WildberriesBulkUploadResult,
  WildberriesCategoryStats,
  WildberriesProductStats,
  WildberriesSellerMetrics,
  WildberriesUpdateResult,
  WildberriesUploadResult,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

@Injectable()
export class WildberriesAnalyticsProvider implements IntegrationProvider {
  id = 'wildberries';
  name = 'Wildberries';
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
      | WildberriesProductStats
      | WildberriesCategoryStats
      | WildberriesSellerMetrics
      | WildberriesUploadResult
      | WildberriesUpdateResult
      | WildberriesBulkUploadResult
  >(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data:
      | WildberriesProductStats
      | WildberriesCategoryStats
      | WildberriesSellerMetrics
      | WildberriesUploadResult
      | WildberriesUpdateResult
      | WildberriesBulkUploadResult;
    switch (request.operation) {
      case 'getProductStats': {
        const productStats: WildberriesProductStats = {
          views: Math.floor(Math.random() * 1000000),
          sales: Math.floor(Math.random() * 20000),
          revenue: Math.floor(Math.random() * 2000000),
          rating: (Math.random() * 5).toFixed(2),
          reviews: Math.floor(Math.random() * 2000),
        };
        if (typeof p.productId === 'string') {
          productStats.productId = p.productId;
        }
        data = productStats;
        break;
      }
      case 'getCategoryStats': {
        const categoryStats: WildberriesCategoryStats = {
          totalProducts: Math.floor(Math.random() * 200000),
          totalSales: Math.floor(Math.random() * 20000000),
          avgPrice: Math.floor(Math.random() * 8000),
        };
        if (typeof p.category === 'string') {
          categoryStats.category = p.category;
        }
        data = categoryStats;
        break;
      }
      case 'getSellerMetrics':
        data = {
          totalSales: Math.floor(Math.random() * 10000000),
          orders: Math.floor(Math.random() * 100000),
          rating: (Math.random() * 5).toFixed(2),
          returnRate: (Math.random() * 3).toFixed(2),
        };
        break;
      case 'uploadProduct':
        data = { productId: `wb-${Date.now()}`, status: 'success' };
        break;
      case 'updateProductInfo': {
        const updateResult: WildberriesUpdateResult = {
          updated: true,
        };
        if (typeof p.productId === 'string') {
          updateResult.productId = p.productId;
        }
        data = updateResult;
        break;
      }
      case 'bulkUpload':
        const itemsValueWb = p.items;
        const itemsLengthWb = Array.isArray(itemsValueWb) ? itemsValueWb.length : 0;
        data = { uploadedCount: itemsLengthWb, failedCount: 0 };
        break;
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    return {
      id: request.id || `wb-${Date.now()}`,
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
