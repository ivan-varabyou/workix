// Prisma Service interfaces for AI Core

/**
 * AI Execution History entity from Prisma
 */
export interface AIExecutionHistory {
  id: string;
  requestId: string;
  providerId: string;
  modelId: string | null;
  success: boolean;
  responseTimeMs: number;
  cost: number;
  userRating: number | null;
  feedback: string | null;
  timestamp: Date;
  metadata: string | null;
}

/**
 * AI Model Feedback entity from Prisma
 */
export interface AIModelFeedback {
  id: string;
  modelId: string;
  providerId: string;
  rating: number;
  feedback: string | null;
  createdAt: Date;
}

/**
 * AI Provider entity from Prisma
 */
export interface AIProviderEntity {
  id: string;
  providerId: string;
  name: string;
  capabilities: string[];
  supportedLanguages: string[] | null;
  isActive: boolean;
  isPrimary: boolean;
  apiEndpoint: string | null;
  requestsPerMinute: number | null;
  concurrentRequests: number | null;
}

/**
 * AI Model entity from Prisma
 */
export interface AIModelEntity {
  id: string;
  modelId: string;
  providerId: string;
  name: string;
  capability: string;
  version: string | null;
  isActive: boolean;
  isExperimental: boolean;
  preferred: boolean;
  costPer1kInputTokens: number | null;
  costPer1kOutputTokens: number | null;
  costPerRequest: number | null;
  avgResponseTimeMs: number | null;
  successRate: number | null;
  qualityScore: number | null;
  maxTokens: number | null;
  maxBatchSize: number | null;
  defaultConfig: string | null;
}

/**
 * Prisma Service interface for AI Execution Repository
 */
export interface AIExecutionPrismaService {
  aiExecutionHistory: {
    create: (args: {
      data: {
        requestId: string;
        providerId: string;
        modelId?: string | null;
        success: boolean;
        responseTimeMs: number;
        cost: number;
        userRating?: number | null;
        feedback?: string | null;
        timestamp: Date;
        metadata?: string | null;
      };
    }) => Promise<AIExecutionHistory>;
    findMany: (args?: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, string>;
      take?: number;
      skip?: number;
    }) => Promise<AIExecutionHistory[]>;
    findUnique: (args: { where: { id: string } }) => Promise<AIExecutionHistory | null>;
    update: (args: {
      where: { id: string };
      data: {
        userRating?: number;
        feedback?: string | null;
      };
    }) => Promise<AIExecutionHistory>;
    delete: (args: { where: { id: string } }) => Promise<AIExecutionHistory>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    aggregate: (args: {
      where?: Record<string, unknown>;
      _avg?: { userRating?: boolean };
    }) => Promise<{ _avg: { userRating: number | null } }>;
    groupBy: (args: {
      by: string[];
      where?: Record<string, unknown>;
      _sum?: { cost?: boolean };
      _count?: boolean;
    }) => Promise<
      Array<{
        providerId: string;
        _sum: { cost: number | null };
        _count: number;
      }>
    >;
  };
  aiModelFeedback: {
    create: (args: {
      data: {
        modelId: string;
        providerId: string;
        rating: number;
        feedback?: string | null;
      };
    }) => Promise<AIModelFeedback>;
    findMany: (args?: { where?: Record<string, unknown> }) => Promise<AIModelFeedback[]>;
  };
  aiProvider: {
    findMany: (args?: {
      where?: Record<string, unknown>;
      select?: { providerId?: boolean };
      distinct?: string[];
    }) => Promise<AIProviderEntity[]>;
    findUnique: (args: { where: { providerId: string } }) => Promise<AIProviderEntity | null>;
  };
}

/**
 * Prisma Service interface for Model Registry
 */
export interface ModelRegistryPrismaService {
  aiProvider: {
    create: (args: {
      data: {
        providerId: string;
        name: string;
        capabilities: string[];
        supportedLanguages?: string[];
        isActive: boolean;
        isPrimary: boolean;
        apiEndpoint?: string;
        requestsPerMinute?: number | null;
        concurrentRequests?: number | null;
      };
    }) => Promise<AIProviderEntity>;
    findMany: (args?: { where?: Record<string, unknown> }) => Promise<AIProviderEntity[]>;
    findUnique: (args: { where: { providerId: string } }) => Promise<AIProviderEntity | null>;
    update: (args: {
      where: { providerId: string };
      data: {
        name?: string;
        capabilities?: string[];
        supportedLanguages?: string[];
        isActive?: boolean;
      };
    }) => Promise<AIProviderEntity>;
    delete: (args: { where: { providerId: string } }) => Promise<AIProviderEntity>;
    upsert: (args: {
      where: { providerId: string };
      create: {
        providerId: string;
        name: string;
        capabilities: string[];
        supportedLanguages?: string[];
        isActive: boolean;
        isPrimary: boolean;
        apiEndpoint?: string;
        requestsPerMinute?: number | null;
        concurrentRequests?: number | null;
      };
      update: {
        name?: string;
        capabilities?: string[];
        supportedLanguages?: string[];
        isActive?: boolean;
      };
    }) => Promise<AIProviderEntity>;
  };
  aiModel: {
    create: (args: {
      data: {
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
      };
    }) => Promise<AIModelEntity>;
    findMany: (args?: { where?: Record<string, unknown> }) => Promise<AIModelEntity[]>;
    findUnique: (args: { where: { modelId: string } }) => Promise<AIModelEntity | null>;
    update: (args: {
      where: { modelId: string };
      data: {
        name?: string;
        isActive?: boolean;
        preferred?: boolean;
        costPer1kInputTokens?: number | null;
        costPer1kOutputTokens?: number | null;
        qualityScore?: number | null;
        avgResponseTimeMs?: number | null;
        successRate?: number | null;
      };
    }) => Promise<AIModelEntity>;
    delete: (args: { where: { modelId: string } }) => Promise<AIModelEntity>;
    upsert: (args: {
      where: { modelId: string };
      create: {
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
      };
      update: {
        name?: string;
        isActive?: boolean;
        preferred?: boolean;
      };
    }) => Promise<AIModelEntity>;
  };
  aiModelConfiguration: {
    create: (args: {
      data: {
        modelId: string;
        configuration: string;
      };
    }) => Promise<{ id: string; modelId: string; configuration: string }>;
    findMany: (args?: {
      where?: Record<string, unknown>;
    }) => Promise<Array<{ id: string; modelId: string; configuration: string }>>;
    findUnique: (args: {
      where: { id: string };
    }) => Promise<{ id: string; modelId: string; configuration: string } | null>;
    update: (args: {
      where: { id: string };
      data: { configuration?: string };
    }) => Promise<{ id: string; modelId: string; configuration: string }>;
    delete: (args: {
      where: { id: string };
    }) => Promise<{ id: string; modelId: string; configuration: string }>;
    upsert: (args: {
      where: { id: string };
      create: {
        modelId: string;
        configuration: string;
      };
      update: {
        configuration?: string;
      };
    }) => Promise<{ id: string; modelId: string; configuration: string }>;
  };
}
