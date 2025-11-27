import { Injectable, Logger, Optional } from '@nestjs/common';

import { IntegrationEventPrismaService } from '../interfaces/integration-event.interface';
import { BasePayload } from '../interfaces/integration-payload.interface';

@Injectable()
export class IntegrationEventLoggerService {
  private readonly logger = new Logger(IntegrationEventLoggerService.name);

  constructor(@Optional() private readonly prisma?: IntegrationEventPrismaService) {}

  /**
   * Logs an integration event to the database
   */
  async logEvent(
    providerId: string,
    type: string,
    status: 'SUCCESS' | 'FAILED',
    options?: {
      latencyMs?: number;
      cost?: number;
      metadata?: BasePayload;
    }
  ) {
    if (!this.prisma) {
      this.logger.debug('PrismaService not available, skipping event log');
      return;
    }

    try {
      const eventData: {
        providerId: string;
        type: string;
        status: 'SUCCESS' | 'FAILED';
        metadata: BasePayload;
        latencyMs?: number;
        cost?: number;
      } = {
        providerId,
        type,
        status,
        metadata: options?.metadata || {},
      };
      if (options?.latencyMs !== undefined) {
        eventData.latencyMs = options.latencyMs;
      }
      if (options?.cost !== undefined) {
        eventData.cost = options.cost;
      }
      await this.prisma.integrationEvent.create({
        data: eventData,
      });
    } catch (error) {
      this.logger.error('Failed to log integration event:', error);
    }
  }

  /**
   * Logs a successful integration call
   */
  async logSuccess(
    providerId: string,
    operation: string,
    latencyMs: number,
    cost?: number,
    metadata?: BasePayload
  ) {
    const options: {
      latencyMs: number;
      cost?: number;
      metadata?: BasePayload;
    } = {
      latencyMs,
    };
    if (cost !== undefined) {
      options.cost = cost;
    }
    if (metadata !== undefined) {
      options.metadata = metadata;
    }
    return this.logEvent(providerId, operation, 'SUCCESS', options);
  }

  /**
   * Logs a failed integration call
   */
  async logFailure(
    providerId: string,
    operation: string,
    error: Error | string,
    latencyMs?: number,
    metadata?: BasePayload
  ) {
    const errorMetadata: BasePayload = {
      ...metadata,
      error: error instanceof Error ? error.message : error,
    };
    if (error instanceof Error && error.stack !== undefined) {
      errorMetadata.stack = error.stack;
    }
    const options: {
      latencyMs?: number;
      metadata: BasePayload;
    } = {
      metadata: errorMetadata,
    };
    if (latencyMs !== undefined) {
      options.latencyMs = latencyMs;
    }
    return this.logEvent(providerId, operation, 'FAILED', options);
  }
}
