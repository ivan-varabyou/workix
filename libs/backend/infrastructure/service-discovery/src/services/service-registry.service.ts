import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';
import * as crypto from 'crypto';

import {
  DeregisterServiceResponse,
  HealthCheck,
  HealthCheckResult,
  HeartbeatResponse,
  RegisterServiceResponse,
  Service,
  ServiceConfig,
} from '../interfaces/service-discovery.interface';

/**
 * Service Registry Service
 * Service Discovery Pattern Implementation
 */
@Injectable()
export class ServiceRegistryService {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private services = new Map<string, Service>();
  private healthChecks = new Map<string, HealthCheck>();

  constructor(private i18n: I18nService) {}

  /**
   * Register service
   */
  registerService(serviceName: string, config: ServiceConfig): RegisterServiceResponse {
    if (!serviceName || !config.url || !config.port) {
      throw new BadRequestException(
        this.i18n.translate('service_discovery.name_url_port_required')
      );
    }

    const serviceId: string = crypto.randomBytes(16).toString('hex');
    const service: Service = {
      id: serviceId,
      name: serviceName,
      url: config.url,
      port: config.port,
      health: 'healthy' as const,
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      metadata: config.metadata || {},
    };

    this.services.set(serviceId, service);
    this.logger.log(`Service registered: ${serviceName} (${serviceId})`);

    return {
      serviceId,
      message: `Service ${serviceName} registered successfully`,
    };
  }

  /**
   * Deregister service
   */
  deregisterService(serviceId: string): DeregisterServiceResponse {
    if (!this.services.has(serviceId)) {
      throw new NotFoundException(this.i18n.translate('service_discovery.not_found'));
    }

    const service: Service | undefined = this.services.get(serviceId);
    if (!service) {
      throw new NotFoundException(this.i18n.translate('service_discovery.not_found'));
    }
    this.services.delete(serviceId);
    this.healthChecks.delete(serviceId);

    this.logger.log(`Service deregistered: ${service.name} (${serviceId})`);
    return { message: 'Service deregistered successfully' };
  }

  /**
   * Discover service by name
   */
  discoverService(serviceName: string): Service {
    const services = Array.from(this.services.values()).filter(
      (s) => s.name === serviceName && s.health === 'healthy'
    );

    if (services.length === 0) {
      throw new NotFoundException(
        this.i18n.translate('service_discovery.no_healthy_instances', { serviceName })
      );
    }

    // Load balancing - return random healthy instance
    const service = services[Math.floor(Math.random() * services.length)];
    if (!service) {
      throw new NotFoundException(
        this.i18n.translate('service_discovery.no_healthy_instances', { serviceName })
      );
    }
    return service;
  }

  /**
   * Get all services
   */
  getAllServices(): Service[] {
    return Array.from(this.services.values());
  }

  /**
   * Get service by ID
   */
  getService(serviceId: string): Service {
    const service: Service | undefined = this.services.get(serviceId);
    if (!service) {
      throw new NotFoundException(this.i18n.translate('service_discovery.not_found'));
    }

    return service;
  }

  /**
   * Update service health
   */
  updateServiceHealth(serviceId: string, health: 'healthy' | 'unhealthy'): void {
    const service: Service | undefined = this.services.get(serviceId);
    if (!service) {
      throw new NotFoundException(this.i18n.translate('service_discovery.not_found'));
    }

    service.health = health;
    service.lastHeartbeat = new Date();

    this.logger.log(`Service health updated: ${service.name} -> ${health}`);
  }

  /**
   * Heartbeat endpoint for services to stay alive
   */
  heartbeat(serviceId: string): HeartbeatResponse {
    const service: Service | undefined = this.services.get(serviceId);
    if (!service) {
      throw new NotFoundException(this.i18n.translate('service_discovery.not_found'));
    }

    service.lastHeartbeat = new Date();
    service.health = 'healthy';

    return { message: 'Heartbeat received' };
  }

  /**
   * Health check - remove stale services
   */
  performHealthCheck(): HealthCheckResult {
    const now = new Date();
    const staleThreshold = 30000; // 30 seconds

    let removed = 0;

    for (const [serviceId, service] of this.services.entries()) {
      const timeSinceHeartbeat: number = now.getTime() - service.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > staleThreshold) {
        this.services.delete(serviceId);
        removed++;
        this.logger.warn(`Stale service removed: ${service.name} (${serviceId})`);
      }
    }

    this.logger.log(`Health check completed: ${removed} removed, ${this.services.size} active`);

    return {
      removed,
      total: this.services.size,
    };
  }

  /**
   * Get services by metadata
   */
  discoverByMetadata(key: string, value: string | number | boolean): Service[] {
    return Array.from(this.services.values()).filter(
      (s) => s.metadata[key] === value && s.health === 'healthy'
    );
  }

  /**
   * List services by type
   */
  getServicesByType(type: string): Service[] {
    return Array.from(this.services.values()).filter(
      (s) => s.metadata.type === type && s.health === 'healthy'
    );
  }
}
