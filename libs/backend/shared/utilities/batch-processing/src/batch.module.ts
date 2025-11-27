import { DynamicModule, Module } from '@nestjs/common';

import { BatchController } from './controllers/batch.controller';
import { BatchProcessingPrismaService } from './interfaces/batch-processing.interface';
import { BatchService } from './services/batch.service';

export interface BatchModuleOptions {
  prismaService?: BatchProcessingPrismaService;
}

@Module({})
export class BatchModule {
  static forRoot(options?: BatchModuleOptions): DynamicModule {
    return {
      module: BatchModule,
      controllers: [BatchController],
      providers: [
        BatchService,
        ...(options?.prismaService
          ? [
              {
                provide: 'PrismaService',
                useValue: options.prismaService,
              },
            ]
          : []),
      ],
      exports: [BatchService],
      global: true,
    };
  }
}
