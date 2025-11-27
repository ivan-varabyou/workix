import { Injectable, Logger } from '@nestjs/common';

import { CacheStats, Service } from '../interfaces/service-discovery.interface';
import { ServiceRegistryService } from './service-registry.service';

/**
 * Service Locator Service
 * Locates and manages service instances
 */
@Injectable()
export class ServiceLocatorService {
  private readonly logger = new Logger(ServiceLocatorService.name);
  private cache = new Map<string, { service: Service; expiresAt: number }>();
  private cacheExpiry = 60000; // 1 minute

  constructor(private registry: ServiceRegistryService) {
    // Perform health checks every 30 seconds
    setInterval(() => this.registry.performHealthCheck(), 30000);
  }

  /**
   * Locate service with caching
   */
  locateService(serviceName: string): Service {
    const now = Date.now();

    // Check cache
    const cached: { service: Service; expiresAt: number } | undefined = this.cache.get(serviceName);
    if (cached && cached.expiresAt > now) {
      this.logger.debug(`Service located from cache: ${serviceName}`);
      return cached.service;
    } else if (cached) {
      this.cache.delete(serviceName);
    }

    // Discover from registry
    const service = this.registry.discoverService(serviceName);

    // Cache result
    this.cache.set(serviceName, {
      service,
      expiresAt: now + this.cacheExpiry,
    });

    this.logger.log(`Service located: ${serviceName} at ${service.url}:${service.port}`);
    return service;
  }

  /**
   * Get service URL
   */
  getServiceUrl(serviceName: string): string {
    const service = this.locateService(serviceName);
    return `http://${service.url}:${service.port}`;
  }

  /**
   * Invalidate cache for service
   */
  invalidateCache(serviceName: string): void {
    this.cache.delete(serviceName);
    this.logger.log(`Cache invalidated for service: ${serviceName}`);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      cachedServices: this.cache.size,
      totalSize: this.cache.size,
    };
  }

  /**
   * Locate all services of type
   */
  locateServicesByType(type: string): Service[] {
    return this.registry.getServicesByType(type);
  }
}
