import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  GitLabIntegrationRecord,
  GitLabIssue,
  GitLabProject,
} from '../interfaces/gitlab-config.interface';
import { GitLabPrismaService } from '../interfaces/gitlab-prisma.interface';
import type { GitLabWebhookResponse } from '../types/gitlab-api-types';
import { GitLabApiService } from './gitlab-api.service';

@Injectable()
export class GitLabIntegrationService {
  private readonly logger = new Logger(GitLabIntegrationService.name);

  constructor(
    private readonly gitlabApiService: GitLabApiService,
    @Inject('PrismaService') private prisma: GitLabPrismaService
  ) {}

  /**
   * Create GitLab integration for a user
   */
  async createIntegration(
    userId: string,
    gitlabUserId: number,
    gitlabUsername: string,
    accessToken: string,
    baseUrl = 'https://gitlab.com'
  ): Promise<GitLabIntegrationRecord> {
    try {
      const integration = await this.prisma.gitlabIntegration.create({
        data: {
          userId,
          gitlabUserId,
          gitlabUsername,
          accessToken,
          baseUrl,
          isActive: true,
        },
      });

      this.logger.log(`GitLab integration created for user ${userId}`);
      return integration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create GitLab integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration by user ID
   */
  async getIntegration(userId: string): Promise<GitLabIntegrationRecord | null> {
    try {
      return await this.prisma.gitlabIntegration.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get GitLab integration: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    data: Partial<GitLabIntegrationRecord>
  ): Promise<GitLabIntegrationRecord> {
    try {
      return await this.prisma.gitlabIntegration.update({
        where: { id: integrationId },
        data,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update GitLab integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Deactivate integration
   */
  async deactivateIntegration(integrationId: string): Promise<void> {
    try {
      await this.prisma.gitlabIntegration.update({
        where: { id: integrationId },
        data: { isActive: false },
      });

      this.logger.log(`GitLab integration deactivated: ${integrationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to deactivate integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string, page = 1): Promise<GitLabProject[]> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitLab integration not found');
      }

      return await this.gitlabApiService.getUserProjects(page);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get projects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create GitLab webhook for pipeline triggers
   */
  async createWebhookForPipeline(
    userId: string,
    projectId: number,
    webhookUrl: string
  ): Promise<GitLabWebhookResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitLab integration not found');
      }

      const webhook = await this.gitlabApiService.createWebhook(projectId, webhookUrl, [
        'push_events',
        'merge_requests_events',
      ]);

      // Store webhook reference
      if (this.prisma?.gitlabWebhook) {
        await this.prisma.gitlabWebhook.create({
          data: {
            integrationId: integration.id,
            webhookId: webhook.id,
            projectId,
            url: webhookUrl,
            events: ['push_events', 'merge_requests_events'],
            isActive: true,
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
   * List project webhooks
   */
  async listWebhooks(userId: string, projectId: number): Promise<GitLabWebhookResponse[]> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitLab integration not found');
      }

      return await this.gitlabApiService.listWebhooks(projectId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to list webhooks: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Sync project data
   */
  async syncProject(
    userId: string,
    projectId: number
  ): Promise<{
    project: GitLabProject;
    issues: number;
    mergeRequests: number;
    commits: number;
    lastSync: Date;
  }> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitLab integration not found');
      }

      const project = await this.gitlabApiService.getProject(projectId);

      const issues = await this.gitlabApiService.getIssues(projectId, 'all');
      const mergeRequests = await this.gitlabApiService.getMergeRequests(projectId, 'all');
      const commits = await this.gitlabApiService.getCommits(projectId);

      return {
        project,
        issues: issues.length,
        mergeRequests: mergeRequests.length,
        commits: commits.length,
        lastSync: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to sync project: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(userId: string): Promise<{
    integration: {
      id: string;
      gitlabUsername: string;
      isActive: boolean;
      createdAt: Date;
    };
    user: {
      username: string;
      name: string;
      avatarUrl: string;
      state: string;
    };
    stats: {
      syncedProjects: number;
    };
  } | null> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        return null;
      }

      const user = await this.gitlabApiService.getAuthenticatedUser();

      const projects = await this.getUserProjects(userId);

      return {
        integration: {
          id: integration.id,
          gitlabUsername: integration.gitlabUsername,
          isActive: integration.isActive,
          createdAt: integration.createdAt,
        },
        user: {
          username: user.username,
          name: user.name,
          avatarUrl: user.avatar_url ?? '',
          state: user.state,
        },
        stats: {
          syncedProjects: projects.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get stats: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Get project issues for integration with pipeline
   */
  async getProjectIssues(userId: string, projectId: number): Promise<GitLabIssue[]> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('GitLab integration not found');
      }

      return await this.gitlabApiService.getIssues(projectId, 'opened');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get project issues: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
