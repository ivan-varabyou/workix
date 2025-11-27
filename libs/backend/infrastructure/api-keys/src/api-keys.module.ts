import { DynamicModule, Module } from '@nestjs/common';
import { I18nModule } from '@workix/infrastructure/i18n';

import { ApiKeyController } from './controllers/api-key.controller';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiKeyPrismaService } from './interfaces/api-key-prisma.interface';
import { ApiKeyService } from './services/api-key.service';

export interface ApiKeysModuleOptions {
  prismaService?: ApiKeyPrismaService;
}

@Module({})
export class ApiKeysModule {
  static forRoot(options?: ApiKeysModuleOptions): DynamicModule {
    return {
      module: ApiKeysModule,
      imports: [I18nModule],
      controllers: [ApiKeyController],
      providers: [
        ApiKeyService,
        ApiKeyGuard,
        ...(options?.prismaService
          ? [
              {
                provide: 'PrismaService',
                useValue: options.prismaService,
              },
            ]
          : []),
      ],
      exports: [ApiKeyService, ApiKeyGuard],
      global: true,
    };
  }
}
