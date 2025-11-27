import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { GitLabController } from './controllers/gitlab.controller';
import { GitLabConfig } from './interfaces/gitlab-config.interface';
import { GitLabPrismaService } from './interfaces/gitlab-prisma.interface';
import { GitLabApiService } from './services/gitlab-api.service';
import { GitLabEventsService } from './services/gitlab-events.service';
import { GitLabIntegrationService } from './services/gitlab-integration.service';

@Module({
  imports: [HttpModule],
})
export class GitLabModule {
  static forRoot(config: GitLabConfig, prismaService?: GitLabPrismaService): DynamicModule {
    return {
      module: GitLabModule,
      imports: [HttpModule],
      providers: [
        {
          provide: 'GITLAB_CONFIG',
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
        GitLabApiService,
        GitLabEventsService,
        GitLabIntegrationService,
      ],
      controllers: [GitLabController],
      exports: [GitLabApiService, GitLabEventsService, GitLabIntegrationService],
    };
  }
}
