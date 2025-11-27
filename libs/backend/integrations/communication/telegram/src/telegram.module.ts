import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { TelegramController } from './controllers/telegram.controller';
import { TelegramConfig } from './interfaces/telegram-config.interface';
import { TelegramIntegrationPrismaService } from './interfaces/telegram-prisma.interface';
import { TelegramApiService } from './services/telegram-api.service';
import { TelegramEventsService } from './services/telegram-events.service';
import { TelegramIntegrationService } from './services/telegram-integration.service';

@Module({
  imports: [HttpModule],
})
export class TelegramModule {
  static forRoot(
    config: TelegramConfig,
    prismaService?: TelegramIntegrationPrismaService
  ): DynamicModule {
    return {
      module: TelegramModule,
      imports: [HttpModule],
      providers: [
        {
          provide: 'TELEGRAM_CONFIG',
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
        TelegramApiService,
        TelegramEventsService,
        TelegramIntegrationService,
      ],
      controllers: [TelegramController],
      exports: [TelegramApiService, TelegramEventsService, TelegramIntegrationService],
    };
  }
}
