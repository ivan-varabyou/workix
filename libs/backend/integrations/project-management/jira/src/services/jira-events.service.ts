import { Inject, Injectable, Logger } from '@nestjs/common';

import { JiraWebhookPayload } from '../interfaces/jira-config.interface';
import {
  isJiraIssueCreatedPayload,
  isJiraIssueDeletedPayload,
  isJiraIssueUpdatedPayload,
  JiraChangelogItem,
  JiraIssueCreatedPayload,
  JiraIssueDeletedPayload,
  JiraIssueUpdatedPayload,
} from '../interfaces/jira-events.interface';
import {
  JiraEvent,
  JiraEventMetadata,
  JiraPrismaService,
} from '../interfaces/jira-prisma.interface';

@Injectable()
export class JiraEventsService {
  private readonly logger = new Logger(JiraEventsService.name);

  constructor(@Inject('PrismaService') private prisma: JiraPrismaService) {}

  /**
   * Handle Jira webhook event
   */
  async handleWebhookEvent(payload: JiraWebhookPayload): Promise<void> {
    const eventType = payload.webhookEvent;
    this.logger.log(`Received Jira webhook event: ${eventType}`);

    try {
      if (isJiraIssueCreatedPayload(payload)) {
        await this.handleIssueCreated(payload);
      } else if (isJiraIssueUpdatedPayload(payload)) {
        await this.handleIssueUpdated(payload);
      } else if (isJiraIssueDeletedPayload(payload)) {
        await this.handleIssueDeleted(payload);
      } else {
        this.logger.warn(`Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to handle webhook event: ${errorMessage}`);
    }
  }

  /**
   * Handle issue created event
   */
  private async handleIssueCreated(payload: JiraIssueCreatedPayload): Promise<void> {
    const issue = payload.issue;
    this.logger.log(`Issue created: ${issue.key}`);

    if (this.prisma?.jiraEvent) {
      try {
        const createData: {
          issueKey: string;
          issueId: string;
          eventType: string;
          summary: string;
          status: string;
          priority: string;
          project: string;
          reporter: string;
          metadata: JiraEventMetadata;
          assignee?: string;
        } = {
          issueKey: issue.key,
          issueId: issue.id,
          eventType: 'created',
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name ?? '',
          project: issue.fields.project.key,
          reporter: issue.fields.reporter?.displayName,
          metadata: this.convertPayloadToMetadata(payload),
        };
        if (issue.fields.assignee?.displayName !== undefined) {
          createData.assignee = issue.fields.assignee.displayName;
        }
        await this.prisma.jiraEvent.create({
          data: createData,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store issue created event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle issue updated event
   */
  private async handleIssueUpdated(payload: JiraIssueUpdatedPayload): Promise<void> {
    const issue = payload.issue;
    const changelog = payload.changelog;

    this.logger.log(`Issue updated: ${issue.key}`);

    if (this.prisma?.jiraEvent) {
      try {
        const changedFields: string =
          changelog?.items?.map((item: JiraChangelogItem) => item.field).join(',') ?? '';

        const createData: {
          issueKey: string;
          issueId: string;
          eventType: string;
          summary: string;
          status: string;
          priority: string;
          project: string;
          reporter: string;
          changedFields: string;
          metadata: JiraEventMetadata;
          assignee?: string;
        } = {
          issueKey: issue.key,
          issueId: issue.id,
          eventType: 'updated',
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name ?? '',
          project: issue.fields.project.key,
          reporter: issue.fields.reporter?.displayName,
          changedFields,
          metadata: this.convertPayloadToMetadata(payload),
        };
        if (issue.fields.assignee?.displayName !== undefined) {
          createData.assignee = issue.fields.assignee.displayName;
        }
        await this.prisma.jiraEvent.create({
          data: createData,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store issue updated event: ${errorMessage}`);
      }
    }
  }

  /**
   * Handle issue deleted event
   */
  private async handleIssueDeleted(payload: JiraIssueDeletedPayload): Promise<void> {
    const issue = payload.issue;
    this.logger.log(`Issue deleted: ${issue.key}`);

    if (this.prisma?.jiraEvent) {
      try {
        await this.prisma.jiraEvent.create({
          data: {
            issueKey: issue.key,
            issueId: issue.id,
            eventType: 'deleted',
            summary: issue.fields.summary,
            status: 'deleted',
            project: issue.fields.project.key,
            metadata: this.convertPayloadToMetadata(payload),
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error(`Failed to store issue deleted event: ${errorMessage}`);
      }
    }
  }

  /**
   * Get event history
   */
  async getEventHistory(projectKey: string, eventType?: string, limit = 100): Promise<JiraEvent[]> {
    try {
      if (!this.prisma?.jiraEvent) {
        return [];
      }

      const where: { project: string; eventType?: string } = { project: projectKey };
      if (eventType) {
        where.eventType = eventType;
      }

      return await this.prisma.jiraEvent.findMany({
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
  async getProjectStats(projectKey: string): Promise<{
    projectKey: string;
    totalEvents: number;
    created: number;
    updated: number;
    deleted: number;
  } | null> {
    try {
      if (!this.prisma?.jiraEvent) {
        return null;
      }

      const totalEvents = await this.prisma.jiraEvent.count({
        where: { project: projectKey },
      });

      const created = await this.prisma.jiraEvent.count({
        where: { project: projectKey, eventType: 'created' },
      });

      const updated = await this.prisma.jiraEvent.count({
        where: { project: projectKey, eventType: 'updated' },
      });

      const deleted = await this.prisma.jiraEvent.count({
        where: { project: projectKey, eventType: 'deleted' },
      });

      return {
        projectKey,
        totalEvents,
        created,
        updated,
        deleted,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get project stats: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Convert webhook payload to metadata format
   */
  private convertPayloadToMetadata(
    payload: JiraIssueCreatedPayload | JiraIssueUpdatedPayload | JiraIssueDeletedPayload
  ): JiraEventMetadata {
    const metadata: JiraEventMetadata = {};

    // Copy all properties except the ones we extract explicitly
    for (const key in payload) {
      if (
        key !== 'webhookEvent' &&
        key !== 'issue' &&
        key !== 'user' &&
        key !== 'changelog' &&
        key !== 'timestamp'
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
  private isValidMetadataValue(value: unknown): value is JiraEventMetadata[string] {
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
