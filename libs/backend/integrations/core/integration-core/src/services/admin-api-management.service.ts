import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';

import {
  ProviderDetails,
  ProviderListItem,
  ProviderStats,
} from '../../../src/interfaces/admin-api.interface';
import { BasePayload } from '../../../src/interfaces/integration-payload.interface';
import { ProviderRegistryPrismaService } from '../../../src/interfaces/provider-registry.interface';
import { IntegrationRouter } from '../router/integration.router';
import { ProviderRegistryService } from './provider-registry.service';

/**
 * Adapter Configuration
 */
export interface AdapterConfig {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  authType: 'none' | 'api_key' | 'oauth2' | 'bearer' | 'basic';
  authConfig?: {
    apiKeyHeader?: string;
    apiKeyQuery?: string;
    oauth2ClientId?: string;
    oauth2ClientSecret?: string;
    bearerToken?: string;
    basicUsername?: string;
    basicPassword?: string;
  };
  capabilities: string[];
  endpoints: {
    [operation: string]: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      path: string;
      headers?: Record<string, string>;
      queryParams?: Record<string, string>;
      bodySchema?: BasePayload;
    };
  };
  responseMapping?: {
    [operation: string]: {
      dataPath?: string;
      errorPath?: string;
      transform?: (data: BasePayload) => BasePayload;
    };
  };
  rateLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  retryConfig?: {
    maxRetries?: number;
    retryDelay?: number;
    retryableStatusCodes?: number[];
  };
}

/**
 * Admin API Management Service
 * Manages API integrations and adapter creation
 */
@Injectable()
export class AdminApiManagementService {
  private readonly logger = new Logger(AdminApiManagementService.name);

  constructor(
    private readonly integrationRouter: IntegrationRouter,
    private readonly providerRegistry: ProviderRegistryService,
    @Inject('PrismaService') private readonly prisma: ProviderRegistryPrismaService,
    private i18n: I18nService
  ) {}

  /**
   * List all registered providers
   */
  async listProviders(): Promise<ProviderListItem[]> {
    try {
      const providers = await this.providerRegistry.listProviders();
      return providers.map((provider) => {
        const capabilities =
          provider.config &&
          typeof provider.config === 'object' &&
          'capabilities' in provider.config
            ? Array.isArray(provider.config.capabilities)
              ? provider.config.capabilities.filter((cap): cap is string => typeof cap === 'string')
              : []
            : [];
        const item: ProviderListItem = {
          id: provider.id,
          name: provider.name,
          capabilities,
          status: provider.isActive ? 'active' : 'inactive',
        };
        if (provider.createdAt !== undefined) {
          item.createdAt = provider.createdAt;
        }
        if (provider.updatedAt !== undefined) {
          item.updatedAt = provider.updatedAt;
        }
        return item;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to list providers: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get provider details
   */
  async getProvider(providerId: string): Promise<ProviderDetails> {
    try {
      const providers = await this.providerRegistry.listProviders();
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) {
        throw new NotFoundException(
          this.i18n.translate('admin.provider_not_found', { providerId })
        );
      }
      const capabilities =
        provider.config && typeof provider.config === 'object' && 'capabilities' in provider.config
          ? Array.isArray(provider.config.capabilities)
            ? provider.config.capabilities.filter((cap): cap is string => typeof cap === 'string')
            : []
          : [];
      const details: ProviderDetails = {
        id: provider.id,
        name: provider.name,
        capabilities,
        status: provider.isActive ? 'active' : 'inactive',
      };
      if (provider.createdAt !== undefined) {
        details.createdAt = provider.createdAt;
      }
      if (provider.updatedAt !== undefined) {
        details.updatedAt = provider.updatedAt;
      }
      return details;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get provider: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Create or update provider
   */
  async upsertProvider(
    providerId: string,
    name: string,
    capabilities: string[]
  ): Promise<ProviderDetails> {
    try {
      const provider = await this.providerRegistry.upsertProvider(providerId, name, capabilities);
      return {
        ...provider,
        capabilities,
        status: provider.isActive ? 'active' : 'inactive',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to upsert provider: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete provider
   */
  async deleteProvider(providerId: string): Promise<void> {
    try {
      const provider = await this.providerRegistry.getProvider(providerId);
      if (!provider) {
        throw new NotFoundException(
          this.i18n.translate('admin.provider_not_found', { providerId })
        );
      }

      await this.prisma.integrationProvider.update({
        where: { id: providerId },
        data: { isActive: false },
      });

      this.logger.log(`Provider ${providerId} deactivated`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to delete provider: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Test provider connection
   */
  async testProvider(
    providerId: string
  ): Promise<{ success: boolean; latency?: number; error?: string }> {
    try {
      const providers = await this.providerRegistry.listProviders();
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) {
        throw new NotFoundException(
          this.i18n.translate('admin.provider_not_found', { providerId })
        );
      }

      // Get provider from router to check health
      const routerProvider = this.integrationRouter.get(providerId);
      if (!routerProvider) {
        return {
          success: false,
          error: this.i18n.translate('admin.provider_not_registered'),
        };
      }

      const startTime = Date.now();
      const healthCheck = routerProvider.healthCheck ? await routerProvider.healthCheck() : true;
      const latency = Date.now() - startTime;

      const result: {
        success: boolean;
        latency?: number;
        error?: string;
      } = {
        success: healthCheck === true,
      };
      if (latency !== undefined) {
        result.latency = latency;
      }
      if (healthCheck !== true) {
        result.error = this.i18n.translate('admin.provider_unhealthy');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to test provider: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(
    providerId: string,
    period: '1d' | '7d' | '30d' = '7d'
  ): Promise<ProviderStats> {
    try {
      const providers = await this.providerRegistry.listProviders();
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) {
        throw new NotFoundException(
          this.i18n.translate('admin.provider_not_found', { providerId })
        );
      }

      const days = period === '1d' ? 1 : period === '7d' ? 7 : 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      if (!this.prisma.integrationEvent) {
        // integrationEvent is optional in ProviderRegistryPrismaService
        // Log warning and return default stats
        this.logger.warn(
          `integrationEvent is not available for provider ${providerId}, returning default stats`
        );
        return {
          providerId,
          period,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageLatency: 0,
          successRate: 0,
        };
      }

      const stats = await this.prisma.integrationEvent.aggregate({
        where: {
          providerId,
          timestamp: { gte: startDate },
        },
        _count: { id: true },
        _avg: { latencyMs: true },
        _sum: { success: true },
      });

      const failures = await this.prisma.integrationEvent.count({
        where: {
          providerId,
          timestamp: { gte: startDate },
          success: false,
        },
      });

      return {
        providerId,
        period,
        totalRequests: stats._count.id || 0,
        successfulRequests: stats._sum.success || 0,
        failedRequests: failures || 0,
        averageLatency: stats._avg.latencyMs || 0,
        successRate: stats._count.id > 0 ? ((stats._sum.success || 0) / stats._count.id) * 100 : 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to get provider stats: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
