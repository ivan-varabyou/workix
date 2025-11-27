import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import type {
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepository,
  GitHubUser,
  GitHubWebhookResponse,
} from '../types/github-api-types';
import {
  isGitHubCommit,
  isGitHubIssue,
  isGitHubPullRequest,
  isGitHubRepository,
  isGitHubUser,
  isGitHubWebhookResponse,
} from '../types/github-api-types';

@Injectable()
export class GitHubApiService {
  private readonly logger = new Logger(GitHubApiService.name);
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get authenticated user
   */
  async getAuthenticatedUser(token: string): Promise<GitHubUser> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!isGitHubUser(response.data)) {
        throw new Error('Invalid response format from GitHub API');
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
  async getUserByLogin(login: string): Promise<GitHubUser> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/users/${login}`, {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!isGitHubUser(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get user: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get user repositories
   */
  async getUserRepositories(token: string, page = 1, perPage = 30): Promise<GitHubRepository[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/user/repos`, {
          params: {
            page,
            per_page: perPage,
            sort: 'updated',
            direction: 'desc',
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }

      return response.data.filter((repo): repo is GitHubRepository => isGitHubRepository(repo));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get repositories: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/repos/${owner}/${repo}`, {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!isGitHubRepository(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get repository: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get issues for a repository
   */
  async getIssues(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    page = 1,
    perPage = 30
  ): Promise<GitHubIssue[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/repos/${owner}/${repo}/issues`, {
          params: {
            state,
            page,
            per_page: perPage,
          },
          headers: {
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }

      return response.data.filter((issue): issue is GitHubIssue => isGitHubIssue(issue));
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
    token: string,
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[]
  ): Promise<GitHubIssue> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.githubApiUrl}/repos/${owner}/${repo}/issues`,
          {
            title,
            body,
            labels,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
            },
          }
        )
      );

      if (!isGitHubIssue(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }

      return {
        ...response.data,
        repository: `${owner}/${repo}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create issue: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get pull requests
   */
  async getPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    page = 1,
    perPage = 30
  ): Promise<GitHubPullRequest[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/repos/${owner}/${repo}/pulls`, {
          params: {
            state,
            page,
            per_page: perPage,
          },
          headers: {
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }

      return response.data.filter((pr): pr is GitHubPullRequest => isGitHubPullRequest(pr));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get pull requests: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get commits
   */
  async getCommits(owner: string, repo: string, page = 1, perPage = 30): Promise<GitHubCommit[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/repos/${owner}/${repo}/commits`, {
          params: {
            page,
            per_page: perPage,
          },
          headers: {
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }

      return response.data.filter((commit): commit is GitHubCommit => isGitHubCommit(commit));
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
    token: string,
    owner: string,
    repo: string,
    url: string,
    events: string[] = ['push', 'pull_request', 'issues']
  ): Promise<GitHubWebhookResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.githubApiUrl}/repos/${owner}/${repo}/hooks`,
          {
            name: 'web',
            active: true,
            events,
            config: {
              url,
              content_type: 'json',
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
            },
          }
        )
      );

      if (!isGitHubWebhookResponse(response.data)) {
        throw new Error('Invalid response format from GitHub API');
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
  async listWebhooks(token: string, owner: string, repo: string): Promise<GitHubWebhookResponse[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.githubApiUrl}/repos/${owner}/${repo}/hooks`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        })
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from GitHub API');
      }
      return response.data.filter((webhook): webhook is GitHubWebhookResponse =>
        isGitHubWebhookResponse(webhook)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list webhooks: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(token: string, owner: string, repo: string, hookId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.githubApiUrl}/repos/${owner}/${repo}/hooks/${hookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        })
      );

      this.logger.log(`Webhook deleted: ${hookId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete webhook: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get repository insights (stars, forks, issues)
   */
  async getRepositoryInsights(
    owner: string,
    repo: string
  ): Promise<{
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
  }> {
    try {
      const repository = await this.getRepository(owner, repo);

      return {
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        openIssues: repository.open_issues_count,
        watchers: repository.watchers_count,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get repository insights: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
