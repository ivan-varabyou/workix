/**
 * AI Model Entity
 * Represents an AI model in the system
 */
export class AIModelEntity {
  id!: string;
  modelId!: string;
  providerId!: string;
  name!: string;
  capability!: string;
  version!: string | null;
  isActive!: boolean;
  isExperimental!: boolean;
  preferred!: boolean;
  costPer1kInputTokens!: number | null;
  costPer1kOutputTokens!: number | null;
  costPerRequest!: number | null;
  avgResponseTimeMs!: number | null;
  successRate!: number | null;
  qualityScore!: number | null;
  maxTokens!: number | null;
  maxBatchSize!: number | null;
  defaultConfig!: string | null;

  constructor(data: Partial<AIModelEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if model is active
   */
  isActiveModel(): boolean {
    return this.isActive;
  }

  /**
   * Check if model is experimental
   */
  isExperimentalModel(): boolean {
    return this.isExperimental;
  }

  /**
   * Check if model is preferred
   */
  isPreferred(): boolean {
    return this.preferred;
  }

  /**
   * Calculate cost for tokens
   */
  calculateCost(inputTokens: number, outputTokens: number): number {
    let cost = 0;
    if (this.costPer1kInputTokens) {
      cost += (inputTokens / 1000) * this.costPer1kInputTokens;
    }
    if (this.costPer1kOutputTokens) {
      cost += (outputTokens / 1000) * this.costPer1kOutputTokens;
    }
    if (this.costPerRequest) {
      cost += this.costPerRequest;
    }
    return cost;
  }
}
