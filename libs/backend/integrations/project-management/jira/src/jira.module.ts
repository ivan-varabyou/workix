import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { JiraController } from './controllers/jira.controller';
import { JiraConfig } from './interfaces/jira-config.interface';
import { JiraPrismaService } from './interfaces/jira-prisma.interface';
import { JiraApiService } from './services/jira-api.service';
import { JiraEventsService } from './services/jira-events.service';
import { JiraIntegrationService } from './services/jira-integration.service';

@Module({
  imports: [HttpModule],
})
export class JiraModule {
  static forRoot(config: JiraConfig, prismaService?: JiraPrismaService): DynamicModule {
    return {
      module: JiraModule,
      imports: [HttpModule],
      providers: [
        {
          provide: 'JIRA_CONFIG',
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
        JiraApiService,
        JiraEventsService,
        JiraIntegrationService,
      ],
      controllers: [JiraController],
      exports: [JiraApiService, JiraEventsService, JiraIntegrationService],
    };
  }
}
