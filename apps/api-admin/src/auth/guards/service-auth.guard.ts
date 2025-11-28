import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthConfigService } from '@workix/domain/auth';
import * as crypto from 'crypto';

/**
 * ServiceAuthGuard
 * Validates that requests come from API Gateway (not direct access)
 *
 * Blocks direct access to microservices - only API Gateway can access
 * Checks for X-Service-Key header which should be set by API Gateway
 */
@Injectable()
export class ServiceAuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(ServiceAuthGuard.name);
  private expectedServiceKey: string = '';

  constructor(
    private reflector: Reflector,
    @Inject(ConfigService) private configService: ConfigService
  ) {
    // Lazy initialization - don't block constructor
    // Service key will be validated on first use in canActivate()
  }

  canActivate(context: ExecutionContext): boolean {
    // Validate service key on first use
    if (!this.expectedServiceKey) {
      try {
        const authConfig: AuthConfigService = new AuthConfigService(this.configService);
        this.expectedServiceKey = authConfig.getServiceKey();
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.error(`❌ Failed to get SERVICE_KEY: ${errorMessage}`);
        throw new Error(
          'SERVICE_KEY or API_GATEWAY_SERVICE_KEY is required and must be at least 32 characters. ' +
            'Please set it in your environment variables.'
        );
      }
    }

    const request: { path?: string; url?: string; method?: string; headers?: Record<string, string | undefined> } = context.switchToHttp().getRequest<{ path?: string; url?: string; method?: string; headers?: Record<string, string | undefined> }>();
    const path: string | undefined = request.path || request.url?.split('?')[0];

    // Skip health check endpoints and documentation (they should be public)
    if (
      path === '/api/auth/health' ||
      path === '/auth/health' ||
      path === '/api-admin/v1/auth/health' ||
      path === '/api/health' ||
      path === '/health' ||
      path === '/health/status' ||
      path === '/docs' ||
      path?.startsWith('/docs/') ||
      path?.startsWith('/docs-json') ||
      path?.startsWith('/docs-yaml')
    ) {
      return true;
    }

    // Check if route is marked as public using Reflector
    try {
      if (this.reflector) {
        const isPublic: boolean | undefined = this.reflector.getAllAndOverride<boolean>('isPublic', [
          context.getHandler(),
          context.getClass(),
        ]);

        if (isPublic) {
          return true;
        }
      }
    } catch (_error) {
      // Reflector might not be available, continue with service key check
      this.logger.debug('Reflector not available, using service key check');
    }

    // Allow public auth endpoints (register, login, etc.)
    // Support both /api/auth/* and /api-admin/v1/auth/* paths
    const publicPaths: string[] = [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/verify',
      '/api/auth/refresh',
      '/api/auth/password-reset/request',
      '/api/auth/password-reset/verify',
      '/api/auth/password-reset/confirm',
      '/api/auth/2fa/verify',
      '/api/auth/phone-otp/send',
      '/api/auth/phone-otp/verify',
      '/api/auth/email-verification/send',
      '/api/auth/email-verification/verify',
      '/api/auth/email-verification/resend',
      '/api/auth/oauth/google',
      '/api/auth/oauth/google/callback',
      '/api/auth/oauth/github',
      '/api/auth/oauth/github/callback',
      '/api/auth/oauth/apple',
      '/api/auth/oauth/apple/callback',
      // Paths with /api-admin/v1/ prefix
      '/api-admin/v1/auth/register',
      '/api-admin/v1/auth/login',
      '/api-admin/v1/auth/verify',
      '/api-admin/v1/auth/refresh',
      '/api-admin/v1/auth/password-reset/request',
      '/api-admin/v1/auth/password-reset/verify',
      '/api-admin/v1/auth/password-reset/confirm',
      '/api-admin/v1/auth/2fa/verify',
      '/api-admin/v1/auth/phone-otp/send',
      '/api-admin/v1/auth/phone-otp/verify',
      '/api-admin/v1/auth/email-verification/send',
      '/api-admin/v1/auth/email-verification/verify',
      '/api-admin/v1/auth/email-verification/resend',
      '/api-admin/v1/auth/oauth/google',
      '/api-admin/v1/auth/oauth/google/callback',
      '/api-admin/v1/auth/oauth/github',
      '/api-admin/v1/auth/oauth/github/callback',
      '/api-admin/v1/auth/oauth/apple',
      '/api-admin/v1/auth/oauth/apple/callback',
    ];

    if (path && publicPaths.includes(path)) {
      return true;
    }

    // Check for Bearer token in Authorization header
    // If Bearer token is present, this is a user request (not API Gateway)
    // Allow it to pass through - JwtGuard will validate the token
    const authHeader: string | undefined = request.headers?.['authorization'] || request.headers?.['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      this.logger.debug(`✅ Bearer token found, allowing user request: ${request.method} ${request.path}`);
      return true;
    }

    // No Bearer token - this must be an API Gateway request
    // Check for service key in header
    const serviceKey: string | undefined = request.headers?.['x-service-key'] || request.headers?.['X-Service-Key'];

    if (!serviceKey) {
      this.logger.warn(
        `🚫 Direct access blocked: ${request.method} ${request.path} - No X-Service-Key header and no Bearer token`
      );
      throw new UnauthorizedException(
        'Direct access to microservice is not allowed. Please use API Gateway at /api/* or provide Bearer token'
      );
    }

    // Use timing-safe comparison to prevent timing attacks
    // Note: For WebAssembly compatibility, we use TextEncoder to convert strings to Uint8Array
    // In Node.js environment, this works with crypto.timingSafeEqual
    // TextEncoder is a standard Web API, compatible with WebAssembly

    // eslint-disable-next-line @typescript-eslint/typedef
    const encoder = new TextEncoder();
    const serviceKeyBytes: Uint8Array = encoder.encode(serviceKey);
    const expectedKeyBytes: Uint8Array = encoder.encode(this.expectedServiceKey);

    if (
      serviceKeyBytes.length !== expectedKeyBytes.length ||
      !crypto.timingSafeEqual(serviceKeyBytes, expectedKeyBytes)
    ) {
      this.logger.warn(`🚫 Invalid service key: ${request.method} ${request.path}`);
      throw new UnauthorizedException('Invalid service key');
    }

    // Valid service key - allow request
    this.logger.debug(`✅ Service authenticated: ${request.method} ${request.path}`);
    return true;
  }
}
