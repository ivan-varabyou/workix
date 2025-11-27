import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalAnalyticsService } from './universal-analytics.service';
import { IntegrationRouter, IntegrationCapability } from '@workix/integrations/core';

describe('UniversalAnalyticsService', () => {
  let service: UniversalAnalyticsService;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = {
      execute: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalAnalyticsService,
        {
          provide: IntegrationRouter,
          useValue: mockRouter,
        },
      ],
    }).compile();

    service = module.get<UniversalAnalyticsService>(UniversalAnalyticsService);
    // Ensure router is injected
    (service as any).router = mockRouter;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeVideoPerformance', () => {
    it('should analyze video performance', async () => {
      const mockResult = {
        id: 'test-id',
        provider: 'youtube',
        operation: 'analyzePerformance',
        data: { quality: 8 },
        timestamp: new Date(),
      };

      mockRouter.execute.mockResolvedValue(mockResult);

      const result = await service.analyzeVideoPerformance(['youtube'], { videoId: 'test' });

      expect(result).toEqual(mockResult);
      expect(mockRouter.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          capability: IntegrationCapability.ANALYTICS,
          operation: 'analyzePerformance',
        }),
        ['youtube']
      );
    });
  });
});
