import { Module } from '@nestjs/common';
import { PipelinesModule as WorkixPipelinesModule } from '@workix/domain/pipelines';
import { PrismaService } from '@workix/infrastructure/prisma';

import { PipelinesController } from './pipelines.controller';

// Create a wrapper class that satisfies the interface requirements
class PipelinesPrismaService extends PrismaService {
  // PrismaService already has pipeline and step methods from PrismaClient
  // The interfaces are satisfied by the actual Prisma schema
}

@Module({
  imports: [WorkixPipelinesModule.forRoot(PipelinesPrismaService)],
  controllers: [PipelinesController],
})
export class PipelinesModule {}
