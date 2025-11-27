import { DynamicModule, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { I18nModule } from '@workix/infrastructure/i18n';

import { ExecutionService } from './services/execution.service';
import { PipelineService } from './services/pipeline.service';

/**
 * PrismaService constructor type
 * Accepts any class that extends PrismaClient
 * The actual PrismaClient has all required methods, but with more complex types
 * Using PrismaClient directly to avoid type incompatibility
 */
export type PrismaServiceConstructor = new (...args: never[]) => PrismaClient;


/**
 * PipelinesModule
 * Provides pipeline management functionality
 *
 * Usage in your app module:
 * @Module({
 *   imports: [PipelinesModule.forRoot(PrismaService)],
 * })
 * export class AppModule {}
 */
@Module({})
export class PipelinesModule {
  static forRoot(PrismaServiceClass: PrismaServiceConstructor): DynamicModule {
    return {
      module: PipelinesModule,
      imports: [I18nModule],
      providers: [
        {
          provide: 'PrismaService',
          useClass: PrismaServiceClass,
        },
        PipelineService,
        ExecutionService,
      ],
      exports: [PipelineService, ExecutionService],
    };
  }
}
