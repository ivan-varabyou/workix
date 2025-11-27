import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from '@workix/infrastructure/i18n';

import { ApiKeyService } from '../services/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector,
    private i18n: I18nService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Get API key from header or query
    const apiKeyHeader = request.headers['x-api-key'];
    const apiKeyQuery = request.query.api_key;

    if (!apiKeyHeader && !apiKeyQuery) {
      throw new UnauthorizedException(this.i18n.translate('api_keys.required'));
    }

    const key = apiKeyHeader || apiKeyQuery;

    // Parse key and secret (format: key:secret)
    const [keyPart, secretPart] = key.split(':');

    if (!keyPart || !secretPart) {
      throw new BadRequestException(this.i18n.translate('api_keys.invalid_format'));
    }

    // Validate API key
    const apiKey = await this.apiKeyService.validateApiKey(keyPart, secretPart);

    if (!apiKey) {
      throw new UnauthorizedException(this.i18n.translate('api_keys.invalid_or_expired'));
    }

    // Check rate limit
    const withinLimit = await this.apiKeyService.checkRateLimit(apiKey.id);

    if (!withinLimit) {
      throw new ForbiddenException(this.i18n.translate('api_keys.rate_limit_exceeded'));
    }

    // Check permissions
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

    if (requiredPermissions) {
      const hasPermission = requiredPermissions.every((permission) =>
        this.apiKeyService.hasPermission(apiKey, permission)
      );

      if (!hasPermission) {
        throw new ForbiddenException(this.i18n.translate('errors.forbidden'));
      }
    }

    // Attach API key to request
    request.apiKey = apiKey;

    // Log usage
    this.apiKeyService
      .logUsage(
        apiKey.id,
        request.path,
        request.method,
        0, // Status code will be added after response
        request.ip,
        request.get('user-agent')
      )
      .catch((error) => {
        console.error('Failed to log API key usage:', error);
      });

    return true;
  }
}
