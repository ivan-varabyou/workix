import { Inject, Injectable, Logger } from '@nestjs/common';

import { GitLabWebhookPayload } from '../interfaces/gitlab-config.interface';
import {
  GitLabEvent,
  GitLabEventCreateData,
  GitLabEventMetadata,
  GitLabPrismaService,
} from '../interfaces/gitlab-prisma.interface';

@Injectable()
export class GitLabEventsService {
  private readonly logger = new Logger(GitLabEventsService.name);

  constructor(@Inject('PrismaService') private prisma: GitLabPrismaService) {}

  /**
   * Verify webhook token
   */
  verifyWebhookToken(token: string, expectedToken: string): boolean {
    return token === expectedToken;
  }

  /**
   * Handle GitLab webhook event
   */
  async handleWebhookEvent(payload: GitLabWebhookPayload): Promise<void> {
    const eventType = payload.object_kind || payload.event_name;
    this.logger.log(`Received GitLab webhook event: ${eventType}`);

    try {
      switch (eventType) {
        case 'push':
          await this.handlePushEvent(payload);
          break;
        case 'merge_request':
          await this.handleMergeRequestEvent(payload);
          break;
        case 'issues':
          await this.handleIssuesEvent(payload);
          break;
        case 'release':
          await this.handleReleaseEvent(payload);
          break;
        case 'pipeline':
          await this.handlePipelineEvent(payload);
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
   * Handle push event
   */
  private async handlePushEvent(payload: GitLabWebhookPayload): Promise<void> {
    this.logger.log(
      `Push event in ${payload.project.path_with_namespace} on branch ${payload.ref}`
    );

    if (this.prisma?.gitlabEvent) {
      try {
        const branch = payload.ref ? payload.ref.split('/').pop() : undefined;
        const eventData: GitLabEventCreateData = {
          project: payload.project.path_with_namespace,
          projectId: payload.project.id,
          eventType: 'push',
          branch: branch || '',
          commits: payload.commits?.length || 0,
          metadata: this.convertPayloadToMetadata(payload),
        };
        if (payload.user_username !== undefined) {
          eventData.pushedBy = payload.user_username;
        }
        await this.prisma.gitlabEvent.create({
          data: eventData,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store push event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle merge request event
   */
  private async handleMergeRequestEvent(payload: GitLabWebhookPayload): Promise<void> {
    const mr = payload.object_attributes;
    if (!mr) {
      this.logger.warn('Merge request data is missing');
      return;
    }
    this.logger.log(
      `Merge request ${mr.action} in ${payload.project.path_with_namespace} !${mr.iid}`
    );

    if (this.prisma?.gitlabMergeRequest) {
      try {
        await this.prisma.gitlabMergeRequest.create({
          data: {
            project: payload.project.path_with_namespace,
            projectId: payload.project.id,
            iid: mr.iid ?? 0,
            title: mr.title ?? '',
            action: mr.action ?? '',
            author: payload.user?.username ?? '',
            state: mr.state ?? '',
            sourceBranch: mr.source_branch ?? '',
            targetBranch: mr.target_branch ?? '',
            metadata: this.convertPayloadToMetadata(payload),
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store MR event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle issues event
   */
  private async handleIssuesEvent(payload: GitLabWebhookPayload): Promise<void> {
    const issue = payload.object_attributes;
    if (!issue) {
      this.logger.warn('Issue data is missing');
      return;
    }
    this.logger.log(
      `Issue ${issue.action} in ${payload.project.path_with_namespace} #${issue.iid}`
    );

    if (this.prisma?.gitlabIssue) {
      try {
        await this.prisma.gitlabIssue.create({
          data: {
            project: payload.project.path_with_namespace,
            projectId: payload.project.id,
            iid: issue.iid ?? 0,
            title: issue.title ?? '',
            action: issue.action ?? '',
            author: payload.user?.username ?? '',
            state: issue.state ?? '',
            labels: this.formatLabels(issue),
            metadata: this.convertPayloadToMetadata(payload),
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
  private async handleReleaseEvent(payload: GitLabWebhookPayload): Promise<void> {
    const release = payload.object_attributes;
    if (!release) {
      this.logger.warn('Release data is missing');
      return;
    }
    this.logger.log(
      `Release ${payload.action} in ${payload.project.path_with_namespace}: ${release.tag}`
    );

    if (this.prisma?.gitlabRelease) {
      try {
        await this.prisma.gitlabRelease.create({
          data: {
            project: payload.project.path_with_namespace,
            projectId: payload.project.id,
            tag: release.tag ?? '',
            name: release.name ?? '',
            action: payload.action ?? '',
            author: payload.user?.username ?? '',
            description: release.description ?? '',
            createdAt: release.created_at ?? '',
            metadata: this.convertPayloadToMetadata(payload),
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store release event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle pipeline event
   */
  private async handlePipelineEvent(payload: GitLabWebhookPayload): Promise<void> {
    const pipeline = payload.object_attributes;
    if (!pipeline || pipeline.id === undefined || !pipeline.status || !pipeline.created_at) {
      return;
    }
    this.logger.log(`Pipeline ${pipeline.status} in ${payload.project.path_with_namespace}`);

    if (this.prisma?.gitlabPipeline) {
      try {
        await this.prisma.gitlabPipeline.create({
          data: {
            project: payload.project.path_with_namespace,
            projectId: payload.project.id,
            pipelineId: pipeline.id,
            status: pipeline.status,
            ref: pipeline.ref || null,
            sha: pipeline.sha || null,
            duration: pipeline.duration || null,
            createdAt: pipeline.created_at,
            finishedAt: pipeline.finished_at || null,
            metadata: this.convertPayloadToMetadata(payload),
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store pipeline event: ${errorMessage}`);
      }
    }
  }

  /**
   * Get event history
   */
  async getEventHistory(
    projectId: number,
    eventType?: string,
    limit = 100
  ): Promise<GitLabEvent[]> {
    try {
      if (!this.prisma?.gitlabEvent) {
        return [];
      }

      const where: { projectId: number; eventType?: string } = { projectId };
      if (eventType) {
        where.eventType = eventType;
      }

      return await this.prisma.gitlabEvent.findMany({
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
   * Get project statistics
   */
  async getProjectStats(projectId: number): Promise<{
    projectId: number;
    totalEvents: number;
    pushes: number;
    mergeRequests: number;
    issues: number;
  } | null> {
    try {
      if (!this.prisma?.gitlabEvent) {
        return null;
      }

      const events = await this.prisma.gitlabEvent.count({
        where: { projectId },
      });

      const pushes = await this.prisma.gitlabEvent.count({
        where: { projectId, eventType: 'push' },
      });

      const mergeRequests =
        (await this.prisma.gitlabMergeRequest?.count?.({
          where: { projectId },
        })) || 0;

      const issues =
        (await this.prisma.gitlabIssue?.count?.({
          where: { projectId },
        })) || 0;

      return {
        projectId,
        totalEvents: events,
        pushes,
        mergeRequests,
        issues,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get project stats: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Format labels from issue object attributes
   */
  private formatLabels(issue: GitLabWebhookPayload['object_attributes']): string {
    if (!issue) {
      return '';
    }

    const labelsValue: unknown = issue['labels'];
    if (Array.isArray(labelsValue)) {
      return labelsValue.join(',');
    }
    if (typeof labelsValue === 'string') {
      return labelsValue;
    }
    return '';
  }

  /**
   * Convert webhook payload to metadata format
   */
  private convertPayloadToMetadata(payload: GitLabWebhookPayload): GitLabEventMetadata {
    const metadata: GitLabEventMetadata = {};

    // Copy all properties except the ones we extract explicitly
    for (const key in payload) {
      if (
        key !== 'object_kind' &&
        key !== 'event_name' &&
        key !== 'project' &&
        key !== 'user' &&
        key !== 'object_attributes' &&
        key !== 'commits' &&
        key !== 'ref'
      ) {
        const value: unknown = payload[key];
        if (this.isValidMetadataValue(value)) {
          metadata[key] = value;
        }
      }
    }

    return metadata;
  }

  /**
   * Type guard to check if value is valid for metadata
   */
  private isValidMetadataValue(value: unknown): value is GitLabEventMetadata[string] {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null ||
      value === undefined ||
      value instanceof Date ||
      Array.isArray(value) ||
      (typeof value === 'object' && value !== null)
    );
  }
}
