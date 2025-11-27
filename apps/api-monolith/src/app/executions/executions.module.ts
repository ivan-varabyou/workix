import { Module } from '@nestjs/common';
import { PipelinesModule } from '@workix/domain/pipelines';
import { PrismaService } from '@workix/infrastructure/prisma';

import { ExecutionsController } from './executions.controller';

@Module({
  imports: [
    PipelinesModule.forRoot(PrismaService),
  ],
  controllers: [ExecutionsController],
})
export class ExecutionsModule {}
