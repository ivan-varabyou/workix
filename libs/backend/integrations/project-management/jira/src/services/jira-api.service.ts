import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { JiraConfig } from '../interfaces/jira-config.interface';
import type {
  JiraCommentResponse,
  JiraIssue,
  JiraIssueResponse,
  JiraIssueUpdateFields,
  JiraProject,
  JiraSearchResponse,
  JiraTransition,
  JiraUser,
  JiraWebhookResponse,
} from '../types/jira-api-types';
import {
  isJiraCommentResponse,
  isJiraIssue,
  isJiraIssueResponse,
  isJiraProject,
  isJiraSearchResponse,
  isJiraTransition,
  isJiraUser,
  isJiraWebhookResponse,
} from '../types/jira-api-types';

@Injectable()
export class JiraApiService {
  private readonly logger = new Logger(JiraApiService.name);
  private config: JiraConfig;

  constructor(
    private readonly httpService: HttpService,
    @Inject('JIRA_CONFIG') config: JiraConfig
  ) {
    this.config = config;
  }

  /**
   * Get authenticated user
   */
  async getAuthenticatedUser(): Promise<JiraUser> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/rest/api/3/myself`, {
          auth: {
            username: this.config.email,
            password: this.config.apiToken,
          },
        })
      );

      if (!isJiraUser(response.data)) {
        throw new Error('Invalid response format from Jira API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get authenticated user: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user projects
   */
  async getUserProjects(): Promise<JiraProject[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/rest/api/3/projects`, {
          auth: {
            username: this.config.email,
            password: this.config.apiToken,
          },
        })
      );

      const projectsData = response.data.values ?? response.data;
      if (!Array.isArray(projectsData)) {
        throw new Error('Invalid response format from Jira API');
      }
      return projectsData.filter((project): project is JiraProject => isJiraProject(project));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get projects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get project by key
   */
  async getProject(projectKey: string): Promise<JiraProject> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/rest/api/3/project/${projectKey}`, {
          auth: {
            username: this.config.email,
            password: this.config.apiToken,
          },
        })
      );

      if (!isJiraProject(response.data)) {
        throw new Error('Invalid response format from Jira API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get project: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Search issues
   */
  async searchIssues(jql: string, maxResults = 50, startAt = 0): Promise<JiraSearchResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/rest/api/3/search`, {
          params: {
            jql,
            maxResults,
            startAt,
          },
          auth: {
            username: this.config.email,
            password: this.config.apiToken,
          },
        })
      );

      if (!isJiraSearchResponse(response.data)) {
        throw new Error('Invalid response format from Jira API');
      }

      return {
        expand: response.data.expand ?? '',
        startAt: response.data.startAt,
        maxResults: response.data.maxResults,
        total: response.data.total,
        issues: response.data.issues.filter((issue): issue is JiraIssue => isJiraIssue(issue)),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to search issues: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get issue by key
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/rest/api/3/issue/${issueKey}`, {
          auth: {
            username: this.config.email,
            password: this.config.apiToken,
          },
        })
      );

      if (!isJiraIssue(response.data)) {
        throw new Error('Invalid response format from Jira API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get issue: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create issue
   */
  async createIssue(
    projectKey: string,
    issueType: string,
    summary: string,
    description?: string,
    labels?: string[]
  ): Promise<JiraIssueResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/rest/api/3/issue`,
          {
            fields: {
              project: { key: projectKey },
              issuetype: { name: issueType },
              summary,
              description: description
                ? {
                    version: 1,
                    type: 'doc',
                    content: [
                      { type: 'paragraph', content: [{ type: 'text', text: description }] },
                    ],
                  }
                : undefined,
              labels: labels || [],
            },
          },
          {
            auth: {
              username: this.config.email,
              password: this.config.apiToken,
            },
          }
        )
      );

      if (!isJiraIssueResponse(response.data)) {
        throw new Error('Invalid response format from Jira API');
      }

      return {
        id: response.data.id,
        key: response.data.key,
        self: response.data.self,
        fields: response.data.fields,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create issue: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Update issue
   */
  async updateIssue(issueKey: string, fields: JiraIssueUpdateFields): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.config.baseUrl}/rest/api/3/issue/${issueKey}`,
          { fields },
          {
            auth: {
              username: this.config.email,
              password: this.config.apiToken,
            },
          }
        )
      );

      this.logger.log(`Issue updated: ${issueKey}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update issue: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Transition issue
   */
  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/rest/api/3/issue/${issueKey}/transitions`,
          {
            transition: { id: transitionId },
          },
          {
            auth: {
              username: this.config.email,
              password: this.config.apiToken,
            },
          }
        )
      );

      this.logger.log(`Issue transitioned: ${issueKey}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to transition issue: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get available transitions
   */
  async getTransitions(issueKey: string): Promise<JiraTransition[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, {
          auth: {
            username: this.config.email,
            password: this.config.apiToken,
          },
        })
      );

      if (!Array.isArray(response.data.transitions)) {
        throw new Error('Invalid response format from Jira API');
      }
      return response.data.transitions.filter((transition: unknown): transition is JiraTransition =>
        isJiraTransition(transition)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get transitions: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create webhook
   */
  async createWebhook(
    url: string,
    events: string[] = ['jira:issue_created', 'jira:issue_updated']
  ): Promise<JiraWebhookResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/rest/api/3/webhook`,
          {
            name: 'Workix Pipeline Webhook',
            url,
            events,
            filters: {
              'issue-related-events-section': '',
            },
            excludeBody: false,
          },
          {
            auth: {
              username: this.config.email,
              password: this.config.apiToken,
            },
          }
        )
      );

      if (!isJiraWebhookResponse(response.data)) {
        throw new Error('Invalid response format from Jira API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create webhook: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Add comment to issue
   */
  async addComment(issueKey: string, comment: string): Promise<JiraCommentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/rest/api/3/issue/${issueKey}/comments`,
          {
            body: {
              version: 1,
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: comment }],
                },
              ],
            },
          },
          {
            auth: {
              username: this.config.email,
              password: this.config.apiToken,
            },
          }
        )
      );

      if (!isJiraCommentResponse(response.data)) {
        throw new Error('Invalid response format from Jira API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to add comment: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
