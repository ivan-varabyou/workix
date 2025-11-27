// Integration Request Payload interfaces

/**
 * Base payload interface for all integration requests
 */
export interface BasePayload {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | Record<string, string | number | boolean>
    | BasePayload
    | FileStream
    | BasePayload[]
    | undefined;
}

/**
 * Type guard to check if value is BasePayload
 */
export function isBasePayload(value: unknown): value is BasePayload {
  if (value === null || value === undefined) {
    return false;
  }
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof File)
  ) {
    return true;
  }
  return false;
}

/**
 * Analytics operation payloads
 */
export interface FetchMetricsPayload extends BasePayload {
  videoId?: string;
  channelId?: string;
  startDate?: string;
  endDate?: string;
  metrics?: string[];
}

export interface AnalyzePerformancePayload extends BasePayload {
  stats?: {
    videoId?: string;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    watchTimeMinutes?: number;
    subscribersGained?: number;
  };
  providerOrder?: string[];
}

export interface RetentionCurvePayload {
  retentionData?: Array<{
    timestamp: string;
    percentageWatched: number;
  }>;
  providerOrder?: string[];
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | Record<string, string | number | boolean>
    | BasePayload
    | FileStream
    | Array<{ timestamp: string; percentageWatched: number }>
    | undefined;
}

export interface PredictPostingTimePayload {
  audienceMetrics?: Array<{
    timestamp: string;
    reach: number;
    impressions: number;
    engagementRate: number;
  }>;
  providerOrder?: string[];
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | Record<string, string | number | boolean>
    | BasePayload
    | FileStream
    | Array<{ timestamp: string; reach: number; impressions: number; engagementRate: number }>
    | undefined;
}

export interface CompareVideosPayload extends BasePayload {
  video1?: {
    videoId: string;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  video2?: {
    videoId: string;
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  providerOrder?: string[];
}

/**
 * File stream type (Node.js Buffer or Blob)
 */
export type FileStream = Buffer | Blob | ArrayBuffer | Uint8Array;

/**
 * Upload operation payloads
 */
export interface UploadVideoPayload extends BasePayload {
  fileStream?: FileStream;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
    privacy?: string;
  };
}

export interface UploadThumbnailPayload extends BasePayload {
  videoId?: string;
  imageStream?: FileStream;
}

export interface UpdateVideoMetadataPayload extends BasePayload {
  videoId?: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    category?: string;
  };
}

/**
 * Content operation payloads
 */
export interface GetChannelInfoPayload extends BasePayload {
  forUsername?: string;
  channelId?: string;
}

export interface SearchVideosPayload extends BasePayload {
  query?: string;
  maxResults?: number;
  regionCode?: string;
}

export interface GetCommentsPayload extends BasePayload {
  videoId?: string;
  maxResults?: number;
  pageToken?: string;
}

/**
 * Sync operation payloads
 */
export interface SyncPayload extends BasePayload {
  since?: string;
  limit?: number;
  filters?: Record<string, string | number | boolean>;
}

/**
 * Generic request data interface
 */
export interface RequestData {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | Record<string, string | number | boolean>
    | FileStream
    | BasePayload
    | undefined;
}

/**
 * Request parameters interface
 */
export interface RequestParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}
