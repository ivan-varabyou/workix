import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@workix/backend/infrastructure/prisma';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useValue: globalThis.process?.env?.DATABASE_URL_AB_TESTING ||
                globalThis.process?.env?.DATABASE_URL ||
                'postgresql://postgres:postgres@localhost:5108/workix_ab_testing', // API 7108 → DB 5108
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
