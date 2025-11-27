/**
 * Ozon Marketplace API Types
 *
 * Полное покрытие типов для Ozon Seller API v2
 * Основано на официальной документации: https://docs.ozon.ru/api/seller/
 */

/**
 * Ozon Product Statistics
 * Статистика по товару
 */
export interface OzonProductStats {
  productId?: string;
  offerId?: string;
  sku?: number;
  views: number;
  sales: number;
  revenue: number;
  rating: string;
  reviews: number;
  clicks?: number;
  conversionRate?: number;
  avgOrderValue?: number;
  stock?: number;
  price?: number;
  oldPrice?: number;
  discount?: number;
  categoryId?: number;
  categoryName?: string;
  brand?: string;
  [key: string]: unknown;
}

/**
 * Ozon Category Statistics
 * Статистика по категории
 */
export interface OzonCategoryStats {
  category?: string;
  categoryId?: number;
  categoryName?: string;
  totalProducts: number;
  totalSales: number;
  avgPrice: number;
  totalRevenue?: number;
  topProducts?: Array<{
    productId: string;
    offerId?: string;
    name?: string;
    sales: number;
    revenue: number;
  }>;
  [key: string]: unknown;
}

/**
 * Ozon Seller Metrics
 * Метрики продавца
 */
export interface OzonSellerMetrics {
  sellerId?: string;
  totalSales: number;
  orders: number;
  rating: string;
  cancellationRate: string;
  returnRate?: string;
  fulfillmentRate?: string;
  avgDeliveryTime?: number;
  totalRevenue?: number;
  activeProducts?: number;
  totalProducts?: number;
  [key: string]: unknown;
}

/**
 * Ozon Product Upload Result
 * Результат загрузки товара
 */
export interface OzonUploadResult {
  productId: string;
  offerId?: string;
  sku?: number;
  status: string;
  taskId?: number;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  [key: string]: unknown;
}

/**
 * Ozon Product Update Result
 * Результат обновления товара
 */
export interface OzonUpdateResult {
  updated: boolean;
  productId?: string;
  offerId?: string;
  sku?: number;
  taskId?: number;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  [key: string]: unknown;
}

/**
 * Ozon Bulk Upload Result
 * Результат массовой загрузки товаров
 */
export interface OzonBulkUploadResult {
  uploadedCount: number;
  failedCount: number;
  taskId?: number;
  errors?: Array<{
    productId?: string;
    offerId?: string;
    code: string;
    message: string;
  }>;
  [key: string]: unknown;
}

/**
 * Ozon API Response Base
 * Базовый тип ответа API Ozon
 */
export interface OzonApiResponse<T = unknown> {
  result?: T;
  error?: {
    code: string;
    message: string;
    data?: unknown;
  };
  [key: string]: unknown;
}

/**
 * Type guards for Ozon API responses
 */
export function isOzonProductStats(data: unknown): data is OzonProductStats {
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

export function isOzonCategoryStats(data: unknown): data is OzonCategoryStats {
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

export function isOzonSellerMetrics(data: unknown): data is OzonSellerMetrics {
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

export function isOzonUploadResult(data: unknown): data is OzonUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.productId === 'string' && typeof obj.status === 'string';
}

export function isOzonUpdateResult(data: unknown): data is OzonUpdateResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.updated === 'boolean';
}

export function isOzonBulkUploadResult(data: unknown): data is OzonBulkUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.uploadedCount === 'number' && typeof obj.failedCount === 'number';
}

export function isOzonApiResponse<T>(data: unknown): data is OzonApiResponse<T> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return 'result' in obj || 'error' in obj;
}
