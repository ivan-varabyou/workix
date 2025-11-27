// Telegram Prisma Service interfaces

import { TelegramIntegrationRecord } from './telegram-config.interface';

export interface TelegramIntegrationPrismaService {
  telegramIntegration: {
    create: (args: {
      data: Omit<TelegramIntegrationRecord, 'id' | 'createdAt' | 'updatedAt'>;
    }) => Promise<TelegramIntegrationRecord>;
    findFirst: (args: {
      where: { userId: string; isActive?: boolean };
    }) => Promise<TelegramIntegrationRecord | null>;
    update: (args: {
      where: { id: string };
      data: { isActive?: boolean };
    }) => Promise<TelegramIntegrationRecord>;
  };
}
