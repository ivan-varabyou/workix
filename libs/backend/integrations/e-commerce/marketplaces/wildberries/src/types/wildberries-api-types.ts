/**
 * Wildberries Marketplace API Types
 *
 * Полное покрытие типов для Wildberries Seller API
 * Основано на официальной документации Wildberries Seller API v1
 */

import {
  WildberriesBulkUploadResult,
  WildberriesCategoryStats,
  WildberriesProductStats,
  WildberriesSellerMetrics,
  WildberriesUpdateResult,
  WildberriesUploadResult,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

// Re-export types from shared analytics
export type {
  WildberriesBulkUploadResult,
  WildberriesCategoryStats,
  WildberriesProductStats,
  WildberriesSellerMetrics,
  WildberriesUpdateResult,
  WildberriesUploadResult,
};

/**
 * Type guards for Wildberries API responses
 */
export function isWildberriesProductStats(data: unknown): data is WildberriesProductStats {
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

export function isWildberriesCategoryStats(data: unknown): data is WildberriesCategoryStats {
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

export function isWildberriesSellerMetrics(data: unknown): data is WildberriesSellerMetrics {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.totalSales === 'number' &&
    typeof obj.orders === 'number' &&
    typeof obj.rating === 'string' &&
    typeof obj.cancellationRate === 'string'
  );
}

export function isWildberriesUploadResult(data: unknown): data is WildberriesUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.productId === 'string' && typeof obj.status === 'string';
}

export function isWildberriesUpdateResult(data: unknown): data is WildberriesUpdateResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.updated === 'boolean';
}

export function isWildberriesBulkUploadResult(data: unknown): data is WildberriesBulkUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.uploadedCount === 'number' && typeof obj.failedCount === 'number';
}
