import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  EmailVerificationModule,
  OAuth2Module,
  SecurityModule,
  WorkixAuthModule,
} from '@workix/domain/auth';
import { UsersModule } from '@workix/domain/users';
import { I18nModule } from '@workix/infrastructure/i18n';
import { MessageBrokerModule } from '@workix/infrastructure/message-broker';

import { AuthController } from './auth/controllers/auth.controller';
import { AuthMicroserviceController } from './auth/controllers/auth-microservice.controller';
import { AuthSecurityController } from './auth/controllers/auth-security.controller';
import { UsersController } from './auth/controllers/users.controller';
import { EmailVerificationController } from './auth/email-verification/controllers/email-verification.controller';
import { OAuth2Controller } from './auth/oauth2/controllers/oauth2.controller';
import { PhoneOtpController } from './auth/phone-otp/controllers/phone-otp.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule, // @Global module - provides PrismaService globally
    I18nModule,
    MessageBrokerModule,
    SecurityModule,
    // UsersModule must be imported BEFORE controllers that use UserProfileService
    UsersModule.forRoot(),
    // WorkixAuthModule - PrismaService will be resolved from global PrismaModule
    WorkixAuthModule.forRoot(),
    // Explicitly import sub-modules to ensure their services are available to controllers
    // These modules export: EmailVerificationService, OAuth2Service
    EmailVerificationModule.forRoot(),
    OAuth2Module.forRoot(),
  ],
  controllers: [
    // HTTP controllers
    AuthController,
    AuthSecurityController,
    UsersController,
    OAuth2Controller,
    PhoneOtpController,
    EmailVerificationController,
    // Microservice controller (Redis transport)
    AuthMicroserviceController,
  ],
  providers: [
    // UserProfileService is provided by UsersModule and exported
    // It should be available automatically via module exports
  ],
})
export class AppModule implements NestModule {
  constructor() {
    // PrismaService is available globally from PrismaModule (@Global)
  }

  configure(_consumer: MiddlewareConsumer): void {
    // Middleware configuration can be added here if needed
  }
}
