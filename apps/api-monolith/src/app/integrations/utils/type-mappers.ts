import { Prisma } from '@prisma/client';
import { BasePayload } from '@workix/integrations/core';

import { isRecord } from '../interfaces/integration-health.interface';
import {
  IntegrationEventMetadata,
  IntegrationEventWithProvider,
  IntegrationProviderWithEvents,
} from '../interfaces/integration-monitoring.interface';
import {
  EventWithMetadata,
  MetadataRecord,
  PrismaEventForMapping,
  PrismaProviderForMapping,
} from '../interfaces/type-mappers.interface';

/**
 * Type guard to check if status is valid
 */
function isValidStatus(status: string): status is 'SUCCESS' | 'FAILED' {
  return status === 'SUCCESS' || status === 'FAILED';
}

/**
 * Type guard to check if metadata is IntegrationEventMetadata
 */
function isIntegrationEventMetadata(metadata: unknown): metadata is IntegrationEventMetadata {
  if (!metadata || typeof metadata !== 'object' || metadata === null) {
    return false;
  }
  // Check if it's a plain object
  if (Array.isArray(metadata)) {
    return false;
  }
  // Check properties - metadata is already checked to be an object
  if (typeof metadata !== 'object' || metadata === null) {
    return false;
  }
  // Check if it's a Record with string keys
  if (!isRecord(metadata)) {
    return false;
  }
  const metadataRecord: MetadataRecord = metadata;
  const latencyMs: unknown = metadataRecord.latencyMs;
  const cost: unknown = metadataRecord.cost;
  const error: unknown = metadataRecord.error;
  const message: unknown = metadataRecord.message;

  const hasLatency: boolean = latencyMs === undefined || typeof latencyMs === 'number';
  const hasCost: boolean =
    cost === undefined || typeof cost === 'number' || typeof cost === 'string';
  const hasError: boolean = error === undefined || typeof error === 'string';
  const hasMessage: boolean = message === undefined || typeof message === 'string';

  return hasLatency && hasCost && hasError && hasMessage;
}

/**
 * Type guard to check if value is BasePayload
 */
function isBasePayload(value: unknown): value is BasePayload {
  if (!value || typeof value !== 'object' || value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  // BasePayload is a record with string keys and values that are string, number, boolean, Date, arrays, or nested objects
  // We can't fully validate all possible values, but we can check it's a plain object
  return true;
}

/**
 * Safely convert unknown to BasePayload
 * Uses JSON serialization to ensure type safety without type assertions
 */
function toBasePayload(value: unknown): BasePayload | null {
  if (!value || typeof value !== 'object' || value === null) {
    return null;
  }
  // Use JSON serialization to ensure type safety
  try {
    const serialized: string = JSON.stringify(value);
    const json: unknown = JSON.parse(serialized);
    // Validate that it's a plain object (not array, not null)
    if (isBasePayload(json)) {
      return json;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert Prisma IntegrationEvent to IntegrationEventWithProvider
 */
export function mapPrismaEventToIntegrationEvent(event: PrismaEventForMapping): IntegrationEventWithProvider {
  if (!isValidStatus(event.status)) {
    throw new Error(`Invalid status: ${event.status}`);
  }

  let metadata: IntegrationEventMetadata | null = null;
  if (event.metadata && isIntegrationEventMetadata(event.metadata)) {
    metadata = event.metadata;
  }

  return {
    id: event.id,
    providerId: event.providerId,
    eventType: event.eventType,
    status: event.status,
    error: event.error,
    metadata,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    provider: {
      id: event.provider.id,
      name: event.provider.name,
    },
  };
}

/**
 * Convert Prisma IntegrationProvider to IntegrationProviderWithEvents
 */
export function mapPrismaProviderToProviderWithEvents(provider: PrismaProviderForMapping): IntegrationProviderWithEvents {
  const config: BasePayload | null = toBasePayload(provider.config);
  const credentials: BasePayload | null = toBasePayload(provider.credentials);

  const events = provider.events.map((event) => {
    if (!isValidStatus(event.status)) {
      throw new Error(`Invalid status: ${event.status}`);
    }

    let metadata: IntegrationEventMetadata | null = null;
    if (event.metadata && isIntegrationEventMetadata(event.metadata)) {
      metadata = event.metadata;
    }

    return {
      id: event.id,
      providerId: event.providerId,
      eventType: event.eventType,
      status: event.status,
      error: event.error,
      metadata,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  });

  return {
    id: provider.id,
    name: provider.name,
    type: provider.type,
    config,
    credentials,
    isActive: provider.isActive,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
    events,
  };
}

/**
 * Get metadata from event, returning null if invalid
 */
export function getEventMetadata(event: EventWithMetadata): IntegrationEventMetadata | null {
  if (event.metadata && isIntegrationEventMetadata(event.metadata)) {
    return event.metadata;
  }
  return null;
}

/**
 * Safely convert Prisma JsonValue to BasePayload
 */
export function jsonValueToBasePayload(value: unknown): BasePayload | null {
  return toBasePayload(value);
}

/**
 * Type guard to check if value is valid Prisma InputJsonValue
 * Prisma InputJsonValue can be: string | number | boolean | null | JsonObject | JsonArray
 */
function isValidPrismaInputJsonValue(value: unknown): value is Prisma.InputJsonValue {
  if (value === null) {
    return true;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isValidPrismaInputJsonValue);
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isValidPrismaInputJsonValue);
  }
  return false;
}

/**
 * Convert BasePayload to Prisma JsonValue
 * Uses JSON serialization to ensure type safety
 * Returns a value that is compatible with Prisma's JsonValue type
 */
export function basePayloadToJsonValue(
  payload: BasePayload | null | undefined
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (!payload) {
    return Prisma.DbNull;
  }
  try {
    const serialized: string = JSON.stringify(payload);
    const json: unknown = JSON.parse(serialized);
    if (isValidPrismaInputJsonValue(json)) {
      return json;
    }
    return Prisma.DbNull;
  } catch {
    return Prisma.DbNull;
  }
}
