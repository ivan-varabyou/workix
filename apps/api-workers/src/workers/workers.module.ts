import { Module } from '@nestjs/common';
import { VirtualWorkerService } from '@workix/backend/domain/workers';
import { PrismaService } from '@workix/backend/infrastructure/prisma';
import { AuthClientModule } from '@workix/backend/shared/core';

import { VirtualWorkerController } from './virtual-worker.controller';
import { WorkerEventsSubscriberService } from './worker-events-subscriber.service';

// Create a wrapper class that satisfies the interface requirements
class WorkersPrismaService extends PrismaService {
  // PrismaService already has virtualWorker and taskExecution methods from PrismaClient
  // The interfaces are satisfied by the actual Prisma schema
}

@Module({
  imports: [
    AuthClientModule.forRoot(), // Для PubSubSubscriberService и JWT Guard
  ],
  controllers: [VirtualWorkerController],
  providers: [
    {
      provide: 'PrismaService',
      useValue: new WorkersPrismaService(
        process.env.DATABASE_URL_WORKERS ||
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5107/workix_workers'
      ),
    },
    VirtualWorkerService,
    WorkerEventsSubscriberService,
  ],
  exports: [VirtualWorkerService],
})
export class WorkersModule {}
