import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JiraIntegrationService } from './jira-integration.service';
import { JiraApiService } from './jira-api.service';
import { JiraPrismaService } from '../interfaces/jira-prisma.interface';

describe('JiraIntegrationService', () => {
  let service: JiraIntegrationService;
  let mockApiService: {
    getUserProjects: ReturnType<typeof vi.fn>;
    createIssue: ReturnType<typeof vi.fn>;
    getAuthenticatedUser: ReturnType<typeof vi.fn>;
    searchIssues: ReturnType<typeof vi.fn>;
    createWebhook: ReturnType<typeof vi.fn>;
    transitionIssue: ReturnType<typeof vi.fn>;
    addComment: ReturnType<typeof vi.fn>;
  };
  let mockPrisma: JiraPrismaService;

  beforeEach(() => {
    mockApiService = {
      getUserProjects: vi.fn(),
      createIssue: vi.fn(),
      getAuthenticatedUser: vi.fn(),
      searchIssues: vi.fn(),
      createWebhook: vi.fn(),
      transitionIssue: vi.fn(),
      addComment: vi.fn(),
    };
    mockPrisma = {
      jiraIntegration: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    // Using Partial to allow partial mock implementation in tests
    service = new JiraIntegrationService(
      mockApiService as Partial<JiraApiService> as JiraApiService,
      mockPrisma
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
