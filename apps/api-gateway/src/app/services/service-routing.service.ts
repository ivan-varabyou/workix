import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service Routing Service
 * Manages dynamic routing to services with version support
 * Allows switching between monolith and microservices without restart
 */
export interface ServiceVersion {
  url: string;
  version: string;
  weight: number; // For A/B testing or gradual rollout
  active: boolean;
}

export interface ServiceConfig {
  service: string;
  defaultUrl: string;
  versions: ServiceVersion[];
  currentVersion?: string;
  fallbackUrl?: string;
}

@Injectable()
export class ServiceRoutingService implements OnModuleInit {
  private readonly logger = new Logger(ServiceRoutingService.name);

  // Service routing configuration
  // Can be updated dynamically via API or config file
  private serviceConfigs: Map<string, ServiceConfig> = new Map();

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    this.initializeServiceConfigs();
  }

  /**
   * Initialize service configurations from environment or defaults
   */
  private initializeServiceConfigs(): void {
    const monolithUrl = this.configService.get<string>('MONOLITH_URL') || 'http://localhost:7101';
    const authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:7102';
    const notificationsServiceUrl =
      this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') || 'http://localhost:7103';
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') || monolithUrl;
    const pipelineServiceUrl =
      this.configService.get<string>('PIPELINE_SERVICE_URL') || monolithUrl;
    const rbacServiceUrl = this.configService.get<string>('RBAC_SERVICE_URL') || monolithUrl;

    // Auth Service - always microservice
    this.serviceConfigs.set('auth', {
      service: 'auth',
      defaultUrl: authServiceUrl,
      versions: [
        {
          url: authServiceUrl,
          version: 'v1',
          weight: 100,
          active: true,
        },
      ],
      currentVersion: 'v1',
    });

    // Notifications Service - always microservice
    this.serviceConfigs.set('notifications', {
      service: 'notifications',
      defaultUrl: notificationsServiceUrl,
      versions: [
        {
          url: notificationsServiceUrl,
          version: 'v1',
          weight: 100,
          active: true,
        },
      ],
      currentVersion: 'v1',
    });

    // User Service - can be monolith or microservice
    this.serviceConfigs.set('users', {
      service: 'users',
      defaultUrl: userServiceUrl,
      versions: [
        {
          url: userServiceUrl,
          version: 'v1',
          weight: 100,
          active: true,
        },
      ],
      currentVersion: 'v1',
      fallbackUrl: monolithUrl,
    });

    // Pipeline Service - can be monolith or microservice
    this.serviceConfigs.set('pipelines', {
      service: 'pipelines',
      defaultUrl: pipelineServiceUrl,
      versions: [
        {
          url: pipelineServiceUrl,
          version: 'v1',
          weight: 100,
          active: true,
        },
      ],
      currentVersion: 'v1',
      fallbackUrl: monolithUrl,
    });

    // RBAC Service - can be monolith or microservice
    this.serviceConfigs.set('rbac', {
      service: 'rbac',
      defaultUrl: rbacServiceUrl,
      versions: [
        {
          url: rbacServiceUrl,
          version: 'v1',
          weight: 100,
          active: true,
        },
      ],
      currentVersion: 'v1',
      fallbackUrl: monolithUrl,
    });

    // Analytics, Integrations, Workers, AB Tests - always monolith
    this.serviceConfigs.set('analytics', {
      service: 'analytics',
      defaultUrl: monolithUrl,
      versions: [{ url: monolithUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    this.serviceConfigs.set('integrations', {
      service: 'integrations',
      defaultUrl: monolithUrl,
      versions: [{ url: monolithUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    this.serviceConfigs.set('workers', {
      service: 'workers',
      defaultUrl: monolithUrl,
      versions: [{ url: monolithUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    this.serviceConfigs.set('abTests', {
      service: 'abTests',
      defaultUrl: monolithUrl,
      versions: [{ url: monolithUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    this.logger.log('Service routing configurations initialized');
  }

  /**
   * Get service URL for routing
   * Supports Kubernetes Service discovery and Docker Compose fallback
   * Supports version selection and A/B testing
   */
  getServiceUrl(serviceName: string, version?: string): string {
    // For Kubernetes: use Service URL (without version in URL)
    if (process.env.KUBERNETES_SERVICE_HOST) {
      return this.getKubernetesServiceUrl(serviceName);
    }

    // For Docker Compose: use environment variables or config
    const config = this.serviceConfigs.get(serviceName);

    if (!config) {
      this.logger.warn(`Service config not found: ${serviceName}, using default`);
      return this.getDockerServiceUrl(serviceName);
    }

    // If version specified, find it
    if (version) {
      const versionConfig = config.versions.find((v) => v.version === version && v.active);
      if (versionConfig) {
        return versionConfig.url;
      }
      this.logger.warn(`Version ${version} not found for ${serviceName}, using current`);
    }

    // Use current version
    if (config.currentVersion) {
      const currentVersion = config.versions.find(
        (v) => v.version === config.currentVersion && v.active
      );
      if (currentVersion) {
        return currentVersion.url;
      }
    }

    // Fallback to default
    return config.defaultUrl || config.fallbackUrl || this.getDockerServiceUrl(serviceName);
  }

  /**
   * Get Kubernetes Service URL
   * Service URL format: http://{service-name}-service.{namespace}.svc.cluster.local
   */
  private getKubernetesServiceUrl(serviceName: string): string {
    const namespace = process.env.KUBERNETES_NAMESPACE || 'workix';

    const serviceMap: Record<string, string> = {
      auth: `http://auth-service.${namespace}.svc.cluster.local`,
      notifications: `http://notifications-service.${namespace}.svc.cluster.local`,
      monolith: `http://monolith-service.${namespace}.svc.cluster.local`,
      users: `http://auth-service.${namespace}.svc.cluster.local`, // Users endpoints are in Auth API
      pipelines: `http://monolith-service.${namespace}.svc.cluster.local`,
      executions: `http://monolith-service.${namespace}.svc.cluster.local`,
      rbac: `http://monolith-service.${namespace}.svc.cluster.local`,
      integrations: `http://monolith-service.${namespace}.svc.cluster.local`,
      analytics: `http://monolith-service.${namespace}.svc.cluster.local`,
      workers: `http://monolith-service.${namespace}.svc.cluster.local`,
      abTests: `http://monolith-service.${namespace}.svc.cluster.local`,
    };

    const serviceUrl = serviceMap[serviceName] || `http://${serviceName}-service.${namespace}.svc.cluster.local`;

    this.logger.debug(`Kubernetes mode: ${serviceName} → ${serviceUrl}`);
    return serviceUrl;
  }

  /**
   * Get Docker Compose Service URL (fallback)
   */
  private getDockerServiceUrl(serviceName: string): string {
    const envMap: Record<string, string> = {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:7102',
      notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:7103',
      monolith: process.env.MONOLITH_URL || 'http://localhost:7101',
      users: process.env.AUTH_SERVICE_URL || 'http://localhost:7102', // Users endpoints are in Auth API
      pipelines: process.env.MONOLITH_URL || 'http://localhost:7101',
      executions: process.env.MONOLITH_URL || 'http://localhost:7101',
      rbac: process.env.MONOLITH_URL || 'http://localhost:7101',
      integrations: process.env.MONOLITH_URL || 'http://localhost:7101',
      analytics: process.env.MONOLITH_URL || 'http://localhost:7101',
      workers: process.env.MONOLITH_URL || 'http://localhost:7101',
      abTests: process.env.MONOLITH_URL || 'http://localhost:7101',
    };

    const serviceUrl = envMap[serviceName] || 'http://localhost:7101';

    this.logger.debug(`Docker Compose mode: ${serviceName} → ${serviceUrl}`);
    return serviceUrl;
  }

  /**
   * Add new service version (for testing new servers)
   * Can be called via API without restart
   */
  addServiceVersion(serviceName: string, version: ServiceVersion): void {
    const config = this.serviceConfigs.get(serviceName);
    if (!config) {
      this.logger.error(`Service config not found: ${serviceName}`);
      return;
    }

    // Check if version already exists
    const existingIndex = config.versions.findIndex((v) => v.version === version.version);
    if (existingIndex >= 0) {
      config.versions[existingIndex] = version;
    } else {
      config.versions.push(version);
    }

    this.logger.log(`Added version ${version.version} for ${serviceName} at ${version.url}`);
  }

  /**
   * Switch to new version (activate tested server)
   * Can be called via API without restart
   */
  switchServiceVersion(serviceName: string, version: string): boolean {
    const config = this.serviceConfigs.get(serviceName);
    if (!config) {
      this.logger.error(`Service config not found: ${serviceName}`);
      return false;
    }

    const versionConfig = config.versions.find((v) => v.version === version);
    if (!versionConfig) {
      this.logger.error(`Version ${version} not found for ${serviceName}`);
      return false;
    }

    if (!versionConfig.active) {
      this.logger.error(`Version ${version} is not active for ${serviceName}`);
      return false;
    }

    config.currentVersion = version;
    this.logger.log(`Switched ${serviceName} to version ${version} at ${versionConfig.url}`);
    return true;
  }

  /**
   * Get all service configurations (for admin API)
   */
  getAllServiceConfigs(): Map<string, ServiceConfig> {
    return new Map(this.serviceConfigs);
  }

  /**
   * Get service configuration
   */
  getServiceConfig(serviceName: string): ServiceConfig | undefined {
    return this.serviceConfigs.get(serviceName);
  }

  /**
   * Update service configuration (for admin API)
   */
  updateServiceConfig(serviceName: string, config: Partial<ServiceConfig>): void {
    const existing = this.serviceConfigs.get(serviceName);
    if (!existing) {
      this.logger.error(`Service config not found: ${serviceName}`);
      return;
    }

    Object.assign(existing, config);
    this.logger.log(`Updated service config for ${serviceName}`);
  }
}
