import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { I18nModule } from '@workix/infrastructure/i18n';
import type { StringValue } from 'ms';

import { validateAuthConfig } from './config/auth-config.schema';
import { AuthConfigService } from './config/auth-config.service';
import { AuthFeaturesService } from './config/auth-features.config';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { JwtGuard } from './guards/jwt.guard';
import { AuthPrismaService } from './interfaces/prisma-auth.interface';
import { OAuth2Module } from './oauth2/oauth2.module';
import { PhoneOtpModule } from './phone-otp/phone-otp.module';
import { AuthService } from './services/auth.service';
import { BiometricService } from './services/biometric.service';
import { JwtService } from './services/jwt.service';
import { PasswordService } from './services/password.service';
import { PasswordResetService } from './services/password-reset.service';
import { RefreshTokenBlacklistService } from './services/refresh-token-blacklist.service';
import { SessionService } from './services/session.service';
import { TwoFactorService } from './services/two-factor.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Removed DEFAULT_JWT_EXPIRES_IN - using AuthConfigService instead

export interface WorkixAuthModuleOptions {
  prismaService?: AuthPrismaService;
  jwtSecret?: string;
  jwtExpiresIn?: StringValue | number;
}

/**
 * WorkixAuthModule
 * Main authentication module for @workix/domain/auth library
 *
 * Usage in your app module:
 * @Module({
 *   imports: [WorkixAuthModule.forRoot({ prismaService: PrismaService })],
 * })
 * export class AppModule {}
 */
@Module({})
export class WorkixAuthModule {
  static forRoot(options?: WorkixAuthModuleOptions): DynamicModule {
    // Validate configuration on module initialization
    // Skip validation in test environment to speed up test initialization
    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax -- Required for Node.js environment detection in backend module initialization
    const nodeEnv: string | undefined = typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : undefined;
    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax -- Required for Node.js environment variables access in backend
    if (typeof process !== 'undefined' && process.env && nodeEnv !== 'test') {
      try {
        // eslint-disable-next-line no-restricted-globals, no-restricted-syntax, @typescript-eslint/consistent-type-assertions -- Required for environment configuration in Node.js backend
        const envVars: Record<string, string> = process.env as Record<string, string>;
        validateAuthConfig(envVars);
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        console.error('❌ Auth configuration validation failed:', errorMessage);
        throw error;
      }
    }

    return {
      module: WorkixAuthModule,
      imports: [
        ConfigModule, // Ensure ConfigModule is available
        PassportModule,
        I18nModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService): JwtModuleOptions => {
            const authConfig: AuthConfigService = new AuthConfigService(configService);
            const jwtSecret: string = options?.jwtSecret || authConfig.getJwtSecret(); // No default - throws if not set
            // JwtModuleOptions.signOptions.expiresIn accepts: number | StringValue | undefined
            // StringValue from 'ms' package is string | number
            // authConfig.getJwtExpiresIn() returns string, which is compatible with StringValue
            const jwtExpiresInRaw: string | number = options?.jwtExpiresIn ?? authConfig.getJwtExpiresIn();
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
        // Включаем все подмодули
        EmailVerificationModule.forRoot(
          options?.prismaService !== undefined
            ? { prismaService: options.prismaService }
            : {}
        ),
        PhoneOtpModule.forRoot(
          options?.prismaService !== undefined
            ? { prismaService: options.prismaService }
            : {}
        ),
        OAuth2Module.forRoot(
          options?.prismaService !== undefined
            ? { prismaService: options.prismaService }
            : {}
        ),
      ],
      providers: [
        AuthConfigService, // Provide AuthConfigService for dependency injection
        AuthFeaturesService, // Provide AuthFeaturesService for feature flags
        AuthService,
        PasswordService,
        PasswordResetService,
        RefreshTokenBlacklistService, // Provide RefreshTokenBlacklistService
        TwoFactorService,
        SessionService,
        BiometricService,
        JwtService,
        JwtGuard,
        JwtStrategy,
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
      ],
      exports: [
        AuthConfigService, // Export for use in other modules
        AuthFeaturesService, // Export for use in other modules
        AuthService,
        JwtService,
        PasswordService,
        PasswordResetService,
        RefreshTokenBlacklistService, // Export RefreshTokenBlacklistService
        TwoFactorService,
        SessionService,
        BiometricService,
        JwtGuard,
        JwtStrategy,
        // Export sub-modules (they export their services)
        // These modules export: EmailVerificationService, OAuth2Service, PhoneOtpService
        OAuth2Module,
        PhoneOtpModule,
        EmailVerificationModule,
      ],
    };
  }
}
