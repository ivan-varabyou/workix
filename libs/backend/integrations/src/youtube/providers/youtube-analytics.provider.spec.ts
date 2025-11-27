import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YouTubeAnalyticsProvider } from './youtube-analytics.provider';
import { YouTubeApiService } from '../../youtube/services/youtube-api.service';
import { YouTubeAnalyticsService } from '../../youtube/services/youtube-analytics.service';
import { IntegrationCapability, IntegrationRequest } from '@workix/integrations/core';

describe('YouTubeAnalyticsProvider', () => {
  let provider: YouTubeAnalyticsProvider;
  let mockApi: any;
  let mockAnalytics: any;

  beforeEach(() => {
    mockApi = {
      uploadVideo: vi.fn(),
      uploadThumbnail: vi.fn(),
      updateVideoMetadata: vi.fn(),
      getChannelInfo: vi.fn(),
      searchVideos: vi.fn(),
      getTrendingVideos: vi.fn(),
      getComments: vi.fn(),
    };

    mockAnalytics = {
      analyzeVideoPerformance: vi.fn(),
      analyzeRetention: vi.fn(),
      predictOptimalPostingTime: vi.fn(),
      compareVideos: vi.fn(),
    };

    provider = new YouTubeAnalyticsProvider(
      mockApi as YouTubeApiService,
      mockAnalytics as YouTubeAnalyticsService
    );
  });

  describe('supports', () => {
    it('should support analytics operations', () => {
      expect(provider.supports('analyzePerformance', IntegrationCapability.ANALYTICS)).toBe(true);
      expect(provider.supports('retentionCurve', IntegrationCapability.ANALYTICS)).toBe(true);
      expect(provider.supports('predictPostingTime', IntegrationCapability.ANALYTICS)).toBe(true);
      expect(provider.supports('compareVideos', IntegrationCapability.ANALYTICS)).toBe(true);
      expect(provider.supports('fetchMetrics', IntegrationCapability.ANALYTICS)).toBe(true);
    });

    it('should support upload operations', () => {
      expect(provider.supports('uploadVideo', IntegrationCapability.UPLOAD)).toBe(true);
      expect(provider.supports('uploadThumbnail', IntegrationCapability.UPLOAD)).toBe(true);
      expect(provider.supports('updateMetadata', IntegrationCapability.UPLOAD)).toBe(true);
    });

    it('should support content operations', () => {
      expect(provider.supports('getChannelInfo', IntegrationCapability.CONTENT)).toBe(true);
      expect(provider.supports('searchVideos', IntegrationCapability.CONTENT)).toBe(true);
      expect(provider.supports('getTrending', IntegrationCapability.CONTENT)).toBe(true);
    });

    it('should support comments operations', () => {
      expect(provider.supports('getComments', IntegrationCapability.COMMENTS)).toBe(true);
    });

    it('should not support unknown operations', () => {
      expect(provider.supports('unknownOperation', IntegrationCapability.ANALYTICS)).toBe(false);
    });
  });

  describe('execute - Analytics', () => {
    it('should handle analyzePerformance operation', async () => {
      const stats = {
        videoId: 'test-123',
        views: 1000,
        watchTimeMinutes: 100,
        likes: 100,
        comments: 50,
        shares: 20,
        subscribers: 500,
        ctr: 0.05,
        avgViewDuration: 120,
      };
      const mockResult = { performance: 'good', engagementRate: 0.15 };

      mockAnalytics.analyzeVideoPerformance.mockResolvedValue(mockResult);

      const request: IntegrationRequest = {
        id: 'test-1',
        capability: IntegrationCapability.ANALYTICS,
        operation: 'analyzePerformance',
        payload: { stats },
      };

      const result = await provider.execute(request);

      expect(result.provider).toBe('youtube');
      expect(result.operation).toBe('analyzePerformance');
      expect(result.data).toEqual(mockResult);
      expect(mockAnalytics.analyzeVideoPerformance).toHaveBeenCalledWith(stats);
    });

    it('should handle retentionCurve operation', async () => {
      const retentionData = [{ second: 10, percentage: 0.8 }];
      const mockAnalyticsResult = { avgRetention: 0.7, totalDropPoints: 2, criticalPoints: [], recommendations: [] };
      const expectedResult = { avgRetention: 0.7, totalDropPoints: 2, criticalPoints: '[]', recommendations: [] };

      mockAnalytics.analyzeRetention.mockResolvedValue(mockAnalyticsResult);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.ANALYTICS,
        operation: 'retentionCurve',
        payload: { retentionData },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual(expectedResult);
      expect(mockAnalytics.analyzeRetention).toHaveBeenCalledWith(retentionData);
    });

    it('should handle predictPostingTime operation', async () => {
      const audienceMetrics = [{ hour: 18, avgViews: 1000 }];
      const mockAnalyticsResult = { hour: 18, views: 1000, timeFormatted: '18:00 UTC' };
      const expectedResult = { hour: 18, views: 1000, timeFormatted: '18:00 UTC' };

      mockAnalytics.predictOptimalPostingTime.mockReturnValue(mockAnalyticsResult);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.ANALYTICS,
        operation: 'predictPostingTime',
        payload: { audienceMetrics },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual(expectedResult);
      expect(mockAnalytics.predictOptimalPostingTime).toHaveBeenCalledWith(audienceMetrics);
    });

    it('should handle compareVideos operation', async () => {
      const video1 = {
        videoId: 'video-1',
        views: 1000,
        watchTimeMinutes: 100,
        likes: 100,
        comments: 50,
        shares: 20,
        subscribers: 500,
        ctr: 0.05,
        avgViewDuration: 120,
      };
      const video2 = {
        videoId: 'video-2',
        views: 2000,
        watchTimeMinutes: 200,
        likes: 200,
        comments: 100,
        shares: 40,
        subscribers: 1000,
        ctr: 0.06,
        avgViewDuration: 180,
      };
      const mockResult = { winner: 'video-2' };

      mockAnalytics.compareVideos.mockResolvedValue(mockResult);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.ANALYTICS,
        operation: 'compareVideos',
        payload: { video1, video2 },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual(mockResult);
      expect(mockAnalytics.compareVideos).toHaveBeenCalledWith(video1, video2);
    });
  });

  describe('execute - Upload', () => {
    it('should handle uploadVideo operation', async () => {
      const fileStream = Buffer.from('test video content');
      const metadata = { title: 'Test Video', description: 'Test', privacy: 'public' };
      const mockResult = { videoId: 'new-video-123', status: 'success' };

      mockApi.uploadVideo.mockResolvedValue('new-video-123');

      const request: IntegrationRequest = {
        capability: IntegrationCapability.UPLOAD,
        operation: 'uploadVideo',
        payload: { fileStream, metadata },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual(mockResult);
      expect(mockApi.uploadVideo).toHaveBeenCalledWith(fileStream, metadata);
    });

    it('should handle uploadThumbnail operation', async () => {
      const videoId = 'test-video-123';
      const imageStream = Buffer.from('test image content');
      const mockResult = { updated: true };

      mockApi.uploadThumbnail.mockResolvedValue(undefined);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.UPLOAD,
        operation: 'uploadThumbnail',
        payload: { videoId, imageStream },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual(mockResult);
      expect(mockApi.uploadThumbnail).toHaveBeenCalledWith(videoId, imageStream);
    });

    it('should handle updateMetadata operation', async () => {
      const videoId = 'test-video-123';
      const metadata = { title: 'Updated Title' };

      mockApi.updateVideoMetadata.mockResolvedValue(undefined);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.UPLOAD,
        operation: 'updateMetadata',
        payload: { videoId, metadata },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual({ updated: true });
      expect(mockApi.updateVideoMetadata).toHaveBeenCalledWith(videoId, metadata);
    });
  });

  describe('execute - Content', () => {
    it('should handle getChannelInfo operation', async () => {
      const channelId = 'channel-123';
      const mockResult = { id: 'channel-123', snippet: { title: 'Test Channel' } };

      mockApi.getChannelInfo.mockResolvedValue(mockResult);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.CONTENT,
        operation: 'getChannelInfo',
        payload: { channelId },
      };

      const result = await provider.execute(request);

      expect(result.data).toHaveProperty('id', 'channel-123');
      expect(mockApi.getChannelInfo).toHaveBeenCalledWith(channelId);
    });

    it('should handle searchVideos operation', async () => {
      const query = 'test query';
      const maxResults = 10;
      const mockResult = [{ videoId: 'video-1', title: 'Test Video' }];

      mockApi.searchVideos.mockResolvedValue(mockResult);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.CONTENT,
        operation: 'searchVideos',
        payload: { query, options: { maxResults } },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual({ videos: JSON.stringify(mockResult) });
      expect(mockApi.searchVideos).toHaveBeenCalledWith(query, maxResults);
    });

    it('should handle getTrending operation', async () => {
      const regionCode = 'US';
      const mockResult = [{ videoId: 'trending-1', title: 'Trending Video' }];

      mockApi.getTrendingVideos.mockResolvedValue(mockResult);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.CONTENT,
        operation: 'getTrending',
        payload: { region: regionCode },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual({ videos: JSON.stringify(mockResult) });
      expect(mockApi.getTrendingVideos).toHaveBeenCalledWith(regionCode);
    });
  });

  describe('execute - Comments', () => {
    it('should handle getComments operation', async () => {
      const videoId = 'test-video-123';
      const mockResult = [{ commentId: 'comment-1', text: 'Great video!' }];

      mockApi.getComments.mockResolvedValue(mockResult);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.COMMENTS,
        operation: 'getComments',
        payload: { videoId },
      };

      const result = await provider.execute(request);

      expect(result.data).toEqual({ comments: JSON.stringify(mockResult) });
      expect(mockApi.getComments).toHaveBeenCalledWith(videoId);
    });
  });

  describe('execute - Error Handling', () => {
    it('should throw error for unsupported capability', async () => {
      const request: IntegrationRequest = {
        capability: 'UNSUPPORTED' as IntegrationCapability,
        operation: 'test',
        payload: {},
      };

      await expect(provider.execute(request)).rejects.toThrow('Unsupported capability');
    });

    it('should throw error for unknown upload operation', async () => {
      const request: IntegrationRequest = {
        capability: IntegrationCapability.UPLOAD,
        operation: 'unknownUpload',
        payload: {},
      };

      await expect(provider.execute(request)).rejects.toThrow('Unknown upload op: unknownUpload');
    });

    it('should throw error for unknown content operation', async () => {
      const request: IntegrationRequest = {
        capability: IntegrationCapability.CONTENT,
        operation: 'unknownContent',
        payload: {},
      };

      await expect(provider.execute(request)).rejects.toThrow('Unknown operation: unknownContent');
    });

    it('should throw error for unknown comments operation', async () => {
      const request: IntegrationRequest = {
        capability: IntegrationCapability.COMMENTS,
        operation: 'unknownComments',
        payload: {},
      };

      await expect(provider.execute(request)).rejects.toThrow('Unknown operation: unknownComments');
    });

    it('should propagate errors from services', async () => {
      const error = new Error('Service error');
      const stats = {
        videoId: 'test-123',
        views: 1000,
        watchTimeMinutes: 100,
        likes: 100,
        comments: 50,
        shares: 20,
        subscribers: 500,
        ctr: 0.05,
        avgViewDuration: 120,
      };
      mockAnalytics.analyzeVideoPerformance.mockRejectedValue(error);

      const request: IntegrationRequest = {
        capability: IntegrationCapability.ANALYTICS,
        operation: 'analyzePerformance',
        payload: { stats },
      };

      await expect(provider.execute(request)).rejects.toThrow('Service error');
    });
  });

  describe('getInfo', () => {
    it('should return provider information', () => {
      const info = provider.getInfo();

      expect(info.id).toBe('youtube');
      expect(info.name).toBe('YouTube');
      expect(info.status).toBe('active');
      expect(info.capabilities).toContain(IntegrationCapability.ANALYTICS);
      expect(info.capabilities).toContain(IntegrationCapability.UPLOAD);
      expect(info.capabilities).toContain(IntegrationCapability.CONTENT);
      expect(info.capabilities).toContain(IntegrationCapability.COMMENTS);
      expect(info.capabilities).toContain(IntegrationCapability.LIVE);
    });
  });
});
