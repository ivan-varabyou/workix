import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { EndpointWhitelistService } from '../services/endpoint-whitelist.service';

/**
 * Endpoint Access Guard
 * Validates that the requesting application has access to the endpoint
 * Checks:
 * - Application ID (from header X-Application-Id)
 * - API Key (from header X-API-Key)
 * - Endpoint whitelist
 * - Version access
 * - Service access
 */
@Injectable()
export class EndpointAccessGuard implements CanActivate {
  constructor(private whitelistService: EndpointWhitelistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const path: string = request.path;

    // Skip check for gateway-only endpoints
    if (this.isGatewayEndpoint(path)) {
      return true;
    }

    // Extract application ID from header
    const appIdHeader: string | string[] | undefined = request.headers['x-application-id'];
    const apiKeyHeader: string | string[] | undefined = request.headers['x-api-key'];
    let appId: string = '';
    if (typeof appIdHeader === 'string') {
      appId = appIdHeader;
    } else if (Array.isArray(appIdHeader) && appIdHeader.length > 0) {
      const firstElement: unknown = appIdHeader[0];
      appId = typeof firstElement === 'string' ? firstElement : '';
    }
    let apiKey: string = '';
    if (typeof apiKeyHeader === 'string') {
      apiKey = apiKeyHeader;
    } else if (Array.isArray(apiKeyHeader) && apiKeyHeader.length > 0) {
      const firstElement: unknown = apiKeyHeader[0];
      apiKey = typeof firstElement === 'string' ? firstElement : '';
    }

    // If no app ID, check if it's a public endpoint
    if (!appId) {
      const normalizedPath: string = this.normalizePath(path);
      if (this.whitelistService.isPublicEndpoint(normalizedPath)) {
        return true;
      }
      throw new UnauthorizedException('Application ID required (X-Application-Id header)');
    }

    // Verify API key if required
    if (apiKey) {
      const isValid = this.whitelistService.verifyApiKey(appId, apiKey);
      if (!isValid) {
        throw new UnauthorizedException('Invalid API key');
      }
    }

    // Extract version from path
    const versionMatch: RegExpMatchArray | null = path.match(/\/api\/(v\d+)\//);
    const version: string = versionMatch && versionMatch[1] ? versionMatch[1] : 'v1';

    // Check version access
    if (!this.whitelistService.isVersionAllowed(appId, version)) {
      throw new ForbiddenException(`Version ${version} not allowed for application ${appId}`);
    }

    // Check endpoint access
    if (!this.whitelistService.isEndpointAllowed(appId, path, version)) {
      throw new ForbiddenException(`Endpoint ${path} not allowed for application ${appId}`);
    }

    // Detect service from path
    const service: string | null = this.detectServiceFromPath(path);
    if (service && !this.whitelistService.isServiceAllowed(appId, service)) {
      throw new ForbiddenException(`Service ${service} not allowed for application ${appId}`);
    }

    // Check port access (if port is specified in routing)
    // This is handled by ServiceRoutingService, but we can add additional checks here

    return true;
  }

  /**
   * Check if endpoint is gateway-only (health, status, docs, admin)
   */
  private isGatewayEndpoint(path: string): boolean {
    const gatewayPaths: string[] = [
      '/api/health',
      '/api/status',
      '/api/endpoints',
      '/api/docs',
      '/docs',
      '/api/v1/admin', // Admin endpoints are gateway-only
    ];
    return gatewayPaths.some((p) => path.startsWith(p));
  }

  /**
   * Normalize path for checking
   */
  private normalizePath(path: string): string {
    const result: string | undefined = path.split('?')[0];
    return result || path;
  }

  /**
   * Detect service name from path
   */
  private detectServiceFromPath(path: string): string | null {
    const cleanPath: string = path.replace(/^\/api\/v\d+\//, '/api/');

    if (cleanPath.startsWith('/api/auth')) return 'auth';
    if (cleanPath.startsWith('/api/users')) return 'users';
    if (cleanPath.startsWith('/api/pipelines')) return 'pipelines';
    if (cleanPath.startsWith('/api/executions')) return 'executions';
    if (cleanPath.startsWith('/api/rbac')) return 'rbac';
    if (cleanPath.startsWith('/api/analytics')) return 'analytics';
    if (cleanPath.startsWith('/api/integrations')) return 'integrations';
    if (cleanPath.startsWith('/api/workers')) return 'workers';
    if (cleanPath.startsWith('/api/ab-tests')) return 'abTests';

    return null;
  }
}
