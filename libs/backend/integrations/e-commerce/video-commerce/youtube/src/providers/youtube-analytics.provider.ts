import { Injectable, Logger } from '@nestjs/common';

import { BasePayload } from '../../../../../core/src/interfaces/integration-payload.interface';
import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../../../../../core/src/interfaces/integration-provider.interface';
import {
  YOUTUBE_CAPABILITY_OPERATIONS,
  YOUTUBE_ERROR_MESSAGES,
  YOUTUBE_PAYLOAD_KEYS,
  YOUTUBE_PROVIDER_ID,
  YOUTUBE_PROVIDER_NAME,
  YOUTUBE_PROVIDER_STATUS,
} from '../constants/youtube.constants';
import { YouTubeAnalyticsService } from '../services/youtube-analytics.service';
import { YouTubeApiService } from '../services/youtube-api.service';
import {
  type AudienceMetric,
  isAudienceMetric,
  isRetentionDataPoint,
  isVideoMetrics,
  isVideoUpdateMetadata,
  isVideoUploadMetadata,
  type RetentionDataPoint,
} from '../types/youtube-api-types';

@Injectable()
export class YouTubeAnalyticsProvider implements IntegrationProvider {
  id = YOUTUBE_PROVIDER_ID;
  name = YOUTUBE_PROVIDER_NAME;
  capabilities = [
    IntegrationCapability.ANALYTICS,
    IntegrationCapability.UPLOAD,
    IntegrationCapability.CONTENT,
    IntegrationCapability.COMMENTS,
    IntegrationCapability.LIVE,
  ];
  private logger = new Logger(YouTubeAnalyticsProvider.name);

  constructor(private api: YouTubeApiService, private analytics: YouTubeAnalyticsService) {}

  supports(operation: string, capability: IntegrationCapability): boolean {
    const operations = YOUTUBE_CAPABILITY_OPERATIONS[capability];
    return operations?.includes(operation) ?? false;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      capabilities: this.capabilities,
      status: YOUTUBE_PROVIDER_STATUS,
    };
  }

  async execute<T = BasePayload>(request: IntegrationRequest): Promise<IntegrationResponse<T>> {
    const started = Date.now();
    try {
      let data: BasePayload;
      switch (request.capability) {
        case IntegrationCapability.ANALYTICS:
          data = await this.handleAnalytics(request);
          break;
        case IntegrationCapability.UPLOAD:
          data = await this.handleUpload(request);
          break;
        case IntegrationCapability.CONTENT:
        case IntegrationCapability.COMMENTS:
          data = await this.handleContent(request);
          break;
        default:
          throw new Error(YOUTUBE_ERROR_MESSAGES.UNSUPPORTED_CAPABILITY(request.capability));
      }
      const responseId = request.id ?? `${this.id}-${Date.now()}`;
      return {
        id: responseId,
        provider: this.id,
        operation: request.operation,
        data: data as T,
        timestamp: new Date(),
        metadata: { elapsedMs: Date.now() - started },
      };
    } catch (e) {
      this.logger.error(`YouTube exec failed: ${e instanceof Error ? e.message : String(e)}`);
      throw e;
    }
  }

  private async handleAnalytics(req: IntegrationRequest): Promise<BasePayload> {
    const payload = req.payload ?? {};
    switch (req.operation) {
      case 'analyzePerformance': {
        const stats = payload[YOUTUBE_PAYLOAD_KEYS.STATS];
        if (isVideoMetrics(stats)) {
          return this.analytics.analyzeVideoPerformance(stats);
        }
        throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_VIDEO_METRICS);
      }
      case 'retentionCurve': {
        const retentionDataRaw = payload[YOUTUBE_PAYLOAD_KEYS.RETENTION_DATA];
        if (Array.isArray(retentionDataRaw) && retentionDataRaw.length > 0) {
          const retentionData: RetentionDataPoint[] = [];
          for (const item of retentionDataRaw) {
            if (isRetentionDataPoint(item)) {
              retentionData.push(item);
            }
          }
          if (retentionData.length > 0) {
            const result = await this.analytics.analyzeRetention(retentionData);
            return {
              avgRetention: result.avgRetention,
              totalDropPoints: result.totalDropPoints,
              criticalPoints: JSON.stringify(result.criticalPoints),
              recommendations: result.recommendations,
            };
          }
        }
        throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_RETENTION_DATA);
      }
      case 'predictPostingTime': {
        const audienceMetricsRaw = payload[YOUTUBE_PAYLOAD_KEYS.AUDIENCE_METRICS];
        if (Array.isArray(audienceMetricsRaw) && audienceMetricsRaw.length > 0) {
          const audienceMetrics: AudienceMetric[] = [];
          for (const item of audienceMetricsRaw) {
            if (isAudienceMetric(item)) {
              audienceMetrics.push(item);
            }
          }
          if (audienceMetrics.length > 0) {
            const result = this.analytics.predictOptimalPostingTime(audienceMetrics);
            return {
              hour: result.hour,
              views: result.views,
              timeFormatted: result.timeFormatted,
            };
          }
        }
        throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_AUDIENCE_METRICS);
      }
      case 'compareVideos': {
        const video1 = payload[YOUTUBE_PAYLOAD_KEYS.VIDEO1];
        const video2 = payload[YOUTUBE_PAYLOAD_KEYS.VIDEO2];
        if (isVideoMetrics(video1) && isVideoMetrics(video2)) {
          return this.analytics.compareVideos(video1, video2);
        }
        throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_VIDEO_METRICS_COMPARE);
      }
      case 'fetchMetrics':
      default:
        return payload;
    }
  }

  private async handleUpload(req: IntegrationRequest): Promise<BasePayload> {
    const payload = req.payload ?? {};
    switch (req.operation) {
      case 'uploadVideo': {
        const fileStream = payload[YOUTUBE_PAYLOAD_KEYS.FILESTREAM];
        const metadata = payload[YOUTUBE_PAYLOAD_KEYS.METADATA];
        if (
          !fileStream ||
          typeof fileStream !== 'object' ||
          Array.isArray(fileStream) ||
          fileStream === null ||
          !('pipe' in fileStream)
        ) {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_FILESTREAM);
        }
        if (!isVideoUploadMetadata(metadata)) {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_METADATA_UPLOAD);
        }
        const videoId = await this.api.uploadVideo(fileStream, metadata);
        return { videoId, status: 'success' };
      }
      case 'uploadThumbnail': {
        const videoId = payload[YOUTUBE_PAYLOAD_KEYS.VIDEO_ID];
        if (typeof videoId !== 'string') {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_VIDEO_ID);
        }
        const imageStream = payload[YOUTUBE_PAYLOAD_KEYS.IMAGESTREAM];
        if (
          !imageStream ||
          typeof imageStream !== 'object' ||
          Array.isArray(imageStream) ||
          imageStream === null ||
          !('pipe' in imageStream)
        ) {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_IMAGESTREAM);
        }
        await this.api.uploadThumbnail(videoId, imageStream);
        return { updated: true };
      }
      case 'updateMetadata': {
        const videoId = payload[YOUTUBE_PAYLOAD_KEYS.VIDEO_ID];
        if (typeof videoId !== 'string') {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_VIDEO_ID);
        }
        const metadata = payload[YOUTUBE_PAYLOAD_KEYS.METADATA];
        if (!isVideoUpdateMetadata(metadata)) {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_METADATA_UPDATE);
        }
        await this.api.updateVideoMetadata(videoId, metadata);
        return { updated: true };
      }
      default:
        throw new Error(YOUTUBE_ERROR_MESSAGES.UNKNOWN_UPLOAD_OPERATION(req.operation));
    }
  }

  private async handleContent(req: IntegrationRequest): Promise<BasePayload> {
    const payload = req.payload ?? {};
    switch (req.operation) {
      case 'getChannelInfo': {
        const channelId = payload[YOUTUBE_PAYLOAD_KEYS.CHANNEL_ID];
        if (typeof channelId !== 'string') {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_CHANNEL_ID);
        }
        const channelInfo = await this.api.getChannelInfo(channelId);
        return {
          id: channelInfo.id ?? '',
          snippet: channelInfo.snippet ? JSON.stringify(channelInfo.snippet) : undefined,
          statistics: channelInfo.statistics ? JSON.stringify(channelInfo.statistics) : undefined,
          contentDetails: channelInfo.contentDetails
            ? JSON.stringify(channelInfo.contentDetails)
            : undefined,
        };
      }
      case 'searchVideos': {
        const query = payload[YOUTUBE_PAYLOAD_KEYS.QUERY];
        if (typeof query !== 'string') {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_QUERY);
        }
        const options = payload[YOUTUBE_PAYLOAD_KEYS.OPTIONS];
        let maxResults: number | undefined;
        if (options && typeof options === 'object' && !Array.isArray(options) && options !== null) {
          const maxResultsValue = (options as Record<string, unknown>)[
            YOUTUBE_PAYLOAD_KEYS.MAX_RESULTS
          ];
          if (typeof maxResultsValue === 'number') {
            maxResults = maxResultsValue;
          }
        }
        const searchResult = await this.api.searchVideos(query, maxResults);
        return { videos: JSON.stringify(searchResult) };
      }
      case 'getTrending': {
        const region = payload[YOUTUBE_PAYLOAD_KEYS.REGION];
        const regionCode = typeof region === 'string' ? region : undefined;
        const trendingResult = await this.api.getTrendingVideos(regionCode);
        return { videos: JSON.stringify(trendingResult) };
      }
      case 'getComments': {
        const videoId = payload[YOUTUBE_PAYLOAD_KEYS.VIDEO_ID];
        if (typeof videoId !== 'string') {
          throw new Error(YOUTUBE_ERROR_MESSAGES.INVALID_VIDEO_ID);
        }
        const commentsResult = await this.api.getComments(videoId);
        return { comments: JSON.stringify(commentsResult) };
      }
      default:
        throw new Error(YOUTUBE_ERROR_MESSAGES.UNKNOWN_OPERATION(req.operation));
    }
  }
}
