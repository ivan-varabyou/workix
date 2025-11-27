import { Module } from '@nestjs/common';
import { RBACModule as WorkixRBACModule } from '@workix/domain/rbac';
import { PrismaService } from '@workix/infrastructure/prisma';

import { RbacController } from './rbac.controller';

@Module({
  imports: [WorkixRBACModule.forRoot(PrismaService)],
  controllers: [RbacController],
})
export class RbacModule {}
