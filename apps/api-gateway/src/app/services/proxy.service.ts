import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';

import { ServiceRoutingService } from './service-routing.service';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private httpService: HttpService, private routingService: ServiceRoutingService) {}

  /**
   * Route request to appropriate microservice
   */
  async routeRequest(
    path: string,
    method: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<unknown> {
    try {
      // Detect which service to route to
      const service = this.detectService(path);

      // Get service URL from routing service (supports versioning)
      const baseUrl = this.routingService.getServiceUrl(service);

      if (!baseUrl) {
        throw new HttpException(`Unknown service for path: ${path}`, HttpStatus.NOT_FOUND);
      }

      // Build service path with correct API version prefix
      // Extract API version (v1, v2, etc.) and preserve it for microservices
      const servicePath = this.buildServicePath(path, service);
      const url = `${baseUrl}${servicePath}`;

      // Get service key from environment (API Gateway authenticates to microservices)
      const serviceKey =
        process.env.SERVICE_KEY ||
        process.env.API_GATEWAY_SERVICE_KEY ||
        'workix-service-key-change-in-production';

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Service-Key': serviceKey, // API Gateway service key for microservice authentication
        ...headers,
      };

      this.logger.debug(`[${service}] ${method} ${path}`);

      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get(url, { headers: requestHeaders }).pipe(timeout(10000))
          );
          break;
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(url, data, { headers: requestHeaders }).pipe(timeout(10000))
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(url, data, { headers: requestHeaders }).pipe(timeout(10000))
          );
          break;
        case 'PATCH':
          response = await firstValueFrom(
            this.httpService.patch(url, data, { headers: requestHeaders }).pipe(timeout(10000))
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(url, { headers: requestHeaders }).pipe(timeout(10000))
          );
          break;
        default:
          throw new HttpException('Method not allowed', HttpStatus.METHOD_NOT_ALLOWED);
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Proxy error: ${errorMessage}`);

      if (error && typeof error === 'object' && 'response' in error) {
        const httpError = error as {
          response?: {
            data?: Record<string, unknown> | string | number | boolean | null;
            status?: number;
          };
        };
        if (httpError.response) {
          const errorData: string | Record<string, unknown> =
            typeof httpError.response.data === 'string'
              ? httpError.response.data
              : (httpError.response.data as Record<string, unknown>);
          throw new HttpException(
            errorData || 'Service error',
            httpError.response.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }

      if (error && typeof error === 'object' && 'name' in error && error.name === 'TimeoutError') {
        throw new HttpException(
          'Service timeout - request took too long',
          HttpStatus.GATEWAY_TIMEOUT
        );
      }

      throw new HttpException(
        errorMessage || 'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Build service path with service-specific API version prefix
   * Gateway: /api/v1/* → Auth API: /api-auth/v1/*, Monolith: /api-monolith/v1/*
   */
  private buildServicePath(path: string, service: string): string {
    // Extract API version (v1, v2, etc.)
    const versionMatch = path.match(/^\/api\/(v\d+)/);
    const apiVersion = versionMatch ? versionMatch[1] : 'v1';

    // Remove /api/v1 or /api/v2 prefix to get clean path
    const cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');

    // Service-specific prefix mapping
    const servicePrefixMap: Record<string, string> = {
      auth: `/api-auth/${apiVersion}`,
      users: `/api-auth/${apiVersion}`, // Users in Auth API
      notifications: `/api-notifications/${apiVersion}`,
      pipelines: `/api-monolith/${apiVersion}`,
      executions: `/api-monolith/${apiVersion}`,
      rbac: `/api-monolith/${apiVersion}`,
      integrations: `/api-monolith/${apiVersion}`,
      analytics: `/api-monolith/${apiVersion}`,
      workers: `/api-monolith/${apiVersion}`,
      abTests: `/api-monolith/${apiVersion}`,
    };

    const servicePrefix = servicePrefixMap[service] || `/api/${apiVersion}`;

    return `${servicePrefix}${cleanPath}`;
  }

  /**
   * Detect which microservice to route to based on path
   * Skip gateway-only routes (health, status, endpoints)
   * Supports versioned paths: /api/v1/auth/login
   */
  private detectService(path: string): string {
    // Skip gateway-only paths
    if (
      path === '/api/health' ||
      path === '/api/status' ||
      path === '/api/endpoints' ||
      path.startsWith('/api/docs')
    ) {
      throw new Error(`Gateway path: ${path}`);
    }

    // Remove /api/v1 or /api prefix if present
    const cleanPath = path.replace(/^\/api\/v\d+/, '').replace(/^\/api/, '');

    // Core services
    if (cleanPath.startsWith('/auth')) return 'auth';
    if (cleanPath.startsWith('/users')) return 'auth'; // Users endpoints are in Auth API
    if (cleanPath.startsWith('/pipelines')) return 'pipelines';
    if (cleanPath.startsWith('/executions')) return 'executions';
    if (cleanPath.startsWith('/rbac')) return 'rbac';

    // Notifications service
    if (cleanPath.startsWith('/notifications') || cleanPath.startsWith('/subscriptions')) {
      return 'notifications';
    }

    // Universal analytics and integrations
    if (cleanPath.startsWith('/analytics')) return 'analytics';
    if (cleanPath.startsWith('/integrations')) return 'integrations';

    // Workers and A/B testing
    if (cleanPath.startsWith('/workers')) return 'workers';
    if (cleanPath.startsWith('/ab-tests')) return 'abTests';

    throw new Error(`No service found for path: ${path}`);
  }
}
