import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { PasswordService } from '@workix/backend/domain/auth';
import type { StringValue } from 'ms';

import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthSimpleController } from './controllers/admin-auth-simple.controller';
import { EndpointWhitelistController } from './controllers/endpoint-whitelist.controller';
import { HealthController } from './controllers/health.controller';
import { ServiceRoutingController } from './controllers/service-routing.controller';
import { AdminAuthLocalService } from './services/admin-auth-local.service';
import { EndpointWhitelistService } from './services/endpoint-whitelist.service';
import { ServiceRoutingService } from './services/service-routing.service';

/**
 * Диагностика по шагам
 * ✅ Шаг 1: ConfigModule + PrismaModule + HealthController - РАБОТАЕТ
 * ✅ Шаг 2: ThrottlerModule - РАБОТАЕТ
 * ✅ Шаг 3: WorkixAdminModule - РАБОТАЕТ
 * 🔄 Шаг 4: Добавляем AdminAuthController
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, // ✅ Базовый модуль
    // CacheModule отключен в dev режиме для упрощения тестирования
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
    ]), // ✅ ThrottlerModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret: string =
          configService.get<string>('GATEWAY_ADMIN_JWT_SECRET') ||
          configService.get<string>('ADMIN_JWT_SECRET') ||
          configService.get<string>('JWT_SECRET') ||
          'default-secret-change-in-production-min-32-chars';

        if (!jwtSecret || jwtSecret.length < 32) {
          throw new Error(
            'GATEWAY_ADMIN_JWT_SECRET, ADMIN_JWT_SECRET or JWT_SECRET is required and must be at least 32 characters long.'
          );
        }

        const jwtExpiresInRaw: string | number = '30m';
        const jwtExpiresIn: StringValue = jwtExpiresInRaw as StringValue;

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn,
          },
        };
      },
    }), // ✅ JwtModule для локального AdminAuthService
  ],
  controllers: [
    HealthController, // ✅ HealthController
    AdminAuthSimpleController, // ✅ Упрощенный AdminAuthController
    ServiceRoutingController, // ✅ ServiceRoutingController
    EndpointWhitelistController, // ✅ EndpointWhitelistController
  ],
  providers: [
    ServiceRoutingService, // ✅ ServiceRoutingService для ServiceRoutingController
    EndpointWhitelistService, // ✅ EndpointWhitelistService для EndpointWhitelistController
    PasswordService, // ✅ PasswordService для AdminAuthLocalService
    AdminAuthLocalService, // ✅ Локальная реализация AdminAuthService
  ],
})
export class AppModule {}
