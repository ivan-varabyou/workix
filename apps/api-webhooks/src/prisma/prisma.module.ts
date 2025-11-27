import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@workix/backend/infrastructure/prisma';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useValue: globalThis.process?.env?.DATABASE_URL_WEBHOOKS ||
                globalThis.process?.env?.DATABASE_URL ||
                'postgresql://postgres:postgres@localhost:5105/workix_webhooks', // API 7105 → DB 5105
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
