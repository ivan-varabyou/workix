import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WorkixAuthModule } from '@workix/domain/auth';
import { MessageBrokerModule } from '@workix/infrastructure/message-broker';
import { NotificationsDomainModule } from '@workix/domain/notifications';

import { PrismaModule } from './prisma/prisma.module';
import { AuthPrismaModule } from './prisma/auth-prisma.module';
import { PushSubscriptionController } from './controllers/push-subscription.controller';

/**
 * Notifications App Module
 * Main module for api-notifications microservice
 *
 * Hybrid service:
 * - HTTP API: Manages push notification subscriptions
 * - Worker: Processes notification events from Redis queue
 *
 * All business logic is in libs/domain/notifications
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule, // Для notifications БД
    AuthPrismaModule, // Для auth БД (для PushSubscription - чтение и запись)
    MessageBrokerModule, // @Global() module - provides BullModule.forRootAsync
    NotificationsDomainModule,
    WorkixAuthModule.forRoot(), // Для JwtGuard и CurrentUser
  ],
  controllers: [PushSubscriptionController],
})
export class AppModule {}
