import { Injectable, Logger } from '@nestjs/common';

/**
 * Token Usage Record
 */
export interface TokenUsage {
  id: string;
  userId: string;
  organizationId?: string;
  providerId: string;
  modelId: string;
  taskType: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // USD
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Cost Calculation Rules
 */
export interface CostRule {
  providerId: string;
  modelId: string;
  inputCostPer1k: number; // Cost per 1k input tokens
  outputCostPer1k: number; // Cost per 1k output tokens
}

/**
 * Token Tracker Service
 * Token ledger + cost calculator for AI usage tracking
 */
@Injectable()
export class TokenTrackerService {
  private readonly logger = new Logger(TokenTrackerService.name);
  private usageRecords: Map<string, TokenUsage> = new Map();
  private costRules: Map<string, CostRule> = new Map();

  constructor() {
    this.initializeDefaultCostRules();
  }

  /**
   * Initialize default cost rules for common providers
   */
  private initializeDefaultCostRules(): void {
    // OpenAI pricing (approximate, update with actual rates)
    this.registerCostRule({
      providerId: 'openai',
      modelId: 'gpt-4',
      inputCostPer1k: 0.03,
      outputCostPer1k: 0.06,
    });

    this.registerCostRule({
      providerId: 'openai',
      modelId: 'gpt-4-turbo',
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
    });

    this.registerCostRule({
      providerId: 'openai',
      modelId: 'gpt-3.5-turbo',
      inputCostPer1k: 0.0015,
      outputCostPer1k: 0.002,
    });

    // Anthropic pricing
    this.registerCostRule({
      providerId: 'anthropic',
      modelId: 'claude-3-opus',
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.075,
    });

    this.registerCostRule({
      providerId: 'anthropic',
      modelId: 'claude-3-sonnet',
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
    });

    // Groq pricing (very low cost)
    this.registerCostRule({
      providerId: 'groq',
      modelId: 'llama-3-70b',
      inputCostPer1k: 0.0001,
      outputCostPer1k: 0.0001,
    });

    this.logger.log(`Initialized ${this.costRules.size} cost rules`);
  }

  /**
   * Register cost rule
   */
  registerCostRule(rule: CostRule): void {
    const key = `${rule.providerId}:${rule.modelId}`;
    this.costRules.set(key, rule);
    this.logger.log(`Cost rule registered: ${key}`);
  }

  /**
   * Calculate cost for token usage
   */
  calculateCost(
    providerId: string,
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const key = `${providerId}:${modelId}`;
    const rule = this.costRules.get(key);

    if (!rule) {
      this.logger.warn(`No cost rule found for ${key}, using default`);
      // Default: $0.01 per 1k tokens
      return ((inputTokens + outputTokens) / 1000) * 0.01;
    }

    const inputCost = (inputTokens / 1000) * rule.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * rule.outputCostPer1k;

    return inputCost + outputCost;
  }

  /**
   * Record token usage
   */
  recordUsage(usage: Omit<TokenUsage, 'id' | 'timestamp' | 'cost'>): TokenUsage {
    const id = `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const cost = this.calculateCost(
      usage.providerId,
      usage.modelId,
      usage.inputTokens,
      usage.outputTokens
    );

    const record: TokenUsage = {
      ...usage,
      id,
      cost,
      timestamp: new Date(),
    };

    this.usageRecords.set(id, record);
    this.logger.log(
      `Token usage recorded: ${id} (${usage.totalTokens} tokens, $${cost.toFixed(4)})`
    );

    return record;
  }

  /**
   * Get usage summary for user
   */
  getUserUsageSummary(
    userId: string,
    period?: { start: Date; end: Date }
  ): {
    totalTokens: number;
    totalCost: number;
    usageByProvider: Record<string, { tokens: number; cost: number }>;
    usageByModel: Record<string, { tokens: number; cost: number }>;
    recordCount: number;
  } {
    let records = Array.from(this.usageRecords.values()).filter((r) => r.userId === userId);

    if (period) {
      records = records.filter((r) => r.timestamp >= period.start && r.timestamp <= period.end);
    }

    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    const usageByProvider: Record<string, { tokens: number; cost: number }> = {};
    const usageByModel: Record<string, { tokens: number; cost: number }> = {};

    for (const record of records) {
      // By provider
      const providerId = record.providerId;
      if (providerId) {
        if (!usageByProvider[providerId]) {
          usageByProvider[providerId] = { tokens: 0, cost: 0 };
        }
        usageByProvider[providerId].tokens += record.totalTokens;
        usageByProvider[providerId].cost += record.cost;
      }

      // By model
      if (providerId && record.modelId) {
        const modelKey = `${providerId}:${record.modelId}`;
        if (!usageByModel[modelKey]) {
          usageByModel[modelKey] = { tokens: 0, cost: 0 };
        }
        usageByModel[modelKey].tokens += record.totalTokens;
        usageByModel[modelKey].cost += record.cost;
      }
    }

    return {
      totalTokens,
      totalCost,
      usageByProvider,
      usageByModel,
      recordCount: records.length,
    };
  }

  /**
   * Get usage summary for organization
   */
  getOrganizationUsageSummary(
    organizationId: string,
    period?: { start: Date; end: Date }
  ): {
    totalTokens: number;
    totalCost: number;
    usageByUser: Record<string, { tokens: number; cost: number }>;
    usageByProvider: Record<string, { tokens: number; cost: number }>;
    recordCount: number;
  } {
    let records = Array.from(this.usageRecords.values()).filter(
      (r) => r.organizationId === organizationId
    );

    if (period) {
      records = records.filter((r) => r.timestamp >= period.start && r.timestamp <= period.end);
    }

    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    const usageByUser: Record<string, { tokens: number; cost: number }> = {};
    const usageByProvider: Record<string, { tokens: number; cost: number }> = {};

    for (const record of records) {
      // By user
      const userId = record.userId;
      if (userId) {
        if (!usageByUser[userId]) {
          usageByUser[userId] = { tokens: 0, cost: 0 };
        }
        usageByUser[userId].tokens += record.totalTokens;
        usageByUser[userId].cost += record.cost;
      }

      // By provider
      const providerId = record.providerId;
      if (providerId) {
        if (!usageByProvider[providerId]) {
          usageByProvider[providerId] = { tokens: 0, cost: 0 };
        }
        usageByProvider[providerId].tokens += record.totalTokens;
        usageByProvider[providerId].cost += record.cost;
      }
    }

    return {
      totalTokens,
      totalCost,
      usageByUser,
      usageByProvider,
      recordCount: records.length,
    };
  }

  /**
   * Get cost rule
   */
  getCostRule(providerId: string, modelId: string): CostRule | undefined {
    const key = `${providerId}:${modelId}`;
    return this.costRules.get(key);
  }

  /**
   * List all cost rules
   */
  listCostRules(): CostRule[] {
    return Array.from(this.costRules.values());
  }

  /**
   * Get usage records
   */
  getUsageRecords(filters?: {
    userId?: string;
    organizationId?: string;
    providerId?: string;
    modelId?: string;
    startDate?: Date;
    endDate?: Date;
  }): TokenUsage[] {
    let records = Array.from(this.usageRecords.values());

    if (filters) {
      if (filters.userId) {
        records = records.filter((r) => r.userId === filters.userId);
      }
      if (filters.organizationId) {
        records = records.filter((r) => r.organizationId === filters.organizationId);
      }
      if (filters.providerId) {
        records = records.filter((r) => r.providerId === filters.providerId);
      }
      if (filters.modelId) {
        records = records.filter((r) => r.modelId === filters.modelId);
      }
      if (filters.startDate) {
        records = records.filter((r) => r.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        records = records.filter((r) => r.timestamp <= filters.endDate!);
      }
    }

    return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
