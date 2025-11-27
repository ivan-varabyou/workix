import { Injectable, OnModuleDestroy, OnModuleInit, Inject, Optional } from '@nestjs/common';
// PrismaClient from @prisma/client (generated for Gateway schema)
// After running: npx prisma generate --schema=apps/api-gateway/prisma/schema.prisma
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Prisma client will be generated with Gateway models
import { PrismaClient } from '@prisma/client';

/**
 * Gateway Prisma Service
 * Prisma client for Gateway database (workix_gateway)
 */
@Injectable()
export class GatewayPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Optional() @Inject('DATABASE_URL_OVERRIDE') databaseUrlOverride?: string) {
    super({
      datasources: {
        db: {
          url: databaseUrlOverride ||
            process.env.DATABASE_URL_GATEWAY ||
            'postgresql://postgres:postgres@localhost:5000/workix_gateway',
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log('✅ Gateway Prisma connected to database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
