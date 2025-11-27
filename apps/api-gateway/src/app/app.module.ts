import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProvider, ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';
import { PubSubPublisherService, PubSubSubscriberService } from '@workix/shared/backend/core';
import * as redisStore from 'cache-manager-redis-store';

import { PrismaModule } from '../prisma/prisma.module';
import { AppController } from './app.controller';
import { AbTestingController } from './controllers/ab-testing.controller';
import { AdminController } from './controllers/admin.controller';
import { AuditController } from './controllers/audit.controller';
import { AuthController } from './controllers/auth.controller';
import { ExecutionsController } from './controllers/executions.controller';
import { GenerationController } from './controllers/generation.controller';
import { IntegrationsController } from './controllers/integrations.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { PipelinesController } from './controllers/pipelines.controller';
import { RbacController } from './controllers/rbac.controller';
import { UsersController } from './controllers/users.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { WorkersController } from './controllers/workers.controller';
import { WorkflowsController } from './controllers/workflows.controller';
// Service-specific controllers provide full Swagger documentation
// They proxy requests to appropriate microservices via ProxyService
import { LoggerModule } from './logger/logger.module';
import { StructuredLoggerService } from './logger/structured-logger.service';
import { AuditEventsPublisherService } from './services/audit-events-publisher.service';
import { MicroserviceClientService } from './services/microservice-client.service';
import { ProxyService } from './services/proxy.service';
import { ServiceRoutingService } from './services/service-routing.service';
import { UserEventsSubscriberService } from './services/user-events-subscriber.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    HttpModule.register({ timeout: 10000, maxRedirects: 5 }),
    PrismaModule,
    // NestJS Microservices clients for Kafka/Redis transport
    // According to NestJS documentation: https://docs.nestjs.com/microservices/basics
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService): ClientProvider => {
          const transport: string = configService.get<string>('MICROSERVICES_TRANSPORT') || 'redis';
          const redisHost: string = configService.get<string>('REDIS_HOST') || 'localhost';
          const redisPort: number = configService.get<number>('REDIS_PORT') || 5900;
          const kafkaBrokers: string = configService.get<string>('KAFKA_BROKERS') || 'localhost:9092';

          if (transport === 'kafka') {
            return {
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId: 'api-gateway',
                  brokers: kafkaBrokers.split(','),
                },
                consumer: {
                  groupId: 'api-gateway-consumer',
                },
              },
            } as ClientProvider;
          }

          // Default: Redis transport
          return {
            transport: Transport.REDIS,
            options: {
              host: redisHost,
              port: redisPort,
              password: configService.get<string>('REDIS_PASSWORD'),
            },
          } as ClientProvider;
        },
        inject: [ConfigService],
      },
      {
        name: 'ADMIN_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService): ClientProvider => {
          const transport: string = configService.get<string>('MICROSERVICES_TRANSPORT') || 'redis';
          const redisHost: string = configService.get<string>('REDIS_HOST') || 'localhost';
          const redisPort: number = configService.get<number>('REDIS_PORT') || 5900;
          const kafkaBrokers: string = configService.get<string>('KAFKA_BROKERS') || 'localhost:9092';

          if (transport === 'kafka') {
            return {
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId: 'api-gateway-admin',
                  brokers: kafkaBrokers.split(','),
                },
                consumer: {
                  groupId: 'api-gateway-admin-consumer',
                },
              },
            } as ClientProvider;
          }

          return {
            transport: Transport.REDIS,
            options: {
              host: redisHost,
              port: redisPort,
              password: configService.get<string>('REDIS_PASSWORD'),
            },
          } as ClientProvider;
        },
        inject: [ConfigService],
      },
    ]),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 20, // 20 requests per 15 minutes
      },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): { store: unknown; host: string; port: number; password?: string; db: number } => {
        const redisHost: string = configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort: number = configService.get<number>('REDIS_PORT') || 5900;
        const redisPassword: string | undefined = configService.get<string>('REDIS_PASSWORD');
        const redisDb: number = configService.get<number>('REDIS_DB') || 1; // Use DB 1 for tokens (DB 0 for queues)

        const config: { store: unknown; host: string; port: number; password?: string; db: number } = {
          store: redisStore,
          host: redisHost,
          port: redisPort,
          db: redisDb,
        };

        if (redisPassword) {
          config.password = redisPassword;
        }

        return config;
      },
      isGlobal: true,
    }),
  ],
  controllers: [
    // Service-specific controllers - provide full Swagger documentation
    // All requests are proxied to appropriate microservices via ProxyService
    AuthController, // Authentication endpoints (proxies to api-auth:7102)
    UsersController, // User endpoints (proxies to api-auth:7102)
    NotificationsController, // Push subscription endpoints (proxies to api-notifications:7103)
    PipelinesController, // Pipeline endpoints (proxies to api-pipelines:7104)
    ExecutionsController, // Execution endpoints (proxies to api-pipelines:7104)
    RbacController, // RBAC endpoints (proxies to api-auth:7102)
    AdminController, // Admin endpoints (proxies to api-admin:7100)
    WebhooksController, // Webhook endpoints (proxies to api-webhooks:7105)
    WorkflowsController, // Workflow endpoints (proxies to api-workflows:7106)
    WorkersController, // Worker endpoints (proxies to api-workers:7107)
    AbTestingController, // A/B Testing endpoints (proxies to api-ab-testing:7108)
    AuditController, // Audit log endpoints (proxies to api-audit:7109)
    IntegrationsController, // Integration endpoints (proxies to api-integrations:7110)
    GenerationController, // AI Generation endpoints (proxies to api-generation:7111)
    // Fallback proxy controller - MUST be last to catch unmatched requests
    AppController, // Universal proxy for any other requests (wildcard route)
  ],
  providers: [
    ProxyService,
    // ServiceRoutingService is needed for ProxyService to route requests
    ServiceRoutingService,
    StructuredLoggerService,
    PubSubPublisherService,
    PubSubSubscriberService,
    UserEventsSubscriberService,
    AuditEventsPublisherService,
    // NestJS microservices client service (Kafka/Redis transport)
    MicroserviceClientService,
  ],
})
export class AppModule {}
