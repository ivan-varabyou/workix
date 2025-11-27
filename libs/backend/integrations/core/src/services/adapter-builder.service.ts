import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { BasePayload, isBasePayload } from '../interfaces/integration-payload.interface';
import {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../interfaces/integration-provider.interface';
import { IntegrationRouter } from '../router/integration.router';
import { AdapterConfig, AdminApiManagementService } from './admin-api-management.service';

/**
 * Adapter Builder Service
 * Creates new API adapters dynamically
 */
@Injectable()
export class AdapterBuilderService {
  private readonly logger = new Logger(AdapterBuilderService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly adminApiManagement: AdminApiManagementService,
    private readonly integrationRouter: IntegrationRouter,
    private i18n: I18nService
  ) {}

  /**
   * Create adapter from configuration
   */
  async createAdapter(config: AdapterConfig): Promise<IntegrationProvider> {
    try {
      // Validate configuration
      this.validateAdapterConfig(config);

      // Create provider in database
      await this.adminApiManagement.upsertProvider(config.id, config.name, config.capabilities);

      // Create adapter implementation
      const adapter = this.buildAdapter(config);

      // Register adapter with IntegrationRouter
      this.integrationRouter.register(adapter);

      this.logger.log(`Adapter ${config.id} created and registered successfully`);
      return adapter;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to create adapter: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Validate adapter configuration
   */
  private validateAdapterConfig(config: AdapterConfig): void {
    if (!config.id || !config.name || !config.baseUrl) {
      throw new BadRequestException(this.i18n.translate('admin.adapter_config_invalid'));
    }

    if (!config.capabilities || config.capabilities.length === 0) {
      throw new BadRequestException(this.i18n.translate('admin.adapter_no_capabilities'));
    }

    if (!config.endpoints || Object.keys(config.endpoints).length === 0) {
      throw new BadRequestException(this.i18n.translate('admin.adapter_no_endpoints'));
    }

    // Validate auth configuration
    if (config.authType !== 'none' && !config.authConfig) {
      throw new BadRequestException(this.i18n.translate('admin.adapter_auth_config_required'));
    }
  }

  /**
   * Build adapter implementation from configuration
   */
  private buildAdapter(config: AdapterConfig): IntegrationProvider {
    const validCapabilities = config.capabilities.filter((cap): cap is IntegrationCapability => {
      const enumValues: string[] = Object.values(IntegrationCapability) as string[];
      return typeof cap === 'string' && enumValues.includes(cap);
    });

    const adapter: IntegrationProvider = {
      id: config.id,
      name: config.name,
      capabilities: validCapabilities,
      supports: (operation: string, capability: IntegrationCapability) => {
        return validCapabilities.includes(capability) && config.endpoints[operation] !== undefined;
      },
      execute: async <T = unknown>(
        request: IntegrationRequest
      ): Promise<IntegrationResponse<T>> => {
        return await this.executeRequest<T>(config, request);
      },
      healthCheck: async (): Promise<boolean> => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(config.baseUrl, {
              timeout: 5000,
            })
          );
          return response.status === 200 || response.status === 404; // 404 is OK for base URL
        } catch (error) {
          return false;
        }
      },
      getInfo: () => ({
        id: config.id,
        name: config.name,
        capabilities: validCapabilities,
        status: 'active',
      }),
    };

    return adapter;
  }

  /**
   * Execute request using adapter configuration
   */
  private async executeRequest<T = BasePayload>(
    config: AdapterConfig,
    request: IntegrationRequest
  ): Promise<IntegrationResponse<T>> {
    const endpoint: AdapterConfig['endpoints'][string] | undefined =
      config.endpoints[request.operation];
    if (!endpoint) {
      throw new Error(
        this.i18n.translate('admin.adapter_operation_not_supported', {
          operation: request.operation,
        })
      );
    }

    const url = `${config.baseUrl}${endpoint.path}`;
    const headers: Record<string, string> = this.buildHeaders(config, endpoint);
    const params: Record<string, unknown> = this.buildQueryParams(endpoint, request.params);

    try {
      let response: AxiosResponse<T>;

      switch (endpoint.method) {
        case 'GET':
          response = await firstValueFrom(this.httpService.get<T>(url, { headers, params }));
          break;
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post<T>(url, (request.data ?? {}) as T, { headers, params })
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put<T>(url, (request.data ?? {}) as T, { headers, params })
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(this.httpService.delete<T>(url, { headers, params }));
          break;
        case 'PATCH':
          response = await firstValueFrom(
            this.httpService.patch<T>(url, (request.data ?? {}) as T, { headers, params })
          );
          break;
        default:
          throw new Error(
            this.i18n.translate('admin.adapter_unsupported_method', { method: endpoint.method })
          );
      }

      // Apply response mapping if configured
      let data: T = response.data;
      if (config.responseMapping?.[request.operation]) {
        const mapping = config.responseMapping[request.operation];
        if (mapping && mapping.dataPath && isBasePayload(data)) {
          const nestedValue = this.getNestedValue(data, mapping.dataPath);
          if (nestedValue !== undefined) {
            // Type narrowing: nestedValue is BasePayload | string | number | boolean | undefined
            // After check it's not undefined, we can safely use it as T
            data = nestedValue as T;
          }
        }
        if (mapping && mapping.transform && isBasePayload(data)) {
          const transformed = mapping.transform(data);
          // Transform function returns BasePayload, but we need T
          // This is acceptable as transform is user-defined and should return compatible type
          data = transformed as T;
        }
      }

      const result: IntegrationResponse<T> = {
        id: request.id || `${config.id}-${Date.now()}`,
        provider: config.id,
        providerId: config.id,
        operation: request.operation,
        data,
        success: true,
        timestamp: new Date(),
        latencyMs: 0, // Would be calculated from start time
      };
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Adapter execution failed: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Build headers for request
   */
  private buildHeaders(
    config: AdapterConfig,
    endpoint: AdapterConfig['endpoints'][string]
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...endpoint.headers,
    };

    // Add authentication headers
    if (config.authType === 'api_key' && config.authConfig) {
      if (config.authConfig.apiKeyHeader) {
        headers[config.authConfig.apiKeyHeader] = config.authConfig.apiKeyQuery || '';
      }
    } else if (config.authType === 'bearer' && config.authConfig?.bearerToken) {
      headers['Authorization'] = `Bearer ${config.authConfig.bearerToken}`;
    } else if (config.authType === 'basic' && config.authConfig) {
      const credentials = Buffer.from(
        `${config.authConfig.basicUsername}:${config.authConfig.basicPassword}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    return headers;
  }

  /**
   * Build query parameters
   */
  private buildQueryParams(
    endpoint: AdapterConfig['endpoints'][string],
    requestParams?: Record<string, unknown>
  ): Record<string, unknown> {
    const params: Record<string, unknown> = {
      ...endpoint.queryParams,
      ...requestParams,
    };

    return params;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(
    obj: BasePayload,
    path: string
  ): BasePayload | string | number | boolean | undefined {
    const keys: string[] = path.split('.');
    let value: BasePayload | string | number | boolean | undefined = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        if (isBasePayload(value)) {
          const keyValue: unknown = value[key];
          if (
            typeof keyValue === 'string' ||
            typeof keyValue === 'number' ||
            typeof keyValue === 'boolean' ||
            isBasePayload(keyValue)
          ) {
            value = keyValue as BasePayload | string | number | boolean;
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
    return value;
  }

  /**
   * Update adapter configuration
   */
  async updateAdapter(adapterId: string, config: Partial<AdapterConfig>): Promise<void> {
    try {
      // Validate updated configuration
      if (config.id && config.id !== adapterId) {
        throw new BadRequestException(this.i18n.translate('admin.adapter_id_mismatch'));
      }

      // Update provider in database
      if (config.name || config.capabilities) {
        await this.adminApiManagement.upsertProvider(
          adapterId,
          config.name || adapterId,
          config.capabilities || []
        );
      }

      this.logger.log(`Adapter ${adapterId} updated successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to update adapter: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Test adapter configuration
   */
  async testAdapter(
    config: AdapterConfig
  ): Promise<{ success: boolean; latency?: number; error?: string }> {
    try {
      this.validateAdapterConfig(config);

      const startTime = Date.now();
      const response = await firstValueFrom(
        this.httpService.get(config.baseUrl, {
          timeout: 5000,
          headers: this.buildHeaders(config, { method: 'GET', path: '/' }),
        })
      );
      const latency = Date.now() - startTime;

      return {
        success: response.status >= 200 && response.status < 300,
        latency,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
