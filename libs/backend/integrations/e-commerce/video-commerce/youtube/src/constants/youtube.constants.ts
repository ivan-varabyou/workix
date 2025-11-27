import { IntegrationCapability } from '../../../../../core/src/interfaces/integration-provider.interface';

export const YOUTUBE_PROVIDER_ID = 'youtube';
export const YOUTUBE_PROVIDER_NAME = 'YouTube';

export const YOUTUBE_PROVIDER_STATUS: 'active' | 'inactive' | 'beta' | 'deprecated' = 'active';

export const YOUTUBE_OPERATIONS = {
  ANALYTICS: {
    FETCH_METRICS: 'fetchMetrics',
    ANALYZE_PERFORMANCE: 'analyzePerformance',
    RETENTION_CURVE: 'retentionCurve',
    PREDICT_POSTING_TIME: 'predictPostingTime',
    COMPARE_VIDEOS: 'compareVideos',
  },
  UPLOAD: {
    UPLOAD_VIDEO: 'uploadVideo',
    UPLOAD_THUMBNAIL: 'uploadThumbnail',
    UPDATE_METADATA: 'updateMetadata',
  },
  CONTENT: {
    GET_CHANNEL_INFO: 'getChannelInfo',
    SEARCH_VIDEOS: 'searchVideos',
    GET_TRENDING: 'getTrending',
  },
  COMMENTS: {
    GET_COMMENTS: 'getComments',
  },
  LIVE: {
    SCHEDULE_LIVE: 'scheduleLive',
  },
} as const;

export const YOUTUBE_CAPABILITY_OPERATIONS: Record<IntegrationCapability, readonly string[]> = {
  [IntegrationCapability.ANALYTICS]: [
    YOUTUBE_OPERATIONS.ANALYTICS.FETCH_METRICS,
    YOUTUBE_OPERATIONS.ANALYTICS.ANALYZE_PERFORMANCE,
    YOUTUBE_OPERATIONS.ANALYTICS.RETENTION_CURVE,
    YOUTUBE_OPERATIONS.ANALYTICS.PREDICT_POSTING_TIME,
    YOUTUBE_OPERATIONS.ANALYTICS.COMPARE_VIDEOS,
  ],
  [IntegrationCapability.UPLOAD]: [
    YOUTUBE_OPERATIONS.UPLOAD.UPLOAD_VIDEO,
    YOUTUBE_OPERATIONS.UPLOAD.UPLOAD_THUMBNAIL,
    YOUTUBE_OPERATIONS.UPLOAD.UPDATE_METADATA,
  ],
  [IntegrationCapability.CONTENT]: [
    YOUTUBE_OPERATIONS.CONTENT.GET_CHANNEL_INFO,
    YOUTUBE_OPERATIONS.CONTENT.SEARCH_VIDEOS,
    YOUTUBE_OPERATIONS.CONTENT.GET_TRENDING,
  ],
  [IntegrationCapability.COMMENTS]: [YOUTUBE_OPERATIONS.COMMENTS.GET_COMMENTS],
  [IntegrationCapability.LIVE]: [YOUTUBE_OPERATIONS.LIVE.SCHEDULE_LIVE],
} as const;

export const YOUTUBE_ERROR_MESSAGES = {
  INVALID_VIDEO_METRICS: 'Invalid video metrics: required fields missing',
  INVALID_RETENTION_DATA:
    'Invalid retention data: array required with at least one valid data point',
  INVALID_AUDIENCE_METRICS:
    'Invalid audience metrics: array required with at least one valid data point',
  INVALID_VIDEO_METRICS_COMPARE:
    'Invalid video metrics: both video1 and video2 must be valid VideoMetrics',
  INVALID_FILESTREAM: 'Invalid fileStream: must be a valid FileStream',
  INVALID_METADATA_UPLOAD: 'Invalid metadata: must be a valid VideoUploadMetadata',
  INVALID_VIDEO_ID: 'Invalid videoId: must be a string',
  INVALID_IMAGESTREAM: 'Invalid imageStream: must be a valid FileStream',
  INVALID_METADATA_UPDATE: 'Invalid metadata: must be a valid VideoUpdateMetadata',
  INVALID_CHANNEL_ID: 'Invalid channelId: must be a string',
  INVALID_QUERY: 'Invalid query: must be a string',
  UNSUPPORTED_CAPABILITY: (capability: string) => `Unsupported capability: ${capability}`,
  UNKNOWN_UPLOAD_OPERATION: (operation: string) => `Unknown upload op: ${operation}`,
  UNKNOWN_OPERATION: (operation: string) => `Unknown operation: ${operation}`,
} as const;

export const YOUTUBE_PAYLOAD_KEYS = {
  STATS: 'stats',
  RETENTION_DATA: 'retentionData',
  AUDIENCE_METRICS: 'audienceMetrics',
  VIDEO1: 'video1',
  VIDEO2: 'video2',
  FILESTREAM: 'fileStream',
  METADATA: 'metadata',
  VIDEO_ID: 'videoId',
  IMAGESTREAM: 'imageStream',
  CHANNEL_ID: 'channelId',
  QUERY: 'query',
  OPTIONS: 'options',
  REGION: 'region',
  MAX_RESULTS: 'maxResults',
} as const;
