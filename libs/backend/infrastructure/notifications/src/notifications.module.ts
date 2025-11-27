import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@workix/infrastructure/prisma';
import { I18nModule } from '@workix/infrastructure/i18n';

import { EmailNotificationService } from './services/email-notification.service';
import { PushNotificationService } from './services/push-notification.service';

@Module({
  imports: [ConfigModule, HttpModule, PrismaModule, I18nModule],
  providers: [EmailNotificationService, PushNotificationService],
  exports: [EmailNotificationService, PushNotificationService],
})
export class NotificationsModule {}
