/**
 * eBay Marketplace API Types
 *
 * Полное покрытие типов для eBay Browse API и Trading API
 * Основано на официальной документации: https://developer.ebay.com/api-docs
 */

/**
 * eBay Listing Statistics
 * Статистика по объявлению
 */
export interface EbayListingStats {
  listingId?: string;
  itemId?: string;
  title?: string;
  views: number;
  watchers: number;
  sales: number;
  revenue: number;
  avgPrice: number;
  impressions?: number;
  clickThroughRate?: number;
  conversionRate?: number;
  currentPrice?: {
    value: number;
    currency: string;
  };
  startPrice?: {
    value: number;
    currency: string;
  };
  buyItNowPrice?: {
    value: number;
    currency: string;
  };
  listingType?: 'Auction' | 'FixedPrice' | 'StoreInventory';
  listingStatus?: 'Active' | 'Ended' | 'Completed' | 'Cancelled';
  categoryId?: string;
  categoryName?: string;
  [key: string]: unknown;
}

/**
 * eBay Seller Feedback
 * Отзывы продавца
 */
export interface EbaySellerFeedback {
  sellerId?: string;
  username?: string;
  positiveFeedback: number;
  neutralFeedback: number;
  negativeFeedback: number;
  rating: string;
  feedbackScore?: number;
  feedbackPercentage?: number;
  topRatedSeller?: boolean;
  [key: string]: unknown;
}

/**
 * eBay Market Metrics
 * Метрики рынка
 */
export interface EbayMarketMetrics {
  category?: string;
  categoryId?: string;
  categoryName?: string;
  totalListings: number;
  avgPrice: number;
  trend: string;
  minPrice?: number;
  maxPrice?: number;
  medianPrice?: number;
  activeListings?: number;
  soldListings?: number;
  avgTimeToSell?: number;
  [key: string]: unknown;
}

/**
 * eBay Listing Upload Result
 * Результат создания объявления
 */
export interface EbayUploadResult {
  listingId: string;
  itemId?: string;
  status: string;
  fees?: Array<{
    name: string;
    amount: {
      value: number;
      currency: string;
    };
  }>;
  warnings?: Array<{
    code: string;
    message: string;
  }>;
  errors?: Array<{
    code: string;
    message: string;
    parameter?: string;
  }>;
  [key: string]: unknown;
}

/**
 * eBay Listing Update Result
 * Результат обновления объявления
 */
export interface EbayUpdateResult {
  updated: boolean;
  listingId?: string;
  itemId?: string;
  warnings?: Array<{
    code: string;
    message: string;
  }>;
  errors?: Array<{
    code: string;
    message: string;
    parameter?: string;
  }>;
  [key: string]: unknown;
}

/**
 * eBay Bulk Upload Result
 * Результат массовой загрузки объявлений
 */
export interface EbayBulkUploadResult {
  uploadedCount: number;
  failedCount: number;
  taskId?: string;
  errors?: Array<{
    listingId?: string;
    itemId?: string;
    code: string;
    message: string;
  }>;
  warnings?: Array<{
    listingId?: string;
    itemId?: string;
    code: string;
    message: string;
  }>;
  [key: string]: unknown;
}

/**
 * eBay API Response Base
 * Базовый тип ответа API eBay
 */
export interface EbayApiResponse<T = unknown> {
  result?: T;
  errors?: Array<{
    errorId?: number;
    domain?: string;
    subdomain?: string;
    severity?: 'ERROR' | 'WARNING';
    category?: string;
    message?: string;
    parameters?: Array<{
      name: string;
      value: string;
    }>;
  }>;
  warnings?: Array<{
    errorId?: number;
    domain?: string;
    subdomain?: string;
    severity?: 'WARNING';
    category?: string;
    message?: string;
  }>;
  [key: string]: unknown;
}

/**
 * Type guards for eBay API responses
 */
export function isEbayListingStats(data: unknown): data is EbayListingStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.views === 'number' &&
    typeof obj.watchers === 'number' &&
    typeof obj.sales === 'number' &&
    typeof obj.revenue === 'number' &&
    typeof obj.avgPrice === 'number'
  );
}

export function isEbaySellerFeedback(data: unknown): data is EbaySellerFeedback {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.positiveFeedback === 'number' &&
    typeof obj.neutralFeedback === 'number' &&
    typeof obj.negativeFeedback === 'number' &&
    typeof obj.rating === 'string'
  );
}

export function isEbayMarketMetrics(data: unknown): data is EbayMarketMetrics {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.totalListings === 'number' &&
    typeof obj.avgPrice === 'number' &&
    typeof obj.trend === 'string'
  );
}

export function isEbayUploadResult(data: unknown): data is EbayUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.listingId === 'string' && typeof obj.status === 'string';
}

export function isEbayUpdateResult(data: unknown): data is EbayUpdateResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.updated === 'boolean';
}

export function isEbayBulkUploadResult(data: unknown): data is EbayBulkUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.uploadedCount === 'number' && typeof obj.failedCount === 'number';
}

export function isEbayApiResponse<T>(data: unknown): data is EbayApiResponse<T> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return 'result' in obj || 'errors' in obj || 'warnings' in obj;
}
