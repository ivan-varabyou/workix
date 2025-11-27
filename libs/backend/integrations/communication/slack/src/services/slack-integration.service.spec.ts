import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SlackIntegrationService } from './slack-integration.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SlackApiService } from './slack-api.service';

describe('SlackIntegrationService', () => {
  let service: SlackIntegrationService;
  let mockApiService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockApiService = {
      sendMessage: vi.fn(),
      getChannels: vi.fn(),
    };
    mockPrisma = {
      slackIntegration: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new SlackIntegrationService(mockApiService, mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
