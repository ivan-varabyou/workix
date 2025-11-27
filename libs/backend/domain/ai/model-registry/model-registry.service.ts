import { Injectable, Logger } from '@nestjs/common';

import {
  AIModelEntity,
  AIProviderEntity,
  ModelRegistryPrismaService,
} from '../interfaces/ai-prisma.interface';
import { AICapability, AIProvider } from '../interfaces/ai-provider.interface';

export interface ModelConfig {
  id: string;
  modelId: string;
  providerId: string;
  capability: AICapability;
  name: string;
  version?: string;
  isActive: boolean;
  isExperimental: boolean;
  preferred: boolean;

  // Pricing
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  costPerRequest?: number;

  // Performance
  avgResponseTimeMs?: number;
  successRate?: number;
  qualityScore?: number;

  // Limits
  maxTokens?: number;
  maxBatchSize?: number;

  // Config
  defaultConfig?: Record<string, unknown>;
}

@Injectable()
export class ModelRegistry {
  private logger = new Logger(ModelRegistry.name);
  private providers: Map<string, AIProvider> = new Map();
  private models: Map<string, ModelConfig> = new Map();

  constructor(private prisma: ModelRegistryPrismaService) {}

  /**
   * Initialize registry from database
   */
  async initialize(): Promise<void> {
    try {
      const dbProviders: AIProviderEntity[] = await this.prisma.aiProvider.findMany();
      const dbModels: AIModelEntity[] = await this.prisma.aiModel.findMany();

      for (const provider of dbProviders) {
        // Provider config loaded from database
        // const _config = {
        //   ...provider,
        //   capabilities: provider.capabilities as AICapability[],
        // };
        this.logger.log(`Loaded provider: ${provider.providerId}`);
      }

      for (const model of dbModels) {
        const modelConfig: ModelConfig = {
          id: model.id,
          modelId: model.modelId,
          providerId: model.providerId,
          capability: model.capability as AICapability,
          name: model.name,
          isActive: model.isActive,
          isExperimental: model.isExperimental,
          preferred: model.preferred,
        };
        if (model.version !== undefined && model.version !== null) {
          modelConfig.version = model.version;
        }
        if (model.costPer1kInputTokens !== undefined && model.costPer1kInputTokens !== null) {
          modelConfig.costPer1kInputTokens = model.costPer1kInputTokens;
        }
        if (model.costPer1kOutputTokens !== undefined && model.costPer1kOutputTokens !== null) {
          modelConfig.costPer1kOutputTokens = model.costPer1kOutputTokens;
        }
        if (model.costPerRequest !== undefined && model.costPerRequest !== null) {
          modelConfig.costPerRequest = model.costPerRequest;
        }
        if (model.avgResponseTimeMs !== undefined && model.avgResponseTimeMs !== null) {
          modelConfig.avgResponseTimeMs = model.avgResponseTimeMs;
        }
        if (model.successRate !== undefined && model.successRate !== null) {
          modelConfig.successRate = model.successRate;
        }
        if (model.qualityScore !== undefined && model.qualityScore !== null) {
          modelConfig.qualityScore = model.qualityScore;
        }
        if (model.maxTokens !== undefined && model.maxTokens !== null) {
          modelConfig.maxTokens = model.maxTokens;
        }
        if (model.maxBatchSize !== undefined && model.maxBatchSize !== null) {
          modelConfig.maxBatchSize = model.maxBatchSize;
        }
        if (model.defaultConfig !== undefined && model.defaultConfig !== null) {
          modelConfig.defaultConfig = JSON.parse(model.defaultConfig as string);
        }
        this.models.set(model.modelId, modelConfig);
      }

      this.logger.log(`Registry initialized with ${this.models.size} models`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to initialize registry: ${error}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Register provider
   */
  async registerProvider(provider: AIProvider): Promise<void> {
    this.providers.set(provider.id, provider);

    // Sync to database
    const info = provider.getInfo();
    const createData: {
      providerId: string;
      name: string;
      capabilities: string[];
      supportedLanguages?: string[];
      isActive: boolean;
      isPrimary: boolean;
      apiEndpoint?: string;
      requestsPerMinute?: number | null;
      concurrentRequests?: number | null;
    } = {
      providerId: provider.id,
      name: info.name,
      capabilities: info.capabilities,
      isActive: info.status === 'active',
      isPrimary: true,
      apiEndpoint: '',
    };
    if (info.supportedLanguages !== undefined) {
      createData.supportedLanguages = info.supportedLanguages;
    }
    if (info.rateLimit?.requestsPerMinute !== undefined) {
      createData.requestsPerMinute = info.rateLimit.requestsPerMinute;
    }
    if (info.rateLimit?.concurrentRequests !== undefined) {
      createData.concurrentRequests = info.rateLimit.concurrentRequests;
    }
    await this.prisma.aiProvider.upsert({
      where: { providerId: provider.id },
      create: createData,
      update: {
        name: info.name,
        capabilities: info.capabilities,
        supportedLanguages: info.supportedLanguages,
        isActive: info.status === 'active',
      },
    });

    this.logger.log(`Provider registered: ${provider.id}`);
  }

  /**
   * Register model
   */
  async registerModel(config: Partial<ModelConfig>): Promise<ModelConfig> {
    if (!config.modelId || !config.providerId || !config.capability) {
      throw new Error('modelId, providerId, and capability are required');
    }

    const fullConfig: ModelConfig = {
      id: config.id || `${config.providerId}-${config.modelId}`,
      modelId: config.modelId,
      providerId: config.providerId,
      capability: config.capability,
      name: config.name || config.modelId,
      isActive: config.isActive ?? true,
      isExperimental: config.isExperimental ?? false,
      preferred: config.preferred ?? false,
    };
    if (config.version !== undefined) {
      fullConfig.version = config.version;
    }
    if (config.costPer1kInputTokens !== undefined) {
      fullConfig.costPer1kInputTokens = config.costPer1kInputTokens;
    }
    if (config.costPer1kOutputTokens !== undefined) {
      fullConfig.costPer1kOutputTokens = config.costPer1kOutputTokens;
    }
    if (config.costPerRequest !== undefined) {
      fullConfig.costPerRequest = config.costPerRequest;
    }
    if (config.maxTokens !== undefined) {
      fullConfig.maxTokens = config.maxTokens;
    }
    if (config.maxBatchSize !== undefined) {
      fullConfig.maxBatchSize = config.maxBatchSize;
    }
    if (config.defaultConfig !== undefined) {
      fullConfig.defaultConfig = config.defaultConfig;
    }

    // Save to database
    const createData: {
      modelId: string;
      providerId: string;
      name: string;
      capability: string;
      isActive: boolean;
      isExperimental: boolean;
      preferred: boolean;
      costPer1kInputTokens?: number | null;
      costPer1kOutputTokens?: number | null;
      costPerRequest?: number | null;
      maxTokens?: number | null;
      maxBatchSize?: number | null;
      defaultConfig?: string | null;
    } = {
      modelId: config.modelId,
      providerId: config.providerId,
      name: config.name || config.modelId,
      capability: config.capability,
      isActive: true,
      isExperimental: config.isExperimental ?? false,
      preferred: config.preferred ?? false,
    };
    if (config.costPer1kInputTokens !== undefined) {
      createData.costPer1kInputTokens = config.costPer1kInputTokens;
    }
    if (config.costPer1kOutputTokens !== undefined) {
      createData.costPer1kOutputTokens = config.costPer1kOutputTokens;
    }
    if (config.costPerRequest !== undefined) {
      createData.costPerRequest = config.costPerRequest;
    }
    if (config.maxTokens !== undefined) {
      createData.maxTokens = config.maxTokens;
    }
    if (config.maxBatchSize !== undefined) {
      createData.maxBatchSize = config.maxBatchSize;
    }
    if (config.defaultConfig !== undefined) {
      createData.defaultConfig = JSON.stringify(config.defaultConfig);
    } else {
      createData.defaultConfig = null;
    }
    const updateData: {
      name?: string;
      isActive?: boolean;
      preferred?: boolean;
    } = {};
    if (config.name !== undefined) {
      updateData.name = config.name || config.modelId;
    }
    if (config.isActive !== undefined) {
      updateData.isActive = config.isActive;
    }
    if (config.preferred !== undefined) {
      updateData.preferred = config.preferred;
    }
    await this.prisma.aiModel.upsert({
      where: { modelId: config.modelId },
      create: createData,
      update: updateData,
    });

    this.models.set(config.modelId, fullConfig);
    this.logger.log(`Model registered: ${config.modelId}`);

    return fullConfig;
  }

  /**
   * Get provider by ID
   */
  getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all providers
   */
  getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get providers by capability
   */
  getProvidersByCapability(capability: AICapability): AIProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.capabilities.includes(capability));
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): ModelConfig | undefined {
    return this.models.get(modelId);
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: AICapability): ModelConfig[] {
    return Array.from(this.models.values())
      .filter((m) => m.capability === capability && m.isActive)
      .sort((a, b) => {
        // Preferred models first
        if (a.preferred !== b.preferred) {
          return a.preferred ? -1 : 1;
        }
        // Then by quality score
        const scoreA = a.qualityScore || 0;
        const scoreB = b.qualityScore || 0;
        return scoreB - scoreA;
      });
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(providerId: string): ModelConfig[] {
    return Array.from(this.models.values())
      .filter((m) => m.providerId === providerId && m.isActive)
      .sort((a, b) => (a.preferred ? -1 : b.preferred ? 1 : 0));
  }

  /**
   * Update model config
   */
  async updateModel(modelId: string, updates: Partial<ModelConfig>): Promise<ModelConfig> {
    const existing = this.models.get(modelId);
    if (!existing) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const updated = { ...existing, ...updates };

    const updateData: {
      name?: string;
      isActive?: boolean;
      preferred?: boolean;
      costPer1kInputTokens?: number | null;
      costPer1kOutputTokens?: number | null;
      qualityScore?: number | null;
      avgResponseTimeMs?: number | null;
      successRate?: number | null;
    } = {};
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }
    if (updates.preferred !== undefined) {
      updateData.preferred = updates.preferred;
    }
    if (updates.costPer1kInputTokens !== undefined) {
      updateData.costPer1kInputTokens = updates.costPer1kInputTokens;
    }
    if (updates.costPer1kOutputTokens !== undefined) {
      updateData.costPer1kOutputTokens = updates.costPer1kOutputTokens;
    }
    if (updates.qualityScore !== undefined) {
      updateData.qualityScore = updates.qualityScore;
    }
    if (updates.avgResponseTimeMs !== undefined) {
      updateData.avgResponseTimeMs = updates.avgResponseTimeMs;
    }
    if (updates.successRate !== undefined) {
      updateData.successRate = updates.successRate;
    }
    await this.prisma.aiModel.update({
      where: { modelId },
      data: updateData,
    });

    this.models.set(modelId, updated);
    this.logger.log(`Model updated: ${modelId}`);

    return updated;
  }

  /**
   * Set preferred model for capability
   */
  async setPreferredModel(capability: AICapability, modelId: string): Promise<void> {
    const models = Array.from(this.models.values()).filter((m) => m.capability === capability);

    // Unset others
    for (const model of models) {
      if (model.modelId !== modelId && model.preferred) {
        await this.updateModel(model.modelId, { preferred: false });
      }
    }

    // Set this one
    const model = this.models.get(modelId);
    if (model) {
      await this.updateModel(modelId, { preferred: true });
    }
  }

  /**
   * Get all active models
   */
  getActiveModels(): ModelConfig[] {
    return Array.from(this.models.values()).filter((m) => m.isActive);
  }

  /**
   * Get experimental models
   */
  getExperimentalModels(): ModelConfig[] {
    return Array.from(this.models.values()).filter((m) => m.isExperimental && m.isActive);
  }

  /**
   * Get model count by capability
   */
  getModelCountByCapability(capability: AICapability): number {
    return Array.from(this.models.values()).filter((m) => m.capability === capability && m.isActive)
      .length;
  }
}
