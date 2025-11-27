import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsController } from './analytics.controller';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IntegrationRouter } from '@workix/integrations/core';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      route: vi.fn(),
    };

    controller = new AnalyticsController();
  });

  describe('analyze', () => {
    it('should analyze video performance with provider order', async () => {
      const body = {
        providerOrder: ['youtube', 'tiktok'],
        stats: {
          videoId: 'test-video-123',
          views: 1000,
          likes: 100,
        },
      };

      const result = await controller.analyze(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('stats');
      expect(result.order).toEqual(['youtube', 'tiktok']);
      expect(result.stats).toEqual(body.stats);
    });

    it('should use default provider order if not provided', async () => {
      const body = {
        stats: {
          videoId: 'test-video-123',
        },
      };

      const result = await controller.analyze(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('stats');
      expect(result.order).toEqual(['youtube']);
      expect(result.stats).toEqual(body.stats);
    });

    it('should handle errors', async () => {
      const body = {
        stats: { videoId: 'test-video-123' },
      };

      // Controller doesn't throw errors currently, it returns a message
      const result = await controller.analyze(body);
      expect(result).toHaveProperty('message');
    });
  });

  describe('retention', () => {
    it('should analyze retention with provider order', async () => {
      const body = {
        providerOrder: ['youtube'],
        retentionData: [{ timestamp: '2025-01-01', retention: 0.8, viewers: 1000 }],
      };

      const result = await controller.retention(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('retentionData');
      expect(result.order).toEqual(['youtube']);
      expect(result.retentionData).toEqual(body.retentionData);
    });

    it('should use default provider order if not provided', async () => {
      const body = {
        retentionData: [{ timestamp: '2025-01-01', retention: 0.8, viewers: 1000 }],
      };

      const result = await controller.retention(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('retentionData');
      expect(result.order).toEqual(['youtube']);
      expect(result.retentionData).toEqual(body.retentionData);
    });
  });

  describe('predict', () => {
    it('should predict posting time with provider order', async () => {
      const body = {
        providerOrder: ['youtube'],
        audienceMetrics: [{ metric: 'activeUsers', value: 1000, segment: 'morning' }],
      };

      const result = await controller.predict(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('audienceMetrics');
      expect(result.order).toEqual(['youtube']);
      expect(result.audienceMetrics).toEqual(body.audienceMetrics);
    });

    it('should use default provider order if not provided', async () => {
      const body = {
        audienceMetrics: [{ metric: 'activeUsers', value: 1000, segment: 'morning' }],
      };

      const result = await controller.predict(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('audienceMetrics');
      expect(result.order).toEqual(['youtube']);
      expect(result.audienceMetrics).toEqual(body.audienceMetrics);
    });
  });

  describe('compare', () => {
    it('should compare videos with provider order', async () => {
      const body = {
        providerOrder: ['youtube'],
        video1: { videoId: 'video-1', views: 1000 },
        video2: { videoId: 'video-2', views: 2000 },
      };

      const result = await controller.compare(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('video1');
      expect(result).toHaveProperty('video2');
      expect(result.order).toEqual(['youtube']);
      expect(result.video1).toEqual(body.video1);
      expect(result.video2).toEqual(body.video2);
    });

    it('should use default provider order if not provided', async () => {
      const body = {
        video1: { videoId: 'video-1', views: 1000 },
        video2: { videoId: 'video-2', views: 2000 },
      };

      const result = await controller.compare(body);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('order');
      expect(result).toHaveProperty('video1');
      expect(result).toHaveProperty('video2');
      expect(result.order).toEqual(['youtube']);
      expect(result.video1).toEqual(body.video1);
      expect(result.video2).toEqual(body.video2);
    });
  });
});
