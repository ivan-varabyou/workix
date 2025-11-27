import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { AzureConfig } from './interfaces/azure-config.interface';
import { AzurePrismaService } from './interfaces/azure-prisma.interface';

@Module({ imports: [HttpModule] })
export class AzureModule {
  static forRoot(config?: AzureConfig, prismaService?: AzurePrismaService): DynamicModule {
    return {
      module: AzureModule,
      imports: [HttpModule],
      providers: [
        ...(config ? [{ provide: 'AZURE_CONFIG', useValue: config }] : []),
        ...(prismaService ? [{ provide: 'PrismaService', useValue: prismaService }] : []),
      ],
      exports: [],
    };
  }
}
