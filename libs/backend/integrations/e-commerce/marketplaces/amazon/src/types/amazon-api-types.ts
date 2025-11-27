/**
 * Amazon Marketplace API Types
 *
 * Полное покрытие типов для Amazon Marketplace API
 * Основано на Amazon Selling Partner API
 */

import {
  AmazonBulkUploadResult,
  AmazonCategoryStats,
  AmazonProductStats,
  AmazonSalesRank,
  AmazonSellerMetrics,
  AmazonUpdateResult,
  AmazonUploadResult,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

// Re-export types from shared analytics
export type {
  AmazonBulkUploadResult,
  AmazonCategoryStats,
  AmazonProductStats,
  AmazonSalesRank,
  AmazonSellerMetrics,
  AmazonUpdateResult,
  AmazonUploadResult,
};

/**
 * Type guards for Amazon API responses
 */
export function isAmazonProductStats(data: unknown): data is AmazonProductStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.views === 'number' &&
    typeof obj.sales === 'number' &&
    typeof obj.revenue === 'number' &&
    typeof obj.rating === 'string' &&
    typeof obj.reviews === 'number'
  );
}

export function isAmazonCategoryStats(data: unknown): data is AmazonCategoryStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.totalProducts === 'number' &&
    typeof obj.totalSales === 'number' &&
    typeof obj.avgPrice === 'number'
  );
}

export function isAmazonSellerMetrics(data: unknown): data is AmazonSellerMetrics {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.totalSales === 'number' &&
    typeof obj.orders === 'number' &&
    typeof obj.rating === 'string' &&
    typeof obj.returnRate === 'string' &&
    typeof obj.fulfillmentType === 'string'
  );
}

export function isAmazonSalesRank(data: unknown): data is AmazonSalesRank {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.rank === 'number' &&
    typeof obj.bestRank === 'number' &&
    typeof obj.rankChange === 'number'
  );
}

export function isAmazonUploadResult(data: unknown): data is AmazonUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.productId === 'string' &&
    typeof obj.asin === 'string' &&
    typeof obj.status === 'string'
  );
}

export function isAmazonUpdateResult(data: unknown): data is AmazonUpdateResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.updated === 'boolean';
}

export function isAmazonBulkUploadResult(data: unknown): data is AmazonBulkUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.uploadedCount === 'number' && typeof obj.failedCount === 'number';
}
