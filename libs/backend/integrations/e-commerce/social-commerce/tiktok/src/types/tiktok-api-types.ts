/**
 * TikTok Business API Types
 *
 * Полное покрытие типов для TikTok Business API
 * Основано на официальной документации TikTok Marketing API
 */

import {
  TikTokAudienceInsights,
  TikTokChannelStats,
  TikTokVideoStats,
} from '../../../../shared/analytics/src/interfaces/provider-data.interface';

// Re-export types from shared analytics
export type { TikTokAudienceInsights, TikTokChannelStats, TikTokVideoStats };

/**
 * Type guards for TikTok API responses
 */
export function isTikTokVideoStats(data: unknown): data is TikTokVideoStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.views === 'number' &&
    typeof obj.likes === 'number' &&
    typeof obj.shares === 'number' &&
    typeof obj.comments === 'number'
  );
}

export function isTikTokChannelStats(data: unknown): data is TikTokChannelStats {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.followers === 'number' &&
    typeof obj.videoCount === 'number' &&
    typeof obj.totalViews === 'number'
  );
}

export function isTikTokAudienceInsights(data: unknown): data is TikTokAudienceInsights {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    Array.isArray(obj.topCountries) &&
    typeof obj.ageGroups === 'object' &&
    obj.ageGroups !== null &&
    typeof obj.gender === 'object' &&
    obj.gender !== null
  );
}
