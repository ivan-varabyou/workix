import { Module } from '@nestjs/common';
import { IntegrationCoreModule } from '@workix/integrations/core';
import { AuthClientModule } from '@workix/backend/shared/core';

import { IntegrationCrudController } from './integration-crud.controller';
import { IntegrationEventsSubscriberService } from './integration-events-subscriber.service';

@Module({
  imports: [
    IntegrationCoreModule,
    AuthClientModule.forRoot(), // For PubSubSubscriberService and JWT Guard
  ],
  controllers: [IntegrationCrudController],
  providers: [
    IntegrationEventsSubscriberService,
    // PrismaService is provided by PrismaModule (Global)
  ],
  exports: [],
})
export class IntegrationsModule {}

