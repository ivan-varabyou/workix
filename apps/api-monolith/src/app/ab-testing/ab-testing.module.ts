import { Module } from '@nestjs/common';
import { PrismaModule } from '@workix/infrastructure/prisma';
import { ABTestingService } from '@workix/utilities/ab-testing';

import { ABTestingController } from './ab-testing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ABTestingController],
  providers: [ABTestingService],
  exports: [ABTestingService],
})
export class ABTestingModule {}
