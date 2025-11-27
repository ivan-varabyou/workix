import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Auth Configuration Service
 * Provides typed access to auth-related configuration
 */
@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  /**
   * Get JWT secret
   * Throws error if not set (no default values for security)
   */
  getJwtSecret(): string {
    const secret: string | undefined = this.configService.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET is required and must be at least 32 characters long. ' +
          'Please set it in your environment variables.'
      );
    }
    return secret;
  }

  /**
   * Get JWT refresh secret (optional, falls back to JWT_SECRET)
   */
  getJwtRefreshSecret(): string {
    const refreshSecret: string | undefined = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (refreshSecret && refreshSecret.length >= 32) {
      return refreshSecret;
    }
    // Fall back to JWT_SECRET if refresh secret not provided
    return this.getJwtSecret();
  }

  /**
   * Get JWT expiration time
   */
  getJwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '1h');
  }

  /**
   * Get JWT refresh expiration time
   */
  getJwtRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  /**
   * Get service key
   * Throws error if not set (no default values for security)
   */
  getServiceKey(): string {
    const serviceKey: string | undefined =
      this.configService.get<string>('SERVICE_KEY') ||
      this.configService.get<string>('API_GATEWAY_SERVICE_KEY');

    if (!serviceKey || serviceKey.length < 32) {
      throw new Error(
        'SERVICE_KEY or API_GATEWAY_SERVICE_KEY is required and must be at least 32 characters long. ' +
          'Please set it in your environment variables.'
      );
    }
    return serviceKey;
  }

  /**
   * Get database URL
   */
  getDatabaseUrl(): string {
    const url: string | undefined =
      this.configService.get<string>('DATABASE_URL_AUTH') ||
      this.configService.get<string>('DATABASE_URL');

    if (!url) {
      throw new Error(
        'DATABASE_URL_AUTH or DATABASE_URL is required. ' +
          'Please set it in your environment variables.'
      );
    }
    return url;
  }

  /**
   * Get CORS origin
   */
  getCorsOrigin(): string | string[] | undefined {
    const origin: string | undefined = this.configService.get<string>('CORS_ORIGIN');
    const allowedOrigins: string | undefined = this.configService.get<string>('ALLOWED_ORIGINS');

    if (allowedOrigins) {
      return allowedOrigins.split(',').map((o: string): string => o.trim());
    }

    if (origin) {
      return origin;
    }

    // In production, default to empty (no CORS) for security
    // In development, allow all
    return this.isProduction() ? undefined : '*';
  }

  /**
   * Get rate limit configuration
   */
  getRateLimitConfig(): { ttl: number; max: number; authMax: number; authTtl: number } {
    return {
      ttl: this.configService.get<number>('RATE_LIMIT_TTL', 60),
      max: this.configService.get<number>('RATE_LIMIT_MAX', 100),
      authMax: this.configService.get<number>('RATE_LIMIT_AUTH_MAX', 5),
      authTtl: this.configService.get<number>('RATE_LIMIT_AUTH_TTL', 900),
    };
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }
}
