import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@workix/infrastructure/prisma';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useValue: globalThis.process?.env?.DATABASE_URL_AUTH ||
                globalThis.process?.env?.DATABASE_URL ||
                'postgresql://postgres:postgres@localhost:5200/workix_auth', // API 7200 → DB 5200 (change first digit: 7 → 5)
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
    {
      provide: 'IDatabaseService',
      useExisting: PrismaService,
    },
    {
      provide: 'IDatabaseAdapter',
      useExisting: PrismaService,
    },
  ] as const,
  exports: [PrismaService, 'PrismaService', 'IDatabaseService', 'IDatabaseAdapter'] as const,
})
export class PrismaModule {}
