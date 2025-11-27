import { Module } from '@nestjs/common';
import { PipelinesModule as WorkixPipelinesModule } from '@workix/backend/domain/pipelines';
import { PrismaService } from '@workix/backend/infrastructure/prisma';
import { AuthClientModule } from '@workix/backend/shared/core';

import { PipelineEventsSubscriberService } from './pipeline-events-subscriber.service';
import { PipelinesController } from './pipelines.controller';

// Create a wrapper class that satisfies the interface requirements
class PipelinesPrismaService extends PrismaService {
  // PrismaService already has pipeline and step methods from PrismaClient
  // The interfaces are satisfied by the actual Prisma schema
}

@Module({
  imports: [
    WorkixPipelinesModule.forRoot(PipelinesPrismaService),
    AuthClientModule.forRoot(), // Для PubSubSubscriberService и JWT Guard
  ],
  controllers: [PipelinesController],
  providers: [PipelineEventsSubscriberService],
})
export class PipelinesModule {}
