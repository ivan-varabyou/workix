import { Injectable, OnModuleDestroy, OnModuleInit, Inject, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { IDatabaseService } from './database.interface';
import { WebhookDelegate, WebhookEventDelegate } from './prisma-webhook.interface';

/**
 * PrismaService
 * Implementation of IDatabaseService using Prisma ORM
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, IDatabaseService
{
  // Type assertion to satisfy IDatabaseAdapter interface
  declare webhook: WebhookDelegate;
  declare webhookEvent: WebhookEventDelegate;
  // integrationProvider and integrationEvent are already defined in PrismaClient
  // We don't need to redeclare them as they are accessors in the base class
  declare $connect: PrismaClient['$connect'];
  declare $disconnect: PrismaClient['$disconnect'];

  constructor(@Optional() @Inject('DATABASE_URL_OVERRIDE') databaseUrlOverride?: string) {
    super({
      datasources: {
        db: {
          url: databaseUrlOverride ||
            process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@localhost:5000/workix_monolith', // API 7000 → DB 5000
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    // Connect lazily in background to prevent blocking NestFactory.create()
    // Connection will be established on first query if not ready
    this.$connect().then(() => {
      console.log('✅ Prisma connected to database');
    }).catch((error) => {
      console.error('❌ Prisma connection failed:', error);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  getClient(): PrismaClient {
    return this;
  }
}
