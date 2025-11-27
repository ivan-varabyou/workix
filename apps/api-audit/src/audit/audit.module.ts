import { Module } from '@nestjs/common';
import { AuthClientModule } from '@workix/backend/shared/core';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditEventsSubscriberService } from './audit-events-subscriber.service';

@Module({
  imports: [
    AuthClientModule.forRoot(), // For PubSubSubscriberService and JWT Guard
  ],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditEventsSubscriberService,
  ],
  exports: [AuditService],
})
export class AuditModule {}
