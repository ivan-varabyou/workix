import { Inject, Injectable, Logger } from '@nestjs/common';

import { GitHubIntegrationRecord } from '../interfaces/github-config.interface';
import { GitHubPrismaService } from '../interfaces/github-prisma.interface';
import type {
  GitHubIssue,
  GitHubRepository,
  GitHubWebhookResponse,
} from '../types/github-api-types';
import { GitHubApiService } from './github-api.service';

@Injectable()
export class GitHubIntegrationService {
  private readonly logger = new Logger(GitHubIntegrationService.name);

  constructor(
    private readonly githubApiService: GitHubApiService,
    @Inject('PrismaService') private prisma: GitHubPrismaService
  ) {}

  /**
   * Create GitHub integration for a user
   */
  async createIntegration(
    userId: string,
    githubUserId: number,
    githubLogin: string,
    accessToken: string,
    scope?: string
  ): Promise<GitHubIntegrationRecord> {
    try {
      const integration = await this.prisma.githubIntegration.create({
        data: {
          userId,
          githubUserId,
          githubLogin,
          accessToken,
          scope: scope ?? '',
          isActive: true,
        },
      });

      this.logger.log(`GitHub integration created for user ${userId}`);
      return integration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create GitHub integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration by user ID
   */
  async getIntegration(userId: string): Promise<GitHubIntegrationRecord | null> {
    try {
      return await this.prisma.githubIntegration.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get GitHub integration: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Get integration by GitHub login
   */
  async getIntegrationByLogin(githubLogin: string): Promise<GitHubIntegrationRecord | null> {
    try {
      return await this.prisma.githubIntegration.findFirst({
        where: {
          githubLogin,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get GitHub integration by login: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    data: Partial<GitHubIntegrationRecord>
  ): Promise<GitHubIntegrationRecord> {
    try {
      return await this.prisma.githubIntegration.update({
        where: { id: integrationId },
        data,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update GitHub integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Deactivate integration
   */
  async deactivateIntegration(integrationId: string): Promise<void> {
    try {
      await this.prisma.githubIntegration.update({
        where: { id: integrationId },
        data: { isActive: false },
      });

      this.logger.log(`GitHub integration deactivated: ${integrationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to deactivate integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(userId: string, page = 1): Promise<GitHubRepository[]> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitHub integration not found');
      }

      return await this.githubApiService.getUserRepositories(integration.accessToken, page);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get repositories: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create GitHub webhook for pipeline triggers
   */
  async createWebhookForPipeline(
    userId: string,
    owner: string,
    repo: string,
    webhookUrl: string
  ): Promise<GitHubWebhookResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitHub integration not found');
      }

      const webhook = await this.githubApiService.createWebhook(
        integration.accessToken,
        owner,
        repo,
        webhookUrl,
        ['push', 'pull_request']
      );

      // Store webhook reference
      if (this.prisma?.githubWebhook) {
        await this.prisma.githubWebhook.create({
          data: {
            integrationId: integration.id,
            webhookId: webhook.id,
            repository: `${owner}/${repo}`,
            url: webhookUrl,
            events: ['push', 'pull_request'],
            isActive: webhook.active,
          },
        });
      }

      return webhook;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create webhook: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * List repository webhooks
   */
  async listWebhooks(
    userId: string,
    owner: string,
    repo: string
  ): Promise<GitHubWebhookResponse[]> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitHub integration not found');
      }

      return await this.githubApiService.listWebhooks(integration.accessToken, owner, repo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to list webhooks: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Sync repository data
   */
  async syncRepository(
    userId: string,
    owner: string,
    repo: string
  ): Promise<{
    repository: GitHubRepository;
    issues: number;
    pullRequests: number;
    commits: number;
    lastSync: Date;
  }> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitHub integration not found');
      }

      const repository = await this.githubApiService.getRepository(owner, repo);

      const issues = await this.githubApiService.getIssues(owner, repo, 'all');
      const pullRequests = await this.githubApiService.getPullRequests(owner, repo, 'all');
      const commits = await this.githubApiService.getCommits(owner, repo);

      return {
        repository,
        issues: issues.length,
        pullRequests: pullRequests.length,
        commits: commits.length,
        lastSync: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to sync repository: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(userId: string): Promise<{
    integration: {
      id: string;
      githubLogin: string;
      isActive: boolean;
      createdAt: Date;
    };
    user: {
      login: string;
      name: string;
      avatarUrl: string;
      publicRepos: number;
      followers: number;
      following: number;
    };
    stats: {
      syncedRepositories: number;
    };
  } | null> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        return null;
      }

      const user = await this.githubApiService.getAuthenticatedUser(integration.accessToken);

      const repos = await this.getUserRepositories(userId);

      return {
        integration: {
          id: integration.id,
          githubLogin: integration.githubLogin,
          isActive: integration.isActive,
          createdAt: integration.createdAt,
        },
        user: {
          login: user.login,
          name: user.name ?? '',
          avatarUrl: user.avatar_url ?? '',
          publicRepos: user.public_repos,
          followers: user.followers,
          following: user.following,
        },
        stats: {
          syncedRepositories: repos.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get stats: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Get repository issues for integration with pipeline
   */
  async getRepositoryIssues(userId: string, owner: string, repo: string): Promise<GitHubIssue[]> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitHub integration not found');
      }

      return await this.githubApiService.getIssues(owner, repo, 'open');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get repository issues: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
