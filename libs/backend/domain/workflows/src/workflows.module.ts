import { DynamicModule, Module } from '@nestjs/common';

import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowPrismaService } from './interfaces/workflow-prisma.interface';
import { WorkflowService } from './services/workflow.service';

export interface WorkflowsModuleOptions {
  prismaService?: WorkflowPrismaService;
}

@Module({})
export class WorkflowsModule {
  static forRoot(options?: WorkflowsModuleOptions): DynamicModule {
    return {
      module: WorkflowsModule,
      controllers: [WorkflowController],
      providers: [
        WorkflowService,
        ...(options?.prismaService
          ? [
              {
                provide: 'PrismaService',
                useValue: options.prismaService,
              },
            ]
          : []),
      ],
      exports: [WorkflowService],
      global: true,
    };
  }
}
