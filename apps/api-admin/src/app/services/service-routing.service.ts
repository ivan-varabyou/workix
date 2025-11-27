import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service Routing Service
 * Manages dynamic routing to services with version support
 * Manages dynamic routing to microservices with version support
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
  private readonly logger: Logger = new Logger(ServiceRoutingService.name);

  // Service routing configuration
  // Can be updated dynamically via API or config file
  private serviceConfigs: Map<string, ServiceConfig> = new Map();

  constructor(private readonly configService: ConfigService | undefined) {}

  onModuleInit(): void {
    // Временно используем значения по умолчанию для быстрого запуска
    // TODO: Исправить инжекцию ConfigService
    if (this.configService) {
      this.initializeServiceConfigs();
    } else {
      this.logger.warn('ConfigService not available, using default URLs');
      this.initializeDefaultConfigs();
    }
  }

  /**
   * Initialize service configurations from environment or defaults
   */
  private initializeServiceConfigs(): void {
    // Явная проверка ConfigService для безопасности
    if (!this.configService) {
      this.logger.warn('ConfigService not available, using default URLs');
      this.initializeDefaultConfigs();
      return;
    }

    const authServiceUrl: string =
      (this.configService.get<string>('AUTH_SERVICE_URL') as string | undefined) || 'http://localhost:7102';
    const notificationsServiceUrl: string =
      (this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') as string | undefined) || 'http://localhost:7103';
    const userServiceUrl: string = (this.configService.get<string>('USER_SERVICE_URL') as string | undefined) || authServiceUrl;
    const pipelineServiceUrl: string =
      (this.configService.get<string>('PIPELINE_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_PIPELINES_URL') as string | undefined) ||
      'http://localhost:7104'; // api-pipelines microservice (Port 7104)
    const rbacServiceUrl: string = (this.configService.get<string>('RBAC_SERVICE_URL') as string | undefined) || authServiceUrl; // RBAC moved to Auth API

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

    // User Service - in Auth API
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
      fallbackUrl: authServiceUrl,
    });

    // Pipeline Service - moved to api-pipelines microservice
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
      fallbackUrl: pipelineServiceUrl, // No fallback to monolith
    });

    // Executions Service - moved to api-pipelines microservice
    this.serviceConfigs.set('executions', {
      service: 'executions',
      defaultUrl: pipelineServiceUrl, // Same as pipelines
      versions: [
        {
          url: pipelineServiceUrl,
          version: 'v1',
          weight: 100,
          active: true,
        },
      ],
      currentVersion: 'v1',
      fallbackUrl: pipelineServiceUrl, // No fallback to monolith
    });

    // RBAC Service - moved to Auth API (requires User table)
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
      fallbackUrl: authServiceUrl, // Fallback to Auth API
    });

    // Webhooks Service - api-webhooks microservice (Port 7105)
    const webhooksServiceUrl: string =
      (this.configService.get<string>('WEBHOOKS_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_WEBHOOKS_URL') as string | undefined) ||
      'http://localhost:7105';
    this.serviceConfigs.set('webhooks', {
      service: 'webhooks',
      defaultUrl: webhooksServiceUrl,
      versions: [{ url: webhooksServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // Workflows Service - api-workflows microservice (Port 7106)
    const workflowsServiceUrl: string =
      (this.configService.get<string>('WORKFLOWS_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_WORKFLOWS_URL') as string | undefined) ||
      'http://localhost:7106';
    this.serviceConfigs.set('workflows', {
      service: 'workflows',
      defaultUrl: workflowsServiceUrl,
      versions: [{ url: workflowsServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // Workers Service - api-workers microservice (Port 7107)
    const workersServiceUrl: string =
      (this.configService.get<string>('WORKERS_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_WORKERS_URL') as string | undefined) ||
      'http://localhost:7107';
    this.serviceConfigs.set('workers', {
      service: 'workers',
      defaultUrl: workersServiceUrl,
      versions: [{ url: workersServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // AB Testing Service - api-ab-testing microservice (Port 7108)
    const abTestingServiceUrl: string =
      (this.configService.get<string>('AB_TESTING_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_AB_TESTING_URL') as string | undefined) ||
      'http://localhost:7108';
    this.serviceConfigs.set('abTests', {
      service: 'abTests',
      defaultUrl: abTestingServiceUrl,
      versions: [{ url: abTestingServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // Audit Service - api-audit microservice (Port 7109)
    const auditServiceUrl: string =
      (this.configService.get<string>('AUDIT_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_AUDIT_URL') as string | undefined) ||
      'http://localhost:7109';
    this.serviceConfigs.set('audit', {
      service: 'audit',
      defaultUrl: auditServiceUrl,
      versions: [{ url: auditServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // Integrations Service - api-integrations microservice (Port 7110)
    const integrationsServiceUrl: string =
      (this.configService.get<string>('INTEGRATIONS_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_INTEGRATIONS_URL') as string | undefined) ||
      'http://localhost:7110';
    this.serviceConfigs.set('integrations', {
      service: 'integrations',
      defaultUrl: integrationsServiceUrl,
      versions: [{ url: integrationsServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // Generation Service - api-generation microservice (Port 7111)
    const generationServiceUrl: string =
      (this.configService.get<string>('GENERATION_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_GENERATION_URL') as string | undefined) ||
      'http://localhost:7111';
    this.serviceConfigs.set('generation', {
      service: 'generation',
      defaultUrl: generationServiceUrl,
      versions: [{ url: generationServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // Admin Service - api-admin microservice (Port 7100)
    const adminServiceUrl: string =
      (this.configService.get<string>('ADMIN_SERVICE_URL') as string | undefined) ||
      (this.configService.get<string>('API_ADMIN_URL') as string | undefined) ||
      'http://localhost:7100';
    this.serviceConfigs.set('admin', {
      service: 'admin',
      defaultUrl: adminServiceUrl,
      versions: [{ url: adminServiceUrl, version: 'v1', weight: 100, active: true }],
      currentVersion: 'v1',
    });

    // Analytics - removed (was only stubs in monolith, not implemented)

    this.logger.log('Service routing configurations initialized');
  }

  /**
   * Initialize default service configurations without ConfigService
   */
  private initializeDefaultConfigs(): void {
    // Default URLs for all services
    const defaultUrls: Record<string, string> = {
      auth: 'http://localhost:7102',
      notifications: 'http://localhost:7103',
      users: 'http://localhost:7102',
      pipelines: 'http://localhost:7104',
      executions: 'http://localhost:7104',
      rbac: 'http://localhost:7102',
      webhooks: 'http://localhost:7105',
      workflows: 'http://localhost:7106',
      workers: 'http://localhost:7107',
      abTests: 'http://localhost:7108',
      audit: 'http://localhost:7109',
      integrations: 'http://localhost:7110',
      generation: 'http://localhost:7111',
      admin: 'http://localhost:7100',
    };

    for (const [service, url] of Object.entries(defaultUrls)) {
      this.serviceConfigs.set(service, {
        service,
        defaultUrl: url,
        versions: [{ url, version: 'v1', weight: 100, active: true }],
        currentVersion: 'v1',
      });
    }

    this.logger.log('Default service routing configurations initialized');
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
    const config: ServiceConfig | undefined = this.serviceConfigs.get(serviceName);

    if (!config) {
      this.logger.warn(`Service config not found: ${serviceName}, using default`);
      return this.getDockerServiceUrl(serviceName);
    }

    // If version specified, find it
    if (version) {
      const versionConfig: ServiceVersion | undefined = config.versions.find((v: ServiceVersion): boolean => v.version === version && v.active);
      if (versionConfig) {
        return versionConfig.url;
      }
      this.logger.warn(`Version ${version} not found for ${serviceName}, using current`);
    }

    // Use current version
    if (config.currentVersion) {
      const currentVersion: ServiceVersion | undefined = config.versions.find(
        (v: ServiceVersion): boolean => v.version === config.currentVersion && v.active
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
    const namespace: string = process.env.KUBERNETES_NAMESPACE || 'workix';

    const serviceMap: Record<string, string> = {
      auth: `http://auth-service.${namespace}.svc.cluster.local`,
      notifications: `http://notifications-service.${namespace}.svc.cluster.local`,
      users: `http://auth-service.${namespace}.svc.cluster.local`, // Users endpoints are in Auth API
      pipelines: `http://pipelines-service.${namespace}.svc.cluster.local`, // api-pipelines microservice (Port 7104)
      executions: `http://pipelines-service.${namespace}.svc.cluster.local`, // api-pipelines microservice (Port 7104)
      rbac: `http://auth-service.${namespace}.svc.cluster.local`, // RBAC moved to Auth API
      webhooks: `http://webhooks-service.${namespace}.svc.cluster.local`, // api-webhooks microservice (Port 7105)
      workflows: `http://workflows-service.${namespace}.svc.cluster.local`, // api-workflows microservice (Port 7106)
      workers: `http://workers-service.${namespace}.svc.cluster.local`, // api-workers microservice (Port 7107)
      abTests: `http://ab-testing-service.${namespace}.svc.cluster.local`, // api-ab-testing microservice (Port 7108)
      audit: `http://audit-service.${namespace}.svc.cluster.local`, // api-audit microservice (Port 7109)
      integrations: `http://integrations-service.${namespace}.svc.cluster.local`, // api-integrations microservice (Port 7110)
      generation: `http://generation-service.${namespace}.svc.cluster.local`, // api-generation microservice (Port 7111)
      admin: `http://admin-service.${namespace}.svc.cluster.local`, // api-admin microservice (Port 7100)
    };

    const serviceUrl: string = serviceMap[serviceName] || `http://${serviceName}-service.${namespace}.svc.cluster.local`;

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
      users: process.env.AUTH_SERVICE_URL || 'http://localhost:7102', // Users endpoints are in Auth API
      pipelines: process.env.PIPELINES_SERVICE_URL || process.env.API_PIPELINES_URL || 'http://localhost:7104', // api-pipelines microservice (Port 7104)
      executions: process.env.PIPELINES_SERVICE_URL || process.env.API_PIPELINES_URL || 'http://localhost:7104', // api-pipelines microservice (Port 7104)
      rbac: process.env.AUTH_SERVICE_URL || 'http://localhost:7102', // RBAC moved to Auth API
      webhooks: process.env.WEBHOOKS_SERVICE_URL || process.env.API_WEBHOOKS_URL || 'http://localhost:7105', // api-webhooks microservice (Port 7105)
      workflows: process.env.WORKFLOWS_SERVICE_URL || process.env.API_WORKFLOWS_URL || 'http://localhost:7106', // api-workflows microservice (Port 7106)
      workers: process.env.WORKERS_SERVICE_URL || process.env.API_WORKERS_URL || 'http://localhost:7107', // api-workers microservice (Port 7107)
      abTests: process.env.AB_TESTING_SERVICE_URL || process.env.API_AB_TESTING_URL || 'http://localhost:7108', // api-ab-testing microservice (Port 7108)
      audit: process.env.AUDIT_SERVICE_URL || process.env.API_AUDIT_URL || 'http://localhost:7109', // api-audit microservice (Port 7109)
      integrations: process.env.INTEGRATIONS_SERVICE_URL || process.env.API_INTEGRATIONS_URL || 'http://localhost:7110', // api-integrations microservice (Port 7110)
      generation: process.env.GENERATION_SERVICE_URL || process.env.API_GENERATION_URL || 'http://localhost:7111', // api-generation microservice (Port 7111)
      admin: process.env.ADMIN_SERVICE_URL || process.env.API_ADMIN_URL || 'http://localhost:7100', // api-admin microservice (Port 7100)
    };

    const serviceUrl: string = envMap[serviceName] || 'http://localhost:7102'; // Default to auth service

    this.logger.debug(`Docker Compose mode: ${serviceName} → ${serviceUrl}`);
    return serviceUrl;
  }

  /**
   * Add new service version (for testing new servers)
   * Can be called via API without restart
   */
  addServiceVersion(serviceName: string, version: ServiceVersion): void {
    const config: ServiceConfig | undefined = this.serviceConfigs.get(serviceName);
    if (!config) {
      this.logger.error(`Service config not found: ${serviceName}`);
      return;
    }

    // Check if version already exists
    const existingIndex: number = config.versions.findIndex((v: ServiceVersion): boolean => v.version === version.version);
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
    const config: ServiceConfig | undefined = this.serviceConfigs.get(serviceName);
    if (!config) {
      this.logger.error(`Service config not found: ${serviceName}`);
      return false;
    }

    const versionConfig: ServiceVersion | undefined = config.versions.find((v: ServiceVersion): boolean => v.version === version);
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
    const existing: ServiceConfig | undefined = this.serviceConfigs.get(serviceName);
    if (!existing) {
      this.logger.error(`Service config not found: ${serviceName}`);
      return;
    }

    Object.assign(existing, config);
    this.logger.log(`Updated service config for ${serviceName}`);
  }
}
