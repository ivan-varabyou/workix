import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@workix/backend/infrastructure/prisma';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useValue: globalThis.process?.env?.DATABASE_URL_INTEGRATIONS ||
                globalThis.process?.env?.DATABASE_URL ||
                'postgresql://postgres:postgres@localhost:5110/workix_integrations', // API 7110 → DB 5110
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

