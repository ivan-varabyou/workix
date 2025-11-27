import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { SalesforceConfig } from './interfaces/salesforce-config.interface';
import { SalesforcePrismaService } from './interfaces/salesforce-prisma.interface';

@Module({ imports: [HttpModule] })
export class SalesforceModule {
  static forRoot(
    config?: SalesforceConfig,
    prismaService?: SalesforcePrismaService
  ): DynamicModule {
    return {
      module: SalesforceModule,
      imports: [HttpModule],
      providers: [
        ...(config ? [{ provide: 'SALESFORCE_CONFIG', useValue: config }] : []),
        ...(prismaService ? [{ provide: 'PrismaService', useValue: prismaService }] : []),
      ],
      exports: [],
    };
  }
}
