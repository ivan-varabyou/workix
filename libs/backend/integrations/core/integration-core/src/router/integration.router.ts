import { Injectable, Logger, Optional } from '@nestjs/common';

import { IntegrationEventPrismaService } from '../../../src/interfaces/integration-event.interface';
import { BasePayload, isBasePayload } from '../../../src/interfaces/integration-payload.interface';
import { ProviderRegistryPrismaService } from '../../../src/interfaces/provider-registry.interface';
import {
  IntegrationProvider,
  IntegrationRequest,
  IntegrationResponse,
} from '../interfaces/integration-provider.interface';
import { IntegrationEventLoggerService } from '../services/integration-event-logger.service';

// PrismaService will be injected via DI
type RouterPrismaService = ProviderRegistryPrismaService & {
  integrationEvent: IntegrationEventPrismaService['integrationEvent'];
  integrationConfig?: {
    findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
    findFirst: (args?: {
      where?: Record<string, unknown>;
    }) => Promise<Record<string, unknown> | null>;
    create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<Record<string, unknown>>;
  };
};

interface ProviderScore {
  provider: IntegrationProvider;
  score: number;
  weight: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
  recentErrors: number;
}

@Injectable()
export class IntegrationRouter {
  private logger = new Logger(IntegrationRouter.name);
  private providers: Map<string, IntegrationProvider> = new Map();
  private healthCache: Map<string, { status: string; timestamp: number }> = new Map();
  private readonly HEALTH_CACHE_TTL = 60000; // 1 minute

  constructor(
    @Optional() private eventLogger?: IntegrationEventLoggerService,
    @Optional() private prisma?: RouterPrismaService
  ) {}

  register(provider: IntegrationProvider) {
    this.providers.set(provider.id, provider);
    this.logger.log(`Integration provider registered: ${provider.id}`);
  }

  list(): string[] {
    return Array.from(this.providers.keys());
  }

  get(id: string): IntegrationProvider | undefined {
    return this.providers.get(id);
  }

  private filterProviders(
    request: IntegrationRequest,
    preferredProviders?: string[]
  ): IntegrationProvider[] {
    const all =
      preferredProviders && preferredProviders.length
        ? preferredProviders
            .map((id) => this.providers.get(id))
            .filter((p): p is IntegrationProvider => p !== undefined && p !== null)
        : Array.from(this.providers.values());

    return all.filter((p) => p.supports(request.operation, request.capability));
  }

  /**
   * Gets provider health status from cache or DB
   */
  private async getProviderHealth(
    providerId: string
  ): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    const cached = this.healthCache.get(providerId);
    if (cached && Date.now() - cached.timestamp < this.HEALTH_CACHE_TTL) {
      return cached.status as 'healthy' | 'degraded' | 'unhealthy';
    }

    if (!this.prisma) {
      return 'healthy'; // Default to healthy if no DB access
    }

    try {
      const provider = await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        return 'unhealthy';
      }

      const config: BasePayload = isBasePayload(provider.config) ? provider.config : {};
      const dbStatus = String(config.healthStatus || 'UNKNOWN');
      let health: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (dbStatus === 'OUTAGE') {
        health = 'unhealthy';
      } else if (dbStatus === 'DEGRADED') {
        health = 'degraded';
      }

      // Check recent errors
      const recentErrors = await this.prisma.integrationEvent.count({
        where: {
          providerId,
          status: 'FAILED',
          createdAt: {
            gte: new Date(Date.now() - 3600000), // Last hour
          },
        },
      });

      if (recentErrors > 10) {
        health = 'unhealthy';
      } else if (recentErrors > 5) {
        health = health === 'unhealthy' ? 'unhealthy' : 'degraded';
      }

      this.healthCache.set(providerId, { status: health, timestamp: Date.now() });
      return health;
    } catch (error) {
      this.logger.warn(`Failed to get health for provider ${providerId}:`, error);
      return 'healthy'; // Default to healthy on error
    }
  }

  /**
   * Gets provider weight from DB config
   */
  private async getProviderWeight(providerId: string): Promise<number> {
    if (!this.prisma) {
      return 1.0; // Default weight
    }

    try {
      const provider = await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        return 1.0;
      }

      const config: BasePayload = isBasePayload(provider.config) ? provider.config : {};
      const analyticsWeightRaw = config.ANALYTICS_WEIGHT;
      const analyticsWeight: BasePayload | string | number | undefined =
        analyticsWeightRaw &&
        (isBasePayload(analyticsWeightRaw) ||
          typeof analyticsWeightRaw === 'string' ||
          typeof analyticsWeightRaw === 'number')
          ? isBasePayload(analyticsWeightRaw)
            ? analyticsWeightRaw
            : (analyticsWeightRaw as string | number)
          : undefined;

      if (analyticsWeight && typeof analyticsWeight === 'object') {
        const weightValue =
          'weight' in analyticsWeight && typeof analyticsWeight.weight === 'number'
            ? analyticsWeight.weight
            : undefined;
        const priorityValue =
          'priority' in analyticsWeight && typeof analyticsWeight.priority === 'number'
            ? analyticsWeight.priority
            : undefined;
        if (weightValue !== undefined) {
          return weightValue;
        }
        if (priorityValue !== undefined) {
          return 1.0 / priorityValue;
        }
      }
      if (typeof analyticsWeight === 'number') {
        return analyticsWeight;
      }

      return 1.0;
    } catch (error) {
      this.logger.warn(`Failed to get weight for provider ${providerId}:`, error);
      return 1.0;
    }
  }

  /**
   * Calculates score for a provider based on weight, health, and recent errors
   */
  private async calculateProviderScore(provider: IntegrationProvider): Promise<ProviderScore> {
    const [weight, health] = await Promise.all([
      this.getProviderWeight(provider.id),
      this.getProviderHealth(provider.id),
    ]);

    let recentErrors = 0;
    if (this.prisma) {
      try {
        recentErrors = await this.prisma.integrationEvent.count({
          where: {
            providerId: provider.id,
            status: 'FAILED',
            createdAt: {
              gte: new Date(Date.now() - 3600000), // Last hour
            },
          },
        });
      } catch (error) {
        // Ignore errors
      }
    }

    // Calculate score: weight * health_multiplier * error_penalty
    let score = weight;
    if (health === 'healthy') {
      score *= 1.0;
    } else if (health === 'degraded') {
      score *= 0.7;
    } else {
      score *= 0.3; // unhealthy
    }

    // Penalty for recent errors
    if (recentErrors > 0) {
      score *= Math.max(0.5, 1.0 - recentErrors * 0.05);
    }

    return {
      provider,
      score,
      weight,
      health,
      recentErrors,
    };
  }

  /**
   * Selects best provider using weighted scoring
   */
  private async selectBestProvider(
    suitable: IntegrationProvider[]
  ): Promise<IntegrationProvider[]> {
    if (suitable.length === 0) return [];

    // Calculate scores for all providers
    const scores = await Promise.all(suitable.map((p) => this.calculateProviderScore(p)));

    // Filter out unhealthy providers (unless all are unhealthy)
    const hasHealthy = scores.some((s) => s.health === 'healthy');
    const filtered = hasHealthy ? scores.filter((s) => s.health !== 'unhealthy') : scores;

    // Sort by score (descending)
    filtered.sort((a, b) => b.score - a.score);

    return filtered.map((s) => s.provider);
  }

  async execute<T = BasePayload>(
    request: IntegrationRequest,
    preferredProviders?: string[]
  ): Promise<IntegrationResponse<T>> {
    const suitable = this.filterProviders(request, preferredProviders);
    if (suitable.length === 0)
      throw new Error(`No provider supports ${request.capability}:${request.operation}`);

    // Use weighted scoring to select best providers
    const ranked = await this.selectBestProvider(suitable);
    if (ranked.length === 0)
      throw new Error(`No healthy provider supports ${request.capability}:${request.operation}`);

    // Try providers in order of score (best first), with failover
    let lastError: Error | null = null;
    for (const p of ranked) {
      const startTime = Date.now();
      try {
        const res = await p.execute<T>(request);
        const latencyMs = Date.now() - startTime;

        // Log success
        await this.eventLogger?.logSuccess(p.id, request.operation, latencyMs, undefined, {
          capability: request.capability,
          requestId: request.id,
        });

        return res;
      } catch (e) {
        const latencyMs = Date.now() - startTime;
        lastError = e instanceof Error ? e : new Error(String(e));

        // Log failure
        await this.eventLogger?.logFailure(
          p.id,
          request.operation,
          e instanceof Error ? e : new Error(String(e)),
          latencyMs,
          { capability: request.capability, requestId: request.id }
        );

        this.logger.warn(`Provider ${p.id} failed: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
    }
    throw lastError || new Error('All providers failed');
  }

  async executeParallel<T = BasePayload>(
    request: IntegrationRequest,
    count = 2,
    preferredProviders?: string[]
  ): Promise<IntegrationResponse<T>[]> {
    const suitable = this.filterProviders(request, preferredProviders).slice(0, count);
    if (suitable.length === 0)
      throw new Error(`No provider supports ${request.capability}:${request.operation}`);

    const results = await Promise.allSettled(
      suitable.map(async (p) => {
        const startTime = Date.now();
        try {
          const res = await p.execute<T>(request);
          const latencyMs = Date.now() - startTime;

          // Log success
          await this.eventLogger?.logSuccess(p.id, request.operation, latencyMs, undefined, {
            capability: request.capability,
            requestId: request.id,
          });

          return res;
        } catch (e) {
          const latencyMs = Date.now() - startTime;

          // Log failure
          await this.eventLogger?.logFailure(
            p.id,
            request.operation,
            e instanceof Error ? e : new Error(String(e)),
            latencyMs,
            { capability: request.capability, requestId: request.id }
          );

          throw e;
        }
      })
    );

    const ok = results
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter((v): v is IntegrationResponse<T> => v !== null);

    if (ok.length === 0) throw new Error('All providers failed in parallel execution');
    return ok;
  }
}
