import { Module } from '@nestjs/common';
import { PipelinesModule } from '@workix/backend/domain/pipelines';
import { PrismaService } from '@workix/backend/infrastructure/prisma';
import { AuthClientModule } from '@workix/backend/shared/core';

import { ExecutionsController } from './executions.controller';
import { ExecutionsEventsSubscriberService } from './executions-events-subscriber.service';

@Module({
  imports: [
    PipelinesModule.forRoot(PrismaService),
    AuthClientModule.forRoot(), // Для PubSubSubscriberService и JWT Guard
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsEventsSubscriberService],
})
export class ExecutionsModule {}
