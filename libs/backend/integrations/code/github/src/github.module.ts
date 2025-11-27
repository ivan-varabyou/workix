import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { GitHubController } from './controllers/github.controller';
import { GitHubConfig } from './interfaces/github-config.interface';
import { GitHubPrismaService } from './interfaces/github-prisma.interface';
import { GitHubApiService } from './services/github-api.service';
import { GitHubEventsService } from './services/github-events.service';
import { GitHubIntegrationService } from './services/github-integration.service';

@Module({
  imports: [HttpModule],
})
export class GitHubModule {
  static forRoot(config: GitHubConfig, prismaService?: GitHubPrismaService): DynamicModule {
    return {
      module: GitHubModule,
      imports: [HttpModule],
      providers: [
        {
          provide: 'GITHUB_CONFIG',
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
        GitHubApiService,
        GitHubEventsService,
        GitHubIntegrationService,
      ],
      controllers: [GitHubController],
      exports: [GitHubApiService, GitHubEventsService, GitHubIntegrationService],
    };
  }
}
