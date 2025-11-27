import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Auth Prisma Module for api-notifications
 *
 * This module provides a separate Prisma client for accessing auth database.
 * Used for reading and writing PushSubscription records from auth database.
 *
 * Note: Push subscriptions are managed by api-notifications service (HTTP API).
 */
@Global()
@Module({
  providers: [
    {
      provide: 'AuthPrismaService',
      useFactory: (): PrismaClient => {
        const databaseUrl: string = globalThis.process?.env?.DATABASE_URL_AUTH ||
          'postgresql://postgres:postgres@localhost:5200/workix_auth';

        return new PrismaClient({
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        });
      },
    },
  ],
  exports: ['AuthPrismaService'],
})
export class AuthPrismaModule {}
