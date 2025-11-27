import { Module } from '@nestjs/common';
import { GenerationModule as WorkixGenerationModule } from '@workix/ai/generation';
import { AuthClientModule } from '@workix/backend/shared/core';

import { GenerationEventsSubscriberService } from './generation-events-subscriber.service';

@Module({
  imports: [
    WorkixGenerationModule,
    AuthClientModule.forRoot(), // For PubSubSubscriberService and JWT Guard
  ],
  // GenerationController is provided by WorkixGenerationModule
  providers: [GenerationEventsSubscriberService],
})
export class GenerationModule {}

