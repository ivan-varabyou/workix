import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubIntegrationService } from './github-integration.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GitHubApiService } from './github-api.service';

describe('GitHubIntegrationService', () => {
  let service: GitHubIntegrationService;
  let mockApiService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockApiService = {
      getUser: vi.fn(),
      getRepositories: vi.fn(),
    };
    mockPrisma = {
      githubIntegration: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    service = new GitHubIntegrationService(mockApiService, mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
