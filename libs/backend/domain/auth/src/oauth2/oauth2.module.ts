import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthPrismaService } from '../interfaces/prisma-auth.interface';
import { JwtService } from '../services/jwt.service';
import { PasswordService } from '../services/password.service';
import { OAuth2Service } from './services/oauth2.service';
// import { AppleStrategy } from './strategies/apple.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

export interface OAuth2ModuleOptions {
  prismaService?: AuthPrismaService;
}

/**
 * OAuth2 Module
 * Handles OAuth2 authentication with Google, Apple, and GitHub
 */
@Module({})
export class OAuth2Module {
  static forRoot(options?: OAuth2ModuleOptions): DynamicModule {
    return {
      module: OAuth2Module,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule, // ConfigModule should be global, but explicitly import for strategies
        JwtModule.register({
          // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
          secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
          signOptions: { expiresIn: '1h' },
        }), // Для NestJwtService, который требуется JwtService
      ],
      providers: [
        OAuth2Service,
        // OAuth2 Strategies - enabled for OAuth2 endpoints
        // Note: Strategies will fail gracefully if credentials are not configured
        GoogleStrategy,
        GitHubStrategy,
        // AppleStrategy, // Disabled until Apple OAuth is fully configured
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
      exports: [OAuth2Service],
    };
  }
}
