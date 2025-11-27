import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import * as redisStore from 'cache-manager-redis-store';
import type { StringValue } from 'ms';

import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { AdminAuthService } from './services/admin-auth.service';
import { AdminIpWhitelistService, GatewayPrismaServiceInterface } from './services/admin-ip-whitelist.service';
import { AdminJwtService } from './services/admin-jwt.service';
import { AdminTokenCacheService } from './services/admin-token-cache.service';

export interface WorkixAdminModuleOptions {
  prismaService?: GatewayPrismaServiceInterface;
  jwtSecret?: string;
  jwtExpiresIn?: StringValue | number;
  redisConfig?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  };
  enableTokenCache?: boolean;
  enable2FA?: boolean;
  enableMetrics?: boolean;
  enableNotifications?: boolean;
  enableStructuredLogging?: boolean;
}

/**
 * WorkixAdminModule
 * Main admin authentication module for @workix/domain/admin library
 *
 * Usage in your app module:
 * @Module({
 *   imports: [WorkixAdminModule.forRoot({ prismaService: PrismaService })],
 * })
 * export class AppModule {}
 */
@Module({})
export class WorkixAdminModule {
  static forRoot(options?: WorkixAdminModuleOptions): DynamicModule {
    const enableTokenCache: boolean = options?.enableTokenCache !== false; // Default: true
    const redisConfig: { host?: string; port?: number; password?: string; db?: number } = options?.redisConfig || {};

    const imports: Array<typeof ConfigModule | DynamicModule> = [
      ConfigModule, // Ensure ConfigModule is available
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService): JwtModuleOptions => {
          const jwtSecret: string = options?.jwtSecret ||
            configService.get<string>('GATEWAY_ADMIN_JWT_SECRET') ||
            configService.get<string>('JWT_SECRET') ||
            'default-secret-change-in-production-min-32-chars';

          if (!jwtSecret || jwtSecret.length < 32) {
            throw new Error(
              'GATEWAY_ADMIN_JWT_SECRET or JWT_SECRET is required and must be at least 32 characters long.'
            );
          }

          const jwtExpiresInRaw: string | number = options?.jwtExpiresIn ?? '30m';
          // Convert to StringValue (which is string | number) for type compatibility
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const jwtExpiresIn: StringValue = jwtExpiresInRaw as StringValue;

          return {
            secret: jwtSecret,
            signOptions: {
              expiresIn: jwtExpiresIn,
            },
          };
        },
      }),
    ];

    // Add CacheModule if token cache is enabled
    if (enableTokenCache) {
      imports.push(
        CacheModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService): {
            store: typeof redisStore;
            host: string;
            port: number;
            password?: string;
            db: number;
            ttl: number;
            max: number;
          } => {
            const redisHost: string = redisConfig.host || configService.get<string>('REDIS_HOST') || 'localhost';
            const redisPort: number = redisConfig.port || configService.get<number>('REDIS_PORT') || 5900;
            const redisPassword: string | undefined = redisConfig.password || configService.get<string>('REDIS_PASSWORD');
            const redisDb: number = redisConfig.db || configService.get<number>('REDIS_DB') || 1; // Use DB 1 for tokens

            const config: {
              store: typeof redisStore;
              host: string;
              port: number;
              password?: string;
              db: number;
              ttl: number;
              max: number;
            } = {
              store: redisStore,
              host: redisHost,
              port: redisPort,
              db: redisDb,
              ttl: 30 * 60, // Default TTL: 30 minutes
              max: 10000, // Maximum number of items in cache
            };

            // Only add password if it's defined
            if (redisPassword) {
              config.password = redisPassword;
            }

            return config;
          },
        })
      );
    }

    const providers: Array<
      | typeof AdminJwtService
      | typeof AdminIpWhitelistService
      | typeof AdminAuthService
      | typeof AdminJwtGuard
      | typeof AdminRoleGuard
      | typeof AdminTokenCacheService
      | { provide: string; useValue: GatewayPrismaServiceInterface }
      | { provide: string; useClass: typeof AdminTokenCacheService }
      | { provide: string; useExisting: typeof AdminAuthService }
    > = [
      AdminJwtService,
      AdminIpWhitelistService,
      AdminAuthService,
      AdminJwtGuard,
      AdminRoleGuard,
      // PrismaService provider - only add if explicitly provided
      // Otherwise, it should be available from @Global PrismaModule
      ...(options?.prismaService
        ? [
            {
              provide: 'PrismaService',
              useValue: options.prismaService,
            },
          ]
        : []),
      // TokenCacheService provider - only add if enabled
      ...(enableTokenCache
        ? [
            AdminTokenCacheService,
            {
              provide: 'AdminTokenCacheService',
              useClass: AdminTokenCacheService,
            },
          ]
        : []),
      // AdminAuthService interface provider - must be after AdminAuthService in providers
      {
        provide: 'AdminAuthService',
        useExisting: AdminAuthService,
      },
    ];

    const exports: Array<
      | typeof AdminJwtService
      | typeof AdminIpWhitelistService
      | typeof AdminAuthService
      | typeof AdminJwtGuard
      | typeof AdminRoleGuard
      | typeof AdminTokenCacheService
      | { provide: string; useExisting: typeof AdminAuthService | typeof AdminTokenCacheService }
    > = [
      AdminJwtService,
      AdminIpWhitelistService,
      AdminAuthService,
      AdminJwtGuard,
      AdminRoleGuard,
      // Export AdminAuthService interface
      {
        provide: 'AdminAuthService',
        useExisting: AdminAuthService,
      },
      // Export TokenCacheService if enabled
      ...(enableTokenCache
        ? [
            AdminTokenCacheService,
            {
              provide: 'AdminTokenCacheService',
              useExisting: AdminTokenCacheService,
            },
          ]
        : []),
    ];

    return {
      module: WorkixAdminModule,
      imports,
      providers,
      exports,
    };
  }
}
