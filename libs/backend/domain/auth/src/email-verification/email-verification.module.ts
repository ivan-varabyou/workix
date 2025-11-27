import { DynamicModule, Module } from '@nestjs/common';
import { I18nModule } from '@workix/infrastructure/i18n';

import { AuthPrismaService } from '../interfaces/prisma-auth.interface';
import { EmailVerificationService } from './services/email-verification.service';

export interface EmailVerificationModuleOptions {
  prismaService?: AuthPrismaService;
}

/**
 * Email Verification Module
 * Handles email verification workflows
 */
@Module({})
export class EmailVerificationModule {
  static forRoot(options?: EmailVerificationModuleOptions): DynamicModule {
    return {
      module: EmailVerificationModule,
      imports: [I18nModule],
      providers: [
        EmailVerificationService,
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
      exports: [EmailVerificationService],
    };
  }
}
