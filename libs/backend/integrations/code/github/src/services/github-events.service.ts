import { Inject, Injectable, Logger } from '@nestjs/common';
import { isBasePayload } from '@workix/integrations/core';

import { GitHubWebhookPayload } from '../interfaces/github-config.interface';
import {
  GitHubPrismaService,
  GitHubReleaseCreateData,
  GitHubWorkflowRunCreateData,
} from '../interfaces/github-prisma.interface';

@Injectable()
export class GitHubEventsService {
  private readonly logger = new Logger(GitHubEventsService.name);

  constructor(@Inject('PrismaService') private prisma: GitHubPrismaService) {}

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const digest = 'sha256=' + hmac.digest('hex');
    return digest === signature;
  }

  /**
   * Handle GitHub webhook event
   */
  async handleWebhookEvent(payload: GitHubWebhookPayload): Promise<void> {
    const eventType = this.getEventType(payload);
    this.logger.log(`Received GitHub webhook event: ${eventType}`);

    try {
      switch (eventType) {
        case 'push':
          await this.handlePushEvent(payload);
          break;
        case 'pull_request':
          await this.handlePullRequestEvent(payload);
          break;
        case 'issues':
          await this.handleIssuesEvent(payload);
          break;
        case 'release':
          await this.handleReleaseEvent(payload);
          break;
        case 'workflow_run':
          await this.handleWorkflowRunEvent(payload);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to handle webhook event: ${errorMessage}`);
    }
  }

  /**
   * Get event type from payload
   */
  private getEventType(payload: GitHubWebhookPayload): string {
    if (payload.action && payload.issue) return 'issues';
    if (payload.action && payload.pull_request) return 'pull_request';
    if (payload.ref && payload.commits) return 'push';
    if (payload.action === 'released') return 'release';
    if (payload.workflow_run) return 'workflow_run';
    return 'unknown';
  }

  /**
   * Handle push event
   */
  private async handlePushEvent(payload: GitHubWebhookPayload): Promise<void> {
    this.logger.log(`Push event in ${payload.repository.full_name} on branch ${payload.ref}`);

    if (this.prisma?.githubEvent) {
      try {
        await this.prisma.githubEvent.create({
          data: {
            repository: payload.repository.full_name,
            eventType: 'push',
            branch: payload.ref ? payload.ref.split('/').pop() || null : null,
            commits: payload.commits?.length || 0,
            pushedBy: payload.pusher?.name || null,
            metadata: isBasePayload(payload)
              ? (payload as Record<
                  string,
                  | string
                  | number
                  | boolean
                  | string[]
                  | Date
                  | number[]
                  | Record<string, string | number | boolean>
                  | null
                  | undefined
                >)
              : null,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store push event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle pull request event
   */
  private async handlePullRequestEvent(payload: GitHubWebhookPayload): Promise<void> {
    const pr = payload.pull_request;
    if (!pr) {
      this.logger.warn('Pull request data is missing');
      return;
    }
    this.logger.log(
      `Pull request ${payload.action} in ${payload.repository.full_name} #${pr.number}`
    );

    if (this.prisma?.githubPullRequest) {
      try {
        await this.prisma.githubPullRequest.create({
          data: {
            repository: payload.repository.full_name,
            number: pr.number,
            title: pr.title,
            action: payload.action || '',
            author: pr.user?.login || '',
            state: pr.state,
            head: pr.head.ref,
            base: pr.base.ref,
            metadata: isBasePayload(payload)
              ? (payload as Record<
                  string,
                  | string
                  | number
                  | boolean
                  | string[]
                  | Date
                  | number[]
                  | Record<string, string | number | boolean>
                  | null
                  | undefined
                >)
              : null,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store PR event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle issues event
   */
  private async handleIssuesEvent(payload: GitHubWebhookPayload): Promise<void> {
    const issue = payload.issue;
    if (!issue) {
      return;
    }
    this.logger.log(`Issue ${payload.action} in ${payload.repository.full_name} #${issue.number}`);

    if (this.prisma?.githubIssue) {
      try {
        await this.prisma.githubIssue.create({
          data: {
            repository: payload.repository.full_name,
            number: issue.number,
            title: issue.title,
            action: payload.action || '',
            author: issue.user.login,
            state: issue.state,
            labels: issue.labels.map((l: { name: string; color: string }) => l.name).join(','),
            metadata: isBasePayload(payload)
              ? (payload as Record<
                  string,
                  | string
                  | number
                  | boolean
                  | string[]
                  | Date
                  | number[]
                  | Record<string, string | number | boolean>
                  | null
                  | undefined
                >)
              : null,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store issue event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle release event
   */
  private async handleReleaseEvent(payload: GitHubWebhookPayload): Promise<void> {
    const release = payload.release;
    if (!release) {
      return;
    }
    this.logger.log(
      `Release ${payload.action} in ${payload.repository.full_name}: ${release.tag_name}`
    );

    if (this.prisma?.githubRelease) {
      try {
        const releaseData: GitHubReleaseCreateData = {
          repository: payload.repository.full_name,
          tagName: release.tag_name,
          action: payload.action || '',
          author: release.author.login,
          isDraft: release.draft,
          isPrerelease: release.prerelease,
        };
        if (release.name !== undefined && release.name !== null) {
          releaseData.name = release.name;
        }
        if (release.published_at !== undefined && release.published_at !== null) {
          releaseData.publishedAt = release.published_at;
        }
        if (isBasePayload(payload)) {
          releaseData.metadata = payload as Record<
            string,
            | string
            | number
            | boolean
            | string[]
            | Date
            | number[]
            | Record<string, string | number | boolean>
            | undefined
          >;
        }
        await this.prisma.githubRelease.create({
          data: releaseData,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store release event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle workflow run event
   */
  private async handleWorkflowRunEvent(payload: GitHubWebhookPayload): Promise<void> {
    const workflowRun = payload.workflow_run;
    if (!workflowRun) {
      return;
    }
    this.logger.log(
      `Workflow ${workflowRun.conclusion} in ${payload.repository.full_name}: ${workflowRun.name}`
    );

    if (this.prisma?.githubWorkflowRun) {
      try {
        const workflowRunData: GitHubWorkflowRunCreateData = {
          repository: payload.repository.full_name,
          workflowName: workflowRun.name,
          status: workflowRun.status,
          runNumber: workflowRun.run_number,
          runId: workflowRun.id,
          createdAt: workflowRun.created_at,
          updatedAt: workflowRun.updated_at,
        };
        if (workflowRun.conclusion !== undefined && workflowRun.conclusion !== null) {
          workflowRunData.conclusion = workflowRun.conclusion;
        }
        if (workflowRun.head_branch !== undefined && workflowRun.head_branch !== null) {
          workflowRunData.branch = workflowRun.head_branch;
        }
        if (workflowRun.actor?.login !== undefined && workflowRun.actor.login !== null) {
          workflowRunData.actor = workflowRun.actor.login;
        }
        if (isBasePayload(payload)) {
          workflowRunData.metadata = payload as Record<
            string,
            | string
            | number
            | boolean
            | string[]
            | Date
            | number[]
            | Record<string, string | number | boolean>
            | undefined
          >;
        }
        await this.prisma.githubWorkflowRun.create({
          data: workflowRunData,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store workflow event: ${errorMessage}`);
      }
    }
  }

  /**
   * Get event history
   */
  async getEventHistory(repository: string, eventType?: string, limit = 100): Promise<any[]> {
    try {
      if (!this.prisma?.githubEvent) {
        return [];
      }

      const where: { repository: string; eventType?: string } = { repository };
      if (eventType) {
        where.eventType = eventType;
      }

      return await this.prisma.githubEvent.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to fetch event history: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Get repository statistics
   */
  async getRepositoryStats(repository: string): Promise<{
    repository: string;
    totalEvents: number;
    pushes: number;
    pullRequests: number;
    issues: number;
  } | null> {
    try {
      if (!this.prisma?.githubEvent) {
        return null;
      }

      const events = await this.prisma.githubEvent.count({
        where: { repository },
      });

      const pushes = await this.prisma.githubEvent.count({
        where: { repository, eventType: 'push' },
      });

      const pullRequests =
        (await this.prisma.githubPullRequest?.count?.({
          where: { repository },
        })) || 0;

      const issues =
        (await this.prisma.githubIssue?.count?.({
          where: { repository },
        })) || 0;

      return {
        repository,
        totalEvents: events,
        pushes,
        pullRequests,
        issues,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get repository stats: ${errorMessage}`);
      return null;
    }
  }
}
