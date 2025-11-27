import { Injectable } from '@nestjs/common';

import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../../../core/src/interfaces/integration-provider.interface';
import {
  AmazonBulkUploadResult,
  AmazonCategoryStats,
  AmazonProductStats,
  AmazonSalesRank,
  AmazonSellerMetrics,
  AmazonUpdateResult,
  AmazonUploadResult,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

@Injectable()
export class AmazonAnalyticsProvider implements IntegrationProvider {
  id = 'amazon';
  name = 'Amazon';
  capabilities = [IntegrationCapability.ANALYTICS, IntegrationCapability.UPLOAD];

  supports(operation: string, capability: IntegrationCapability): boolean {
    if (capability === IntegrationCapability.ANALYTICS) {
      return ['getProductStats', 'getCategoryStats', 'getSellerMetrics', 'getSalesRank'].includes(
        operation
      );
    }
    if (capability === IntegrationCapability.UPLOAD) {
      return ['uploadProduct', 'updateProductInfo', 'bulkUpload', 'updateInventory'].includes(
        operation
      );
    }
    return false;
  }

  async execute<
    T =
      | AmazonProductStats
      | AmazonCategoryStats
      | AmazonSellerMetrics
      | AmazonSalesRank
      | AmazonUploadResult
      | AmazonUpdateResult
      | AmazonBulkUploadResult
  >(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data:
      | AmazonProductStats
      | AmazonCategoryStats
      | AmazonSellerMetrics
      | AmazonSalesRank
      | AmazonUploadResult
      | AmazonUpdateResult
      | AmazonBulkUploadResult;
    switch (request.operation) {
      case 'getProductStats':
        const productStats: AmazonProductStats = {
          asin: (typeof p.asin === 'string' ? p.asin : undefined) || `B${Date.now()}`,
          views: Math.floor(Math.random() * 5000000),
          sales: Math.floor(Math.random() * 50000),
          revenue: Math.floor(Math.random() * 5000000),
          rating: (Math.random() * 5).toFixed(2),
          reviews: Math.floor(Math.random() * 5000),
          salesRank: Math.floor(Math.random() * 100000),
        };
        if (typeof p.productId === 'string') {
          productStats.productId = p.productId;
        }
        data = productStats;
        break;
      case 'getCategoryStats':
        const categoryStats: AmazonCategoryStats = {
          totalProducts: Math.floor(Math.random() * 1000000),
          totalSales: Math.floor(Math.random() * 100000000),
          avgPrice: Math.floor(Math.random() * 10000),
          topSellers: [],
        };
        if (typeof p.category === 'string') {
          categoryStats.category = p.category;
        }
        data = categoryStats;
        break;
      case 'getSellerMetrics':
        const sellerMetrics: AmazonSellerMetrics = {
          totalSales: Math.floor(Math.random() * 10000000),
          orders: Math.floor(Math.random() * 100000),
          rating: (Math.random() * 5).toFixed(2),
          returnRate: (Math.random() * 5).toFixed(2),
          fulfillmentType: ['FBA', 'FBM'][Math.floor(Math.random() * 2)] as 'FBA' | 'FBM',
        };
        if (typeof p.sellerId === 'string') {
          sellerMetrics.sellerId = p.sellerId;
        }
        data = sellerMetrics;
        break;
      case 'getSalesRank':
        const salesRank: AmazonSalesRank = {
          rank: Math.floor(Math.random() * 100000),
          bestRank: Math.floor(Math.random() * 10000),
          rankChange: Math.floor(Math.random() * 10000) - 5000,
        };
        if (typeof p.asin === 'string') {
          salesRank.asin = p.asin;
        }
        if (typeof p.category === 'string') {
          salesRank.category = p.category;
        }
        data = salesRank;
        break;
      case 'uploadProduct':
        data = {
          productId: `amazon-${Date.now()}`,
          asin: `B${Date.now()}`,
          status: 'success',
          marketplace: (typeof p.marketplace === 'string' ? p.marketplace : undefined) || 'US',
        };
        break;
      case 'updateProductInfo':
        const updateResult: AmazonUpdateResult = {
          updated: true,
        };
        if (typeof p.productId === 'string') {
          updateResult.productId = p.productId;
        }
        if (typeof p.asin === 'string') {
          updateResult.asin = p.asin;
        }
        data = updateResult;
        break;
      case 'updateInventory':
        const inventoryUpdate: AmazonUpdateResult = {
          updated: true,
          fulfillmentType:
            (typeof p.fulfillmentType === 'string' ? p.fulfillmentType : undefined) || 'FBA',
        };
        if (typeof p.productId === 'string') {
          inventoryUpdate.productId = p.productId;
        }
        if (typeof p.quantity === 'number') {
          inventoryUpdate.quantity = p.quantity;
        }
        data = inventoryUpdate;
        break;
      case 'bulkUpload':
        const itemsValue = p.items;
        const itemsLength = Array.isArray(itemsValue) ? itemsValue.length : 0;
        data = {
          uploadedCount: itemsLength,
          failedCount: 0,
          marketplace: (typeof p.marketplace === 'string' ? p.marketplace : undefined) || 'US',
        };
        break;
      default:
        throw new Error(`Unknown operation: ${request.operation}`);
    }
    return {
      id: request.id || `amazon-${Date.now()}`,
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
