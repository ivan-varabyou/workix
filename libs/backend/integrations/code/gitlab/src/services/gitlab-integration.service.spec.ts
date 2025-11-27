import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitLabIntegrationService } from './gitlab-integration.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GitLabApiService } from './gitlab-api.service';

describe('GitLabIntegrationService', () => {
  let service: GitLabIntegrationService;
  let mockApiService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockApiService = {
      getUser: vi.fn(),
      getProjects: vi.fn(),
    };
    mockPrisma = {
      gitlabIntegration: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new GitLabIntegrationService(mockApiService, mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
