import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
// PrismaClient from generated Admin schema
// After running: npx prisma generate --schema=apps/api-admin/prisma/schema.prisma
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Custom Prisma client path
import { PrismaClient } from '../../../../node_modules/.prisma/client-admin';

/**
 * Admin Prisma Service
 * Prisma client for Admin database (workix_admin)
 */
@Injectable()
export class AdminPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Prisma model delegates are inherited from PrismaClient
  constructor(@Optional() @Inject('DATABASE_URL_OVERRIDE') databaseUrlOverride?: string) {
    super({
      datasources: {
        db: {
          url: databaseUrlOverride ||
            process.env.DATABASE_URL_ADMIN ||
            'postgresql://postgres:postgres@localhost:5100/workix_admin',
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    // Connect lazily - don't block bootstrap
    // Временно отключено для диагностики проблемы запуска
    // this.$connect().then(() => {
    //   console.log('✅ Admin Prisma connected to database');
    // }).catch((error: unknown) => {
    //   const errorMessage: string = error instanceof Error ? error.message : String(error);
    //   console.error('❌ Admin Prisma connection failed:', errorMessage);
    // });
    console.log('⚠️ Admin Prisma onModuleInit: connection temporarily disabled for debugging');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
