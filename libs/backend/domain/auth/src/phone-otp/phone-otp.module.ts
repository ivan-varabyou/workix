import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { I18nModule } from '@workix/infrastructure/i18n';

import { AuthPrismaService } from '../interfaces/prisma-auth.interface';
import { JwtService } from '../services/jwt.service';
import { PasswordService } from '../services/password.service';
import { PhoneOtpService } from './services/phone-otp.service';

export interface PhoneOtpModuleOptions {
  prismaService?: AuthPrismaService;
}

/**
 * Phone OTP Module
 * Handles Phone OTP authentication
 */
@Module({})
export class PhoneOtpModule {
  static forRoot(options?: PhoneOtpModuleOptions): DynamicModule {
    return {
      module: PhoneOtpModule,
      imports: [
        I18nModule, // Для I18nService
        JwtModule.register({
          // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
          secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
          signOptions: { expiresIn: '1h' },
        }), // Для NestJwtService, который требуется JwtService
      ],
      providers: [
        PhoneOtpService,
        JwtService,
        PasswordService,
        // PrismaService should be available from @Global PrismaModule
        // If not provided explicitly, it will be resolved from global context
        ...(options?.prismaService
          ? [
              {
                provide: 'PrismaService',
                useValue: options.prismaService,
              },
            ]
          : []),
      ],
      exports: [PhoneOtpService], // Включаем обратно
    };
  }
}
