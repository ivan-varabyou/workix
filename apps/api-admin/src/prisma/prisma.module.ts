import { Global, Module } from '@nestjs/common';

import { AdminPrismaService } from './admin-prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL_OVERRIDE',
      useFactory: (): string => {
        const dbUrl: string = process.env.DATABASE_URL_ADMIN ||
                     process.env.DATABASE_URL ||
                     'postgresql://postgres:postgres@localhost:5100/workix_admin';
        console.log('🔌 Admin Prisma DB URL:', dbUrl.replace(/:[^:@]+@/, ':****@'));
        return dbUrl;
      },
    },
    {
      provide: AdminPrismaService,
      useFactory: (databaseUrlOverride: string): AdminPrismaService => {
        return new AdminPrismaService(databaseUrlOverride);
      },
      inject: ['DATABASE_URL_OVERRIDE'],
    },
    {
      provide: 'PrismaService',
      useExisting: AdminPrismaService,
    },
    {
      provide: 'IDatabaseService',
      useExisting: AdminPrismaService,
    },
    {
      provide: 'IDatabaseAdapter',
      useExisting: AdminPrismaService,
    },
  ],
  exports: [AdminPrismaService, 'PrismaService', 'IDatabaseService', 'IDatabaseAdapter'],
})
export class PrismaModule {}
