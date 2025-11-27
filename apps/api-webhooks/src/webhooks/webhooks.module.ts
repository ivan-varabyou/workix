import { Module } from '@nestjs/common';
import { WebhooksModule as WorkixWebhooksModule } from '@workix/domain/webhooks';
import { PrismaService } from '@workix/backend/infrastructure/prisma';
import { AuthClientModule } from '@workix/backend/shared/core';

import { WebhookEventsSubscriberService } from './webhook-events-subscriber.service';

// Create a wrapper class that satisfies the interface requirements
class WebhooksPrismaService extends PrismaService {
  // PrismaService already has webhook and step methods from PrismaClient
  // The interfaces are satisfied by the actual Prisma schema
}

@Module({
  imports: [
    WorkixWebhooksModule.forRoot({
      prismaService: new WebhooksPrismaService(
        process.env.DATABASE_URL_WEBHOOKS ||
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5105/workix_webhooks'
      ),
    }),
    AuthClientModule.forRoot(), // Для PubSubSubscriberService и JWT Guard
  ],
  // WebhookController is provided by WorkixWebhooksModule
  providers: [WebhookEventsSubscriberService],
})
export class WebhooksModule {}
