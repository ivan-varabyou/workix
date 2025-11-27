/**
 * Prisma Integration Types
 * Правильные типы для Prisma IntegrationProvider и IntegrationEvent
 */

import { Prisma } from '@prisma/client';

/**
 * IntegrationProvider с events из Prisma
 */
export type PrismaIntegrationProviderWithEvents = Prisma.IntegrationProviderGetPayload<{
  include: { events: true };
}>;

/**
 * IntegrationProvider без events из Prisma
 */
export type PrismaIntegrationProvider = Prisma.IntegrationProviderGetPayload<{}>;

/**
 * IntegrationEvent из Prisma
 */
export type PrismaIntegrationEvent = Prisma.IntegrationEventGetPayload<{}>;

/**
 * IntegrationEvent из Prisma в составе IntegrationProvider
 */
export type PrismaIntegrationEventInProvider = PrismaIntegrationProviderWithEvents['events'][number];

/**
 * Type guard для проверки статуса события
 */
export function isValidEventStatus(status: string): status is 'SUCCESS' | 'FAILED' {
  return status === 'SUCCESS' || status === 'FAILED';
}
