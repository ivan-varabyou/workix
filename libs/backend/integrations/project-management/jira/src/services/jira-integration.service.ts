import { Inject, Injectable, Logger } from '@nestjs/common';

import { JiraIntegrationRecord, JiraProject } from '../interfaces/jira-config.interface';
import { JiraPrismaService } from '../interfaces/jira-prisma.interface';
import type {
  JiraCommentResponse,
  JiraIssueResponse,
  JiraSearchResponse,
  JiraWebhookResponse,
} from '../types/jira-api-types';
import { JiraApiService } from './jira-api.service';

@Injectable()
export class JiraIntegrationService {
  private readonly logger = new Logger(JiraIntegrationService.name);

  constructor(
    private readonly jiraApiService: JiraApiService,
    @Inject('PrismaService') private prisma: JiraPrismaService
  ) {}

  /**
   * Create Jira integration for a user
   */
  async createIntegration(
    userId: string,
    jiraEmail: string,
    jiraBaseUrl: string,
    apiToken: string
  ): Promise<JiraIntegrationRecord> {
    try {
      const integration = await this.prisma.jiraIntegration.create({
        data: {
          userId,
          jiraEmail,
          jiraBaseUrl,
          apiToken,
          isActive: true,
        },
      });

      this.logger.log(`Jira integration created for user ${userId}`);
      return integration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create Jira integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration by user ID
   */
  async getIntegration(userId: string): Promise<JiraIntegrationRecord | null> {
    try {
      return await this.prisma.jiraIntegration.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get Jira integration: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    data: Partial<JiraIntegrationRecord>
  ): Promise<JiraIntegrationRecord> {
    try {
      return await this.prisma.jiraIntegration.update({
        where: { id: integrationId },
        data,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update Jira integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Deactivate integration
   */
  async deactivateIntegration(integrationId: string): Promise<void> {
    try {
      await this.prisma.jiraIntegration.update({
        where: { id: integrationId },
        data: { isActive: false },
      });

      this.logger.log(`Jira integration deactivated: ${integrationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to deactivate integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user projects
   */
  async getUserProjects(userId: string): Promise<JiraProject[]> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Jira integration not found');
      }

      return await this.jiraApiService.getUserProjects();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get projects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create issue in Jira
   */
  async createIssue(
    userId: string,
    projectKey: string,
    issueType: string,
    summary: string,
    description?: string,
    labels?: string[]
  ): Promise<JiraIssueResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Jira integration not found');
      }

      return await this.jiraApiService.createIssue(
        projectKey,
        issueType,
        summary,
        description,
        labels
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create issue: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Search issues
   */
  async searchIssues(userId: string, jql: string): Promise<JiraSearchResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Jira integration not found');
      }

      return await this.jiraApiService.searchIssues(jql);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to search issues: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create Jira webhook for pipeline triggers
   */
  async createWebhookForPipeline(userId: string, webhookUrl: string): Promise<JiraWebhookResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Jira integration not found');
      }

      const webhook = await this.jiraApiService.createWebhook(webhookUrl);

      // Store webhook reference
      if (this.prisma?.jiraWebhook) {
        await this.prisma.jiraWebhook.create({
          data: {
            integrationId: integration.id,
            webhookId:
              typeof webhook.id === 'string'
                ? webhook.id
                : typeof webhook.id === 'number'
                ? String(webhook.id)
                : '',
            url: webhookUrl,
            events: ['jira:issue_created', 'jira:issue_updated'],
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
   * Update issue status
   */
  async updateIssueStatus(userId: string, issueKey: string, transitionId: string): Promise<void> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Jira integration not found');
      }

      await this.jiraApiService.transitionIssue(issueKey, transitionId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update issue status: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Add comment to issue
   */
  async addComment(
    userId: string,
    issueKey: string,
    comment: string
  ): Promise<JiraCommentResponse> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        throw new Error('Jira integration not found');
      }

      return await this.jiraApiService.addComment(issueKey, comment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to add comment: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(userId: string): Promise<{
    integration: {
      id: string;
      jiraEmail: string;
      isActive: boolean;
      createdAt: Date;
    };
    user: {
      displayName: string;
      email: string;
      avatarUrl: string;
      accountType: string;
    };
    stats: {
      connectedProjects: number;
    };
  } | null> {
    try {
      const integration = await this.getIntegration(userId);

      if (!integration) {
        return null;
      }

      const user = await this.jiraApiService.getAuthenticatedUser();

      const projects = await this.getUserProjects(userId);

      return {
        integration: {
          id: integration.id,
          jiraEmail: integration.jiraEmail,
          isActive: integration.isActive,
          createdAt: integration.createdAt,
        },
        user: {
          displayName: user.displayName,
          email: user.emailAddress ?? '',
          avatarUrl: user.avatarUrls?.['32x32'] ?? '',
          accountType: user.accountType,
        },
        stats: {
          connectedProjects: projects.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get stats: ${errorMessage}`);
      return null;
    }
  }
}
