import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  type AuditLogEventData,
  isAuditLogEventData,
  PubSubEvent,
  PubSubSubscriberService,
} from '@workix/backend/shared/core';

import { AuditService } from './audit.service';

/**
 * AuditEventsSubscriberService
 * Subscribes to audit.* events from API Gateway
 * and processes audit log operations asynchronously
 */
@Injectable()
export class AuditEventsSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(AuditEventsSubscriberService.name);

  constructor(
    private readonly pubSub: PubSubSubscriberService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to audit.* events
    await this.pubSub.subscribe('audit.*', async (event: PubSubEvent): Promise<void> => {
      await this.handleAuditEvent(event);
    });
    this.logger.log('Subscribed to audit.* events for audit log processing');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Unsubscribed from audit.* events');
  }

  private async handleAuditEvent(event: PubSubEvent): Promise<void> {
    try {
      const eventName: string = event.event;

      if (eventName === 'audit.log') {
        await this.handleLogRequest(event.data);
      } else {
        this.logger.debug(`Unknown audit event: ${eventName}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling audit event: ${errorMessage}`);
    }
  }

  private async handleLogRequest(data: unknown): Promise<void> {
    try {
      // Validate event data using type guard
      if (!isAuditLogEventData(data)) {
        this.logger.warn('Invalid audit log event data');
        return;
      }

      const logData: AuditLogEventData = data;

      if (!logData.action || !logData.entityType) {
        this.logger.warn('Missing action or entityType in audit log request');
        return;
      }

      this.logger.log(`Processing audit log request: ${logData.action} on ${logData.entityType} (taskId: ${logData.taskId})`);

      // Process audit log creation asynchronously
      await this.auditService.createAuditLog({
        userId: logData.userId,
        adminId: logData.adminId,
        action: logData.action,
        entityType: logData.entityType,
        resourceId: logData.resourceId,
        details: logData.details,
        changes: logData.changes,
        metadata: logData.metadata,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
      });

      this.logger.log(`Audit log created successfully (taskId: ${logData.taskId})`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process audit log request: ${errorMessage}`);
    }
  }
}

