import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { GitLabConfig } from '../interfaces/gitlab-config.interface';
import type {
  GitLabCommit,
  GitLabIssue,
  GitLabMergeRequest,
  GitLabProject,
  GitLabUser,
  GitLabWebhookResponse,
} from '../types/gitlab-api-types';
import {
  isGitLabCommit,
  isGitLabIssue,
  isGitLabMergeRequest,
  isGitLabProject,
  isGitLabUser,
  isGitLabWebhookResponse,
} from '../types/gitlab-api-types';

@Injectable()
export class GitLabApiService {
  private readonly logger = new Logger(GitLabApiService.name);
  private config: GitLabConfig;

  constructor(
    private readonly httpService: HttpService,
    @Inject('GITLAB_CONFIG') config: GitLabConfig
  ) {
    this.config = config;
  }

  /**
   * Get authenticated user
   */
  async getAuthenticatedUser(): Promise<GitLabUser> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/api/v4/user`, {
          headers: {
            'PRIVATE-TOKEN': this.config.accessToken,
          },
        })
      );

      if (!isGitLabUser(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get authenticated user: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<GitLabUser> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/api/v4/users?username=${username}`, {
          headers: {
            'PRIVATE-TOKEN': this.config.accessToken,
          },
        })
      );

      if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('User not found');
      }
      const user = response.data[0];
      if (!isGitLabUser(user)) {
        throw new Error('Invalid response format from GitLab API');
      }
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get user: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user projects
   */
  async getUserProjects(page = 1, perPage = 20): Promise<GitLabProject[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.config.baseUrl}/api/v4/projects?owned=true&pagination=keyset&per_page=${perPage}&page=${page}`,
          {
            headers: {
              'PRIVATE-TOKEN': this.config.accessToken,
            },
          }
        )
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }

      return response.data.filter((project): project is GitLabProject => isGitLabProject(project));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get projects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get project details
   */
  async getProject(projectId: number): Promise<GitLabProject> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/api/v4/projects/${projectId}`, {
          headers: {
            'PRIVATE-TOKEN': this.config.accessToken,
          },
        })
      );

      if (!isGitLabProject(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get project: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get project issues
   */
  async getIssues(
    projectId: number,
    state: 'opened' | 'closed' | 'all' = 'opened',
    page = 1,
    perPage = 20
  ): Promise<GitLabIssue[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/api/v4/projects/${projectId}/issues`, {
          params: {
            state,
            page,
            per_page: perPage,
          },
          headers: {
            'PRIVATE-TOKEN': this.config.accessToken,
          },
        })
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }

      return response.data.filter((issue): issue is GitLabIssue => isGitLabIssue(issue));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get issues: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create an issue
   */
  async createIssue(
    projectId: number,
    title: string,
    description?: string,
    labels?: string[]
  ): Promise<GitLabIssue> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/api/v4/projects/${projectId}/issues`,
          {
            title,
            description,
            labels: labels?.join(','),
          },
          {
            headers: {
              'PRIVATE-TOKEN': this.config.accessToken,
            },
          }
        )
      );

      if (!isGitLabIssue(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create issue: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get merge requests
   */
  async getMergeRequests(
    projectId: number,
    state: 'opened' | 'closed' | 'merged' | 'all' = 'opened',
    page = 1,
    perPage = 20
  ): Promise<GitLabMergeRequest[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/api/v4/projects/${projectId}/merge_requests`, {
          params: {
            state,
            page,
            per_page: perPage,
          },
          headers: {
            'PRIVATE-TOKEN': this.config.accessToken,
          },
        })
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }

      return response.data.filter((mr): mr is GitLabMergeRequest => isGitLabMergeRequest(mr));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get merge requests: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get project commits
   */
  async getCommits(projectId: number, page = 1, perPage = 20): Promise<GitLabCommit[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.config.baseUrl}/api/v4/projects/${projectId}/repository/commits`,
          {
            params: {
              page,
              per_page: perPage,
            },
            headers: {
              'PRIVATE-TOKEN': this.config.accessToken,
            },
          }
        )
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }

      return response.data.filter((commit): commit is GitLabCommit => isGitLabCommit(commit));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get commits: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create a webhook
   */
  async createWebhook(
    projectId: number,
    url: string,
    events: string[] = ['push_events', 'merge_requests_events', 'issues_events']
  ): Promise<GitLabWebhookResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/api/v4/projects/${projectId}/hooks`,
          {
            url,
            push_events: events.includes('push_events'),
            issues_events: events.includes('issues_events'),
            merge_requests_events: events.includes('merge_requests_events'),
            wiki_page_events: false,
            deployment_events: false,
            job_events: false,
            pipeline_events: false,
            token: this.config.webhookSecret || '',
          },
          {
            headers: {
              'PRIVATE-TOKEN': this.config.accessToken,
            },
          }
        )
      );

      if (!isGitLabWebhookResponse(response.data)) {
        throw new Error('Invalid response format from GitLab API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create webhook: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * List webhooks
   */
  async listWebhooks(projectId: number): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/api/v4/projects/${projectId}/hooks`, {
          headers: {
            'PRIVATE-TOKEN': this.config.accessToken,
          },
        })
      );

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list webhooks: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(projectId: number, hookId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.config.baseUrl}/api/v4/projects/${projectId}/hooks/${hookId}`,
          {
            headers: {
              'PRIVATE-TOKEN': this.config.accessToken,
            },
          }
        )
      );

      this.logger.log(`Webhook deleted: ${hookId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete webhook: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: number): Promise<{
    stars: number;
    forks: number;
    openIssues: number;
  }> {
    try {
      const project = await this.getProject(projectId);

      return {
        stars: project.star_count,
        forks: project.forks_count,
        openIssues: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get project stats: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
