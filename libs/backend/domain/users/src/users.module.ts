import { DynamicModule, Module, Type } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { I18nModule } from '@workix/infrastructure/i18n';

import { PrismaModuleClass } from './interfaces/users-prisma.interface';
import { UserProfileService } from './services/user-profile.service';

export interface UsersModuleOptions {
  prismaService?: Type<PrismaClient>;
  prismaModule?: Type<PrismaModuleClass>;
}

/**
 * Users Module
 * Handles user profile management
 */
@Module({})
export class UsersModule {
  static forRoot(options?: UsersModuleOptions): DynamicModule {
    return {
      module: UsersModule,
      // Import PrismaModule if provided, otherwise PrismaService should be provided by consuming app
      imports: [I18nModule, ...(options?.prismaModule ? [options.prismaModule] : [])],
      providers: [
        UserProfileService,
        // Provide PrismaService token if class is provided
        ...(options?.prismaService && typeof options.prismaService !== 'string'
          ? [
              {
                provide: 'PrismaService',
                useClass: options.prismaService,
              },
            ]
          : []),
      ],
      exports: [UserProfileService],
    };
  }
}
