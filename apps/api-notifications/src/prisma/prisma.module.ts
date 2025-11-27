import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@workix/infrastructure/prisma';

/**
 * Prisma Module for api-notifications
 *
 * This module provides PrismaService configured for notifications database.
 * Uses DATABASE_URL_NOTIFICATIONS (port 5201).
 *
 * Note: For PushSubscription access, use AuthPrismaModule which provides
 * separate Prisma client for auth database.
 */
@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useValue: process.env.DATABASE_URL_NOTIFICATIONS ||
                'postgresql://postgres:postgres@localhost:5201/workix_notifications',
    },
    {
      provide: PrismaService,
      useFactory: (databaseUrlOverride: string): PrismaService => {
        return new PrismaService(databaseUrlOverride);
      },
      inject: ['DATABASE_URL_OVERRIDE'],
    },
    {
      provide: 'PrismaService',
      useExisting: PrismaService,
    },
  ],
  exports: [PrismaService, 'PrismaService'],
})
export class PrismaModule {}
