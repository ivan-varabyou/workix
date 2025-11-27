import { Module } from '@nestjs/common';
import { WorkflowsModule as WorkixWorkflowsModule } from '@workix/domain/workflows';
import { PrismaService } from '@workix/backend/infrastructure/prisma';
import { AuthClientModule } from '@workix/backend/shared/core';

import { WorkflowEventsSubscriberService } from './workflow-events-subscriber.service';

// Create a wrapper class that satisfies the interface requirements
class WorkflowsPrismaService extends PrismaService {
  // PrismaService already has workflow and step methods from PrismaClient
  // The interfaces are satisfied by the actual Prisma schema
}

@Module({
  imports: [
    WorkixWorkflowsModule.forRoot({
      prismaService: new WorkflowsPrismaService(
        process.env.DATABASE_URL_WORKFLOWS ||
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5106/workix_workflows'
      ),
    }),
    AuthClientModule.forRoot(), // Для PubSubSubscriberService и JWT Guard
  ],
  // WorkflowController is provided by WorkixWorkflowsModule
  providers: [WorkflowEventsSubscriberService],
})
export class WorkflowsModule {}
