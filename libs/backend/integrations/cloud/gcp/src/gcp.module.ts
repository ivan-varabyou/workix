import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { GCPModuleConfig } from './interfaces/gcp-config.interface';
import { GCPPrismaService } from './interfaces/gcp-prisma.interface';

@Module({ imports: [HttpModule] })
export class GCPModule {
  static forRoot(config?: GCPModuleConfig, prismaService?: GCPPrismaService): DynamicModule {
    return {
      module: GCPModule,
      imports: [HttpModule],
      providers: [
        ...(config ? [{ provide: 'GCP_CONFIG', useValue: config }] : []),
        ...(prismaService ? [{ provide: 'PrismaService', useValue: prismaService }] : []),
      ],
      exports: [],
    };
  }
}
