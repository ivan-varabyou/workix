/**
 * Instagram Graph API Types
 *
 * Полное покрытие типов для Instagram Graph API
 * Основано на официальной документации Instagram Graph API
 */

import {
  InstagramHashtagInsights,
  InstagramPostStats,
  InstagramProfileStats,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

// Re-export types from shared analytics
export type { InstagramHashtagInsights, InstagramPostStats, InstagramProfileStats };

/**
 * Type guards for Instagram API responses
 */
export function isInstagramPostStats(data: unknown): data is InstagramPostStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.likes === 'number' &&
    typeof obj.comments === 'number' &&
    typeof obj.shares === 'number' &&
    typeof obj.saves === 'number' &&
    typeof obj.impressions === 'number'
  );
}

export function isInstagramProfileStats(data: unknown): data is InstagramProfileStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.followers === 'number' &&
    typeof obj.following === 'number' &&
    typeof obj.postCount === 'number' &&
    typeof obj.engagementRate === 'string'
  );
}

export function isInstagramHashtagInsights(data: unknown): data is InstagramHashtagInsights {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.totalPosts === 'number' &&
    typeof obj.recentPosts === 'number' &&
    Array.isArray(obj.topCountries)
  );
}
