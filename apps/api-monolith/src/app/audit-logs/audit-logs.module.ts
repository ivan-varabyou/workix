import { Module } from '@nestjs/common';
import { RBACModule } from '@workix/domain/rbac';
import { PrismaService } from '@workix/infrastructure/prisma';

import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [
    RBACModule.forRoot(PrismaService),
  ],
  controllers: [AuditLogsController],
})
export class AuditLogsModule {}
