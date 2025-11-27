/**
 * YouTube API Types
 * Использует типы из googleapis библиотеки
 */

import type { youtube_v3 } from 'googleapis';

import { BasePayload } from '../../../../../core/src/interfaces/integration-payload.interface';

// Re-export типы из googleapis
export type YouTubeVideo = youtube_v3.Schema$Video;
export type YouTubeChannel = youtube_v3.Schema$Channel;
export type YouTubePlaylist = youtube_v3.Schema$Playlist;
export type YouTubePlaylistItem = youtube_v3.Schema$PlaylistItem;
export type YouTubeSearchResult = youtube_v3.Schema$SearchResult;
export type YouTubeCommentThread = youtube_v3.Schema$CommentThread;
export type YouTubeClient = youtube_v3.Youtube;

// Типы для метаданных загрузки
export interface VideoUploadMetadata {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
}

export interface VideoUpdateMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
}

// Типы для аналитики
export interface VideoMetrics extends BasePayload {
  videoId: string;
  views: number;
  watchTimeMinutes: number;
  likes: number;
  comments: number;
  shares: number;
  subscribers: number;
  ctr: number;
  avgViewDuration: number;
}

export interface RetentionDataPoint {
  second: number;
  percentage: number;
}

export interface AudienceMetric {
  hour: number;
  avgViews: number;
}

export interface RetentionAnalysisResult extends BasePayload {
  avgRetention: string;
  totalDropPoints: number;
  criticalPoints: Array<{ second: number; drop: number }>;
  recommendations: string[];
}

// Type guards
export function isVideoUploadMetadata(data: unknown): data is VideoUploadMetadata {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    (obj.tags === undefined || Array.isArray(obj.tags)) &&
    (obj.categoryId === undefined || typeof obj.categoryId === 'string') &&
    (obj.privacyStatus === undefined ||
      (typeof obj.privacyStatus === 'string' &&
        ['public', 'unlisted', 'private'].includes(obj.privacyStatus)))
  );
}

export function isVideoUpdateMetadata(data: unknown): data is VideoUpdateMetadata {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    (obj.title === undefined || typeof obj.title === 'string') &&
    (obj.description === undefined || typeof obj.description === 'string') &&
    (obj.tags === undefined || Array.isArray(obj.tags)) &&
    (obj.categoryId === undefined || typeof obj.categoryId === 'string')
  );
}

export function isVideoMetrics(data: unknown): data is VideoMetrics {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.videoId === 'string' &&
    typeof obj.views === 'number' &&
    typeof obj.watchTimeMinutes === 'number' &&
    typeof obj.likes === 'number' &&
    typeof obj.comments === 'number' &&
    typeof obj.shares === 'number' &&
    typeof obj.subscribers === 'number' &&
    typeof obj.ctr === 'number' &&
    typeof obj.avgViewDuration === 'number'
  );
}

export function isRetentionDataPoint(data: unknown): data is RetentionDataPoint {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.second === 'number' && typeof obj.percentage === 'number';
}

export function isAudienceMetric(data: unknown): data is AudienceMetric {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.hour === 'number' && typeof obj.avgViews === 'number';
}
