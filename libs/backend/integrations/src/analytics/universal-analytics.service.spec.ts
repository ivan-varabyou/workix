import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalAnalyticsService } from './universal-analytics.service';
import { IntegrationRouter, IntegrationCapability } from '@workix/integrations/core';

describe('UniversalAnalyticsService', () => {
  let service: UniversalAnalyticsService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      execute: vi.fn(),
    };

    service = new UniversalAnalyticsService(mockRouter as IntegrationRouter);
  });

  describe('analyzeVideoPerformance', () => {
    it('should analyze video performance successfully', async () => {
      const providerOrder = ['youtube'];
      const stats = {
        videoId: 'test-video-123',
        views: 1000,
        likes: 100,
        comments: 50,
      };

      const mockResult = {
        provider: 'youtube',
        data: {
          performance: 'good',
          engagementRate: 0.15,
        },
      };

      mockRouter.execute.mockResolvedValue(mockResult);

      const result = await service.analyzeVideoPerformance(providerOrder, stats);

      expect(result).toEqual(mockResult);
      expect(mockRouter.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          capability: IntegrationCapability.ANALYTICS,
          operation: 'analyzePerformance',
          payload: { stats },
        }),
        providerOrder
      );
    });

    it('should handle errors during analysis', async () => {
      const providerOrder = ['youtube'];
      const stats = { videoId: 'test-video-123' };

      const error = new Error('Provider unavailable');
      mockRouter.execute.mockRejectedValue(error);

      await expect(service.analyzeVideoPerformance(providerOrder, stats)).rejects.toThrow(
        'Provider unavailable'
      );
    });

    it('should use default provider order if empty', async () => {
      const stats = { videoId: 'test-video-123' };
      const mockResult = { provider: 'youtube', data: {} };

      mockRouter.execute.mockResolvedValue(mockResult);

      await service.analyzeVideoPerformance([], stats);

      expect(mockRouter.execute).toHaveBeenCalled();
    });
  });

  describe('analyzeRetention', () => {
    it('should analyze retention successfully', async () => {
      const providerOrder = ['youtube'];
      const retentionData = [
        { second: 0, percentage: 80 },
        { second: 300, percentage: 60 },
      ];

      const mockResult = {
        provider: 'youtube',
        data: {
          averageRetention: 0.7,
          trend: 'declining',
        },
      };

      mockRouter.execute.mockResolvedValue(mockResult);

      const result = await service.analyzeRetention(providerOrder, retentionData);

      expect(result).toEqual(mockResult);
      expect(mockRouter.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          capability: IntegrationCapability.ANALYTICS,
          operation: 'retentionCurve',
          payload: { retentionData },
        }),
        providerOrder
      );
    });

    it('should handle errors during retention analysis', async () => {
      const providerOrder = ['youtube'];
      const retentionData: any[] = [];

      const error = new Error('Invalid data');
      mockRouter.execute.mockRejectedValue(error);

      await expect(service.analyzeRetention(providerOrder, retentionData)).rejects.toThrow(
        'Invalid data'
      );
    });
  });

  describe('predictPostingTime', () => {
    it('should predict posting time successfully', async () => {
      const providerOrder = ['youtube'];
      const audienceMetrics = [
        { metric: 'activeUsers', value: 1000, segment: 'morning' },
        { metric: 'activeUsers', value: 2000, segment: 'evening' },
      ];

      const mockResult = {
        provider: 'youtube',
        data: {
          optimalTime: '18:00',
          confidence: 0.85,
        },
      };

      mockRouter.execute.mockResolvedValue(mockResult);

      const result = await service.predictPostingTime(providerOrder, audienceMetrics);

      expect(result).toEqual(mockResult);
      expect(mockRouter.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          capability: IntegrationCapability.ANALYTICS,
          operation: 'predictPostingTime',
          payload: { audienceMetrics },
        }),
        providerOrder
      );
    });

    it('should handle errors during prediction', async () => {
      const providerOrder = ['youtube'];
      const audienceMetrics: { hour: number; avgViews: number }[] = [];

      const error = new Error('Insufficient data');
      mockRouter.execute.mockRejectedValue(error);

      await expect(service.predictPostingTime(providerOrder, audienceMetrics)).rejects.toThrow(
        'Insufficient data'
      );
    });
  });

  describe('compareVideos', () => {
    it('should compare videos successfully', async () => {
      const providerOrder = ['youtube'];
      const video1 = { videoId: 'video-1', views: 1000, likes: 100 };
      const video2 = { videoId: 'video-2', views: 2000, likes: 150 };

      const mockResult = {
        provider: 'youtube',
        data: {
          winner: 'video-2',
          improvement: 0.5,
        },
      };

      mockRouter.execute.mockResolvedValue(mockResult);

      const result = await service.compareVideos(providerOrder, video1, video2);

      expect(result).toEqual(mockResult);
      expect(mockRouter.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          capability: IntegrationCapability.ANALYTICS,
          operation: 'compareVideos',
          payload: { video1, video2 },
        }),
        providerOrder
      );
    });

    it('should handle errors during comparison', async () => {
      const providerOrder = ['youtube'];
      const video1 = { videoId: 'video-1' };
      const video2 = { videoId: 'video-2' };

      const error = new Error('Videos not found');
      mockRouter.execute.mockRejectedValue(error);

      await expect(service.compareVideos(providerOrder, video1, video2)).rejects.toThrow(
        'Videos not found'
      );
    });
  });
});
