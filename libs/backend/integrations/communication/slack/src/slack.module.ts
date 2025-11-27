import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { SlackController } from './controllers/slack.controller';
import { SlackConfig } from './interfaces/slack-config.interface';
import { SlackPrismaService } from './interfaces/slack-prisma.interface';
import { SlackApiService } from './services/slack-api.service';
import { SlackEventsService } from './services/slack-events.service';
import { SlackIntegrationService } from './services/slack-integration.service';

@Module({
  imports: [HttpModule],
})
export class SlackModule {
  static forRoot(config: SlackConfig, prismaService?: SlackPrismaService): DynamicModule {
    return {
      module: SlackModule,
      imports: [HttpModule],
      providers: [
        {
          provide: 'SLACK_CONFIG',
          useValue: config,
        },
        ...(prismaService
          ? [
              {
                provide: 'PrismaService',
                useValue: prismaService,
              },
            ]
          : []),
        SlackApiService,
        SlackEventsService,
        SlackIntegrationService,
      ],
      controllers: [SlackController],
      exports: [SlackApiService, SlackEventsService, SlackIntegrationService],
    };
  }
}
