import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
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
  ],
  exports: [PrismaService, 'PrismaService', 'IDatabaseService', 'IDatabaseAdapter'],
})
export class PrismaModule {}
