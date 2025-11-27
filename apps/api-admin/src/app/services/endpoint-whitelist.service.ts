import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Endpoint Whitelist Service
 * Manages allowed endpoints and API versions for applications
 * Prevents unauthorized access to internal ports/versions
 */
export interface ApplicationConfig {
  appId: string;
  appName: string;
  allowedEndpoints: string[]; // e.g., ['/api/v1/auth/login', '/api/v1/users/*']
  allowedVersions: string[]; // e.g., ['v1', 'v2']
  allowedServices: string[]; // e.g., ['auth', 'users', 'pipelines']
  allowedPorts?: number[]; // Optional: restrict to specific ports
  apiKey?: string; // API key for authentication
  active: boolean;
}

@Injectable()
export class EndpointWhitelistService implements OnModuleInit {
  private readonly logger: Logger = new Logger(EndpointWhitelistService.name);

  // Application configurations
  private applications: Map<string, ApplicationConfig> = new Map();

  // Default allowed endpoints (public endpoints)
  private readonly defaultPublicEndpoints = [
    '/api/v1/health',
    '/api/v1/auth/register',
    '/api/v1/auth/login',
    '/api/v1/auth/verify',
    '/api/v1/docs',
  ];

  constructor(private readonly configService: ConfigService | undefined) {}

  onModuleInit(): void {
    // Временно используем значения по умолчанию для быстрого запуска
    // TODO: Исправить инжекцию ConfigService
    if (this.configService) {
      this.initializeApplications();
    } else {
      this.logger.warn('ConfigService not available, using default applications');
      this.initializeDefaultApplications();
    }
  }

  /**
   * Initialize application configurations
   * Can be loaded from database, config file, or environment variables
   */
  private initializeApplications(): void {
    // Явная проверка ConfigService для безопасности
    if (!this.configService) {
      this.logger.warn('ConfigService not available, using default applications');
      this.initializeDefaultApplications();
      return;
    }

    // Load from environment or config
    const appsConfig: string | undefined = (this.configService.get<string>('ALLOWED_APPLICATIONS') as string | undefined);

    if (appsConfig) {
      try {
        // eslint-disable-next-line no-restricted-syntax, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
        const apps: ApplicationConfig[] = JSON.parse(appsConfig) as ApplicationConfig[];
        apps.forEach((app) => {
          this.applications.set(app.appId, app);
        });
      } catch (error) {
        this.logger.warn('Failed to parse ALLOWED_APPLICATIONS config');
      }
    }

    // Default: admin-dashboard and client-app
    if (this.applications.size === 0) {
      this.applications.set('admin-dashboard', {
        appId: 'admin-dashboard',
        appName: 'Admin Dashboard',
        allowedEndpoints: ['/api/v1/**'], // All endpoints
        allowedVersions: ['v1'],
        allowedServices: [
          'auth',
          'users',
          'pipelines',
          'rbac',
          'analytics',
          'integrations',
          'workers',
        ],
        active: true,
      });

      this.applications.set('client-app', {
        appId: 'client-app',
        appName: 'Client App',
        allowedEndpoints: [
          '/api/v1/auth/**',
          '/api/v1/users/**',
          '/api/v1/pipelines/**',
          '/api/v1/executions/**',
        ],
        allowedVersions: ['v1'],
        allowedServices: ['auth', 'users', 'pipelines'],
        active: true,
      });
    }

    this.logger.log(`Initialized ${this.applications.size} application configurations`);
  }

  /**
   * Check if endpoint is allowed for application
   */
  isEndpointAllowed(appId: string, path: string, version?: string): boolean {
    const app: ApplicationConfig | undefined = this.applications.get(appId);

    if (!app || !app.active) {
      this.logger.warn(`Application ${appId} not found or inactive`);
      return false;
    }

    // Check version
    if (version && !app.allowedVersions.includes(version)) {
      this.logger.warn(`Version ${version} not allowed for ${appId}`);
      return false;
    }

    // Check if path matches any allowed endpoint pattern
    const normalizedPath: string = this.normalizePath(path);

    // Check exact match
    if (app.allowedEndpoints.includes(normalizedPath)) {
      return true;
    }

    // Check wildcard patterns
    for (const pattern of app.allowedEndpoints) {
      if (this.matchesPattern(normalizedPath, pattern)) {
        return true;
      }
    }

    // Check if it's a public endpoint
    if (this.isPublicEndpoint(normalizedPath)) {
      return true;
    }

    this.logger.warn(`Endpoint ${normalizedPath} not allowed for ${appId}`);
    return false;
  }

  /**
   * Check if service is allowed for application
   */
  isServiceAllowed(appId: string, serviceName: string): boolean {
    const app: ApplicationConfig | undefined = this.applications.get(appId);

    if (!app || !app.active) {
      return false;
    }

    // If allowedServices is empty or contains '*', allow all
    if (app.allowedServices.length === 0 || app.allowedServices.includes('*')) {
      return true;
    }

    return app.allowedServices.includes(serviceName);
  }

  /**
   * Check if version is allowed for application
   */
  isVersionAllowed(appId: string, version: string): boolean {
    const app: ApplicationConfig | undefined = this.applications.get(appId);

    if (!app || !app.active) {
      return false;
    }

    return app.allowedVersions.includes(version);
  }

  /**
   * Check if port is allowed for application
   */
  isPortAllowed(appId: string, port: number): boolean {
    const app: ApplicationConfig | undefined = this.applications.get(appId);

    if (!app || !app.active) {
      return false;
    }

    // If no port restrictions, allow all
    if (!app.allowedPorts || app.allowedPorts.length === 0) {
      return true;
    }

    return app.allowedPorts.includes(port);
  }

  /**
   * Verify API key for application
   */
  verifyApiKey(appId: string, apiKey: string): boolean {
    const app: ApplicationConfig | undefined = this.applications.get(appId);

    if (!app || !app.active) {
      return false;
    }

    // If no API key required, allow
    if (!app.apiKey) {
      return true;
    }

    return app.apiKey === apiKey;
  }

  /**
   * Get application configuration
   */
  getApplication(appId: string): ApplicationConfig | undefined {
    return this.applications.get(appId);
  }

  /**
   * Add or update application configuration
   */
  setApplication(config: ApplicationConfig): void {
    this.applications.set(config.appId, config);
    this.logger.log(`Updated application config: ${config.appId}`);
  }

  /**
   * Get all applications
   */
  getAllApplications(): Map<string, ApplicationConfig> {
    return new Map(this.applications);
  }

  /**
   * Normalize path (remove query params, ensure /api/v1/ prefix)
   */
  private normalizePath(path: string): string {
    // Remove query params
    const cleanPath: string = path.split('?')[0] || path;

    // Ensure /api/v1/ prefix
    if (!cleanPath.startsWith('/api/v')) {
      // If no version, assume v1
      if (cleanPath.startsWith('/api/')) {
        return cleanPath.replace('/api/', '/api/v1/');
      }
      return `/api/v1${cleanPath}`;
    }

    return cleanPath;
  }

  /**
   * Check if path matches pattern (supports wildcards)
   */
  private matchesPattern(path: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern: string = pattern
      .replace(/\*\*/g, '.*') // ** matches any path
      .replace(/\*/g, '[^/]*') // * matches any segment
      .replace(/\//g, '\\/'); // Escape slashes

    const regex: RegExp = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Check if endpoint is public (no authentication required)
   * Made public for use in guards
   */
  isPublicEndpoint(path: string): boolean {
    return this.defaultPublicEndpoints.some((pattern) => this.matchesPattern(path, pattern));
  }

  /**
   * Initialize default applications without ConfigService
   */
  private initializeDefaultApplications(): void {
    // Default: admin-dashboard and client-app
    this.applications.set('admin-dashboard', {
      appId: 'admin-dashboard',
      appName: 'Admin Dashboard',
      allowedEndpoints: ['/api/v1/**'], // All endpoints
      allowedVersions: ['v1'],
      allowedServices: [
        'auth',
        'users',
        'pipelines',
        'rbac',
        'analytics',
        'integrations',
        'workers',
      ],
      active: true,
    });

    this.applications.set('client-app', {
      appId: 'client-app',
      appName: 'Client App',
      allowedEndpoints: [
        '/api/v1/auth/**',
        '/api/v1/users/**',
        '/api/v1/pipelines/**',
        '/api/v1/executions/**',
      ],
      allowedVersions: ['v1'],
      allowedServices: ['auth', 'users', 'pipelines'],
      active: true,
    });

    this.logger.log(`Initialized ${this.applications.size} default application configurations`);
  }
}
