import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * ServiceAuthGuard
 * Validates that requests come from API Gateway (not direct access)
 *
 * Usage:
 * @UseGuards(ServiceAuthGuard)
 *
 * This guard checks for X-Service-Key header which should be set by API Gateway
 * Direct access to microservices is blocked unless this key is present and valid
 */
@Injectable()
export class ServiceAuthGuard implements CanActivate {
  private readonly logger = new Logger(ServiceAuthGuard.name);
  private readonly expectedServiceKey: string;

  constructor(private reflector: Reflector) {
    // Reflector reserved for future use
    void this.reflector;
    // Get service key from environment
    this.expectedServiceKey =
      process.env.SERVICE_KEY ||
      process.env.API_GATEWAY_SERVICE_KEY ||
      'workix-service-key-change-in-production';

    if (
      !this.expectedServiceKey ||
      this.expectedServiceKey === 'workix-service-key-change-in-production'
    ) {
      this.logger.warn(
        '⚠️  SERVICE_KEY not set! Using default key. This is INSECURE for production!'
      );
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check for service key in header
    const serviceKey = request.headers['x-service-key'] || request.headers['X-Service-Key'];

    if (!serviceKey) {
      this.logger.warn(
        `🚫 Direct access blocked: ${request.method} ${request.path} - No X-Service-Key header`
      );
      throw new UnauthorizedException(
        'Direct access to microservice is not allowed. Please use API Gateway.'
      );
    }

    if (serviceKey !== this.expectedServiceKey) {
      this.logger.warn(`🚫 Invalid service key: ${request.method} ${request.path}`);
      throw new UnauthorizedException('Invalid service key');
    }

    // Valid service key - allow request
    this.logger.debug(`✅ Service authenticated: ${request.method} ${request.path}`);
    return true;
  }
}
