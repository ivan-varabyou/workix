/**
 * AB Test Entity
 * Represents an A/B test in the system
 */
export class ABTestEntity {
  id!: string;
  userId!: string;
  name!: string;
  description?: string | null;
  variants!: Array<{
    id: string;
    name: string;
    value: string | number | boolean | Record<string, unknown> | unknown[];
    weight?: number;
  }>;
  config?: Record<string, unknown> | null;
  status!: string;
  results?: Record<string, {
    variantId: string;
    views: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
  }> | null;
  metadata?: Record<string, unknown> | null;
  type?: string | null;
  trafficSplit?: Record<string, number> | null;
  startDate?: Date | null;
  endDate?: Date | null;
  winnerVariant?: string | null;
  confidenceLevel?: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<ABTestEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if test is running
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Check if test is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed' || (this.endDate !== null && this.endDate !== undefined && this.endDate < new Date());
  }

  /**
   * Check if test has winner
   */
  hasWinner(): boolean {
    return this.winnerVariant !== null && this.winnerVariant !== undefined;
  }
}
