import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

import { NotificationsModule as InfrastructureNotificationsModule } from '@workix/infrastructure/notifications';
import { EmailProcessor } from './processors/email.processor';
import { PushProcessor } from './processors/push.processor';
import { PushSubscriptionService } from './services/push-subscription.service';

/**
 * Notifications Domain Module
 * Provides email and push notification processing via Redis queue
 *
 * This module should be imported in api-notifications microservice
 *
 * Note: PrismaModule should be imported in the app module, not here,
 * to avoid conflicts with global modules
 */
@Module({
  imports: [
    ConfigModule,
    // MessageBrokerModule - НЕ нужен здесь, он уже @Global() и импортирован в app.module
    InfrastructureNotificationsModule,
    BullModule.registerQueue({
      name: 'notifications:email',
    }),
    BullModule.registerQueue({
      name: 'notifications:push',
    }),
  ],
  providers: [EmailProcessor, PushProcessor, PushSubscriptionService],
  // Не экспортируем процессоры - они должны использоваться только внутри модуля
  // Экспорт может вызывать дублирование регистрации обработчиков
  exports: [PushSubscriptionService],
})
export class NotificationsDomainModule {}
