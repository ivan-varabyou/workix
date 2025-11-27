import { Module } from '@nestjs/common';
import { VirtualWorkerService } from '@workix/domain/workers';
import { PrismaModule } from '@workix/infrastructure/prisma';

import { VirtualWorkerController } from './virtual-worker.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VirtualWorkerController],
  providers: [VirtualWorkerService],
  exports: [VirtualWorkerService],
})
export class WorkersModule {}
