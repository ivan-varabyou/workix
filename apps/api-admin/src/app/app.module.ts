import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { WorkixAdminModule } from '@workix/backend/domain/admin';

import { PrismaModule } from '../prisma/prisma.module';

/**
 * API Admin App Module
 * Uses WorkixAdminModule from @workix/backend/domain/admin library
 * Similar structure to api-auth using WorkixAuthModule
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, // ✅ Базовый модуль с AdminPrismaService и адаптером (@Global)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'long',
        ttl: 900000,
        limit: 20,
      },
    ]), // ✅ ThrottlerModule для rate limiting
    // WorkixAdminModule - PrismaService будет разрешен из глобального PrismaModule
    WorkixAdminModule.forRoot({
      // prismaService не передаем - используем глобальный PrismaService из PrismaModule
      enableTokenCache: true, // Включить кэширование токенов в Redis
      redisConfig: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '5900', 10),
        ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
        db: parseInt(process.env.REDIS_DB || '1', 10),
      },
    }), // ✅ WorkixAdminModule с библиотечной реализацией
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
