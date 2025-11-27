import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
// Временно отключены для диагностики
import { AICoreModule } from '@workix/ai/ai-core';
import { GenerationModule } from '@workix/ai/generation';
// import { WorkixAuthModule } from '@workix/domain/auth';
import { WebhooksModule } from '@workix/domain/webhooks';
import { WorkflowsModule } from '@workix/domain/workflows';
import { ApiKeysModule } from '@workix/infrastructure/api-keys';
// Временно отключено для диагностики
import { PrismaModule } from '@workix/infrastructure/prisma';
// import { IntegrationCoreModule } from '@workix/integrations/core';
// import { AuthClientModule } from '@workix/shared/backend/core';
// import { BatchModule as BatchProcessingModule } from '@workix/utilities/batch-processing';

// import { FileStorageModule } from '@workix/utilities/file-storage'; // TODO: Create this module
// import { DataValidationModule } from '@workix/utilities/data-validation'; // TODO: Create this module
// import { CustomScriptsModule } from '@workix/utilities/custom-scripts'; // TODO: Create this module
// import { MLIntegrationModule } from '@workix/ai/ml-integration'; // TODO: Create this module
// Integration modules are configured in IntegrationsModule, not here
// import { SlackModule as SlackIntegrationModule } from '@workix/integrations/communication/slack';
// import { GitHubModule as GitHubIntegrationModule } from '@workix/integrations/code/github';
// import { GitLabModule as GitLabIntegrationModule } from '@workix/integrations/code/gitlab';
// import { JiraModule as JiraIntegrationModule } from '@workix/integrations/project-management/jira';
// import { AwsModule as AWSIntegrationModule } from '@workix/integrations/cloud/aws';
// import { GCPIntegrationModule } from '@workix/integrations/cloud/gcp'; // TODO: Check exports
// import { AzureIntegrationModule } from '@workix/integrations/cloud/azure'; // TODO: Check exports
// import { SalesforceIntegrationModule } from '@workix/integrations/project-management/salesforce'; // TODO: Check exports
import { ABTestingModule } from './ab-testing/ab-testing.module';
// Local modules
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuditLogsModule } from './audit-logs/audit-logs.module';
// import { ExecutionsModule } from './executions/executions.module';
import { IntegrationsModule } from './integrations/integrations.module';
// import { PipelinesModule } from './pipelines/pipelines.module';
import { RbacModule } from './rbac/rbac.module';
// Users endpoints are in Auth API, not in monolith
// Monolith should use UserClientService to get user data via HTTP
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    // Configuration - MUST be first to ensure ConfigService is available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    // ШАГ 1: Включаем PrismaModule
    PrismaModule,

    // ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ДИАГНОСТИКИ
    // Будем включать по одному, чтобы найти проблемный модуль

    // ШАГ 1: Временно отключен AuthClientModule для диагностики
    // AuthClientModule.forRoot(),

    // // Auth - для взаимодействия с микросервисом auth
    // // WorkixAuthModule нужен для локальной проверки JWT
    // WorkixAuthModule.forRoot(),

    // // Core Services (modules with controllers)
    // // Users endpoints are in Auth API, not in monolith
    // PipelinesModule,
    // ExecutionsModule,
    // RbacModule,
    // AuditLogsModule,

    // Advanced Features
    // ШАГ 4: Включаем WebhooksModule
    WebhooksModule,
    // ШАГ 5: Включаем ApiKeysModule
    ApiKeysModule,
    // ШАГ 6: Включаем WorkflowsModule
    WorkflowsModule,
    // BatchProcessingModule.forRoot({}),
    // // FileStorageModule, // TODO: Create this module
    // // DataValidationModule, // TODO: Create this module
    // // CustomScriptsModule, // TODO: Create this module
    // // MLIntegrationModule, // TODO: Create this module

    // // Integrations
    // // Note: Integration modules require config, will be configured in IntegrationsModule
    // // SlackIntegrationModule.forRoot({ token: '' }), // Configured in IntegrationsModule
    // // GitHubIntegrationModule.forRoot({ token: '' }), // Configured in IntegrationsModule
    // // GitLabIntegrationModule.forRoot({ token: '' }), // Configured in IntegrationsModule
    // // JiraIntegrationModule.forRoot({ token: '' }), // Configured in IntegrationsModule
    // // AWSIntegrationModule.forRoot({}), // Configured in IntegrationsModule
    // // GCPIntegrationModule, // TODO: Check exports
    // // AzureIntegrationModule, // TODO: Check exports
    // // SalesforceIntegrationModule, // TODO: Check exports

    // AI Core & Generation
    // ШАГ 7: Включаем AICoreModule
    AICoreModule,
    // ШАГ 8: Включаем GenerationModule
    GenerationModule,

    // Universal Integrations Layer
    // ШАГ 11: Включаем IntegrationsModule
    IntegrationsModule,

    // // Workers
    // WorkersModule,

    // A/B Testing
    // ШАГ 10: Включаем ABTestingModule
    ABTestingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: (): ValidationPipe =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
        }),
    },
  ],
})
export class AppModule {}
