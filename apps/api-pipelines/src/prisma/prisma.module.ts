import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@workix/backend/infrastructure/prisma';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useValue: globalThis.process?.env?.DATABASE_URL_PIPELINES ||
                globalThis.process?.env?.DATABASE_URL ||
                'postgresql://postgres:postgres@localhost:5101/workix_monolith', // Pipelines use monolith DB for now
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
