/**
 * AI Execution Entity
 * Represents an AI execution history in the system
 */
export class AIExecutionEntity {
  id!: string;
  requestId!: string;
  providerId!: string;
  modelId!: string | null;
  success!: boolean;
  responseTimeMs!: number;
  cost!: number;
  userRating!: number | null;
  feedback!: string | null;
  timestamp!: Date;
  metadata!: string | null;

  constructor(data: Partial<AIExecutionEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if execution was successful
   */
  isSuccessful(): boolean {
    return this.success;
  }

  /**
   * Check if execution has user rating
   */
  hasRating(): boolean {
    return this.userRating !== null && this.userRating !== undefined;
  }

  /**
   * Get cost per request
   */
  getCost(): number {
    return this.cost;
  }

  /**
   * Get response time in seconds
   */
  getResponseTimeSeconds(): number {
    return this.responseTimeMs / 1000;
  }
}
