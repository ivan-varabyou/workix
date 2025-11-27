import { Inject,Injectable, Logger, Optional  } from '@nestjs/common';
import { PubSubPublisherService } from '@workix/backend/shared/core';

/**
 * AuditEventsPublisherService
 * Publishes audit events to Redis Pub/Sub for other services to consume
 *
 * Events published:
 * - audit.log - General audit log events
 */
@Injectable()
export class AuditEventsPublisherService {
  private readonly logger = new Logger(AuditEventsPublisherService.name);

  constructor(
    @Optional() @Inject(PubSubPublisherService) private readonly pubSub?: PubSubPublisherService
  ) {}

  /**
   * Publish audit log event
   */
  async publishAuditLog(event: {
    adminId?: string;
    action: string;
    entityType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    if (!this.pubSub) {
      this.logger.debug('[PubSub not available] Would publish audit.log event');
      return;
    }

    try {
      await this.pubSub.publish('audit.*', 'audit.log', {
        ...event,
        timestamp: new Date().toISOString(),
      });
      this.logger.debug(`Published audit.log event: ${event.action}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to publish audit.log event: ${errorMessage}`);
      // Don't throw - audit logging should not break the main flow
    }
  }
}
