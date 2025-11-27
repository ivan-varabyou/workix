import { Injectable } from '@nestjs/common';

import { BasePayload } from '../../../core/src/interfaces/integration-payload.interface';
import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../core/src/interfaces/integration-provider.interface';

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

  async execute<T = BasePayload>(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const p = request.payload || {};
    let data: BasePayload;
    switch (request.operation) {
      case 'getProductStats':
        data = {
          productId: p.productId,
          views: Math.floor(Math.random() * 1000000),
          sales: Math.floor(Math.random() * 20000),
          revenue: Math.floor(Math.random() * 2000000),
          rating: (Math.random() * 5).toFixed(2),
          reviews: Math.floor(Math.random() * 2000),
        };
        break;
      case 'getCategoryStats':
        data = {
          category: p.category,
          totalProducts: Math.floor(Math.random() * 200000),
          totalSales: Math.floor(Math.random() * 20000000),
          avgPrice: Math.floor(Math.random() * 8000),
        };
        break;
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
      case 'updateProductInfo':
        data = { updated: true, productId: p.productId };
        break;
      case 'bulkUpload':
        const itemsValue = p.items;
        const itemsLength = Array.isArray(itemsValue) ? itemsValue.length : 0;
        data = { uploadedCount: itemsLength, failedCount: 0 };
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
