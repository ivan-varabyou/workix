import { Inject, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
// PrismaClient from generated Auth schema
// After running: npx prisma generate --schema=apps/api-auth/prisma/schema.prisma
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Custom Prisma client path
import { PrismaClient } from '../../../../node_modules/.prisma/client-auth';

/**
 * Auth Prisma Service
 * Prisma client for Auth database (workix_auth)
 */
@Injectable()
export class AuthPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Prisma model delegates are inherited from PrismaClient
  constructor(@Optional() @Inject('DATABASE_URL_OVERRIDE') databaseUrlOverride?: string) {
    super({
      datasources: {
        db: {
          url: databaseUrlOverride ||
            process.env.DATABASE_URL_AUTH ||
            'postgresql://postgres:postgres@localhost:5102/workix_auth',
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    // Connect lazily - don't block bootstrap
    this.$connect().then(() => {
      console.log('✅ Auth Prisma connected to database');
    }).catch((error: unknown) => {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.error('❌ Auth Prisma connection failed:', errorMessage);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
