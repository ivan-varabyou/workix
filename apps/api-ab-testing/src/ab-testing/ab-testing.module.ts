import { Module } from '@nestjs/common';
import { PrismaModule  } from '@workix/backend/infrastructure/prisma';
import { AuthClientModule } from '@workix/backend/shared/core';
import { ABTestingService } from '@workix/backend/domain/ab-testing';

import { ABTestEventsSubscriberService } from './ab-test-events-subscriber.service';
import { ABTestingController } from './ab-testing.controller';

@Module({
  imports: [
    PrismaModule,
    AuthClientModule.forRoot(), // Для PubSubSubscriberService и JWT Guard
  ],
  controllers: [ABTestingController],
  providers: [ABTestingService, ABTestEventsSubscriberService],
  exports: [ABTestingService],
})
export class ABTestingModule {}
