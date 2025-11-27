import { DynamicModule, Module } from '@nestjs/common';

import { WebhookController } from './controllers/webhook.controller';
import { WebhookPrismaService } from './interfaces/webhook-prisma.interface';
import { WebhookService } from './services/webhook.service';

export interface WebhooksModuleOptions {
  prismaService?: WebhookPrismaService;
}

@Module({})
export class WebhooksModule {
  static forRoot(options?: WebhooksModuleOptions): DynamicModule {
    return {
      module: WebhooksModule,
      controllers: [WebhookController],
      providers: [
        WebhookService,
        ...(options?.prismaService
          ? [
              {
                provide: 'PrismaService',
                useValue: options.prismaService,
              },
            ]
          : []),
      ],
      exports: [WebhookService],
      global: true,
    };
  }
}
