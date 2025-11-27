/**
 * Prisma Service Interface
 * Интерфейс для типизации PrismaService с integrationProvider
 */

import { Prisma } from '@prisma/client';

/**
 * Тип для integrationProvider делегата из Prisma
 */
export interface IntegrationProviderDelegate {
  findMany: <T extends Prisma.IntegrationProviderFindManyArgs>(
    args?: T
  ) => Promise<Prisma.IntegrationProviderGetPayload<T>[]>;
  findUnique: <T extends Prisma.IntegrationProviderFindUniqueArgs>(
    args: T
  ) => Promise<Prisma.IntegrationProviderGetPayload<T> | null>;
  create: <T extends Prisma.IntegrationProviderCreateArgs>(
    args: T
  ) => Promise<Prisma.IntegrationProviderGetPayload<T>>;
  update: <T extends Prisma.IntegrationProviderUpdateArgs>(
    args: T
  ) => Promise<Prisma.IntegrationProviderGetPayload<T>>;
  delete: <T extends Prisma.IntegrationProviderDeleteArgs>(
    args: T
  ) => Promise<Prisma.IntegrationProviderGetPayload<T>>;
}

/**
 * Интерфейс для PrismaService с integrationProvider
 */
export interface PrismaServiceWithIntegrationProvider {
  integrationProvider: IntegrationProviderDelegate;
}
