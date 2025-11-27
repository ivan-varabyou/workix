/**
 * Integration Event Entity
 * Represents an integration event in the system
 */
export class IntegrationEventEntity {
  id!: string;
  providerId!: string;
  type!: string;
  status!: 'SUCCESS' | 'FAILED';
  latencyMs?: number | null;
  cost?: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<IntegrationEventEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if event is successful
   */
  isSuccess(): boolean {
    return this.status === 'SUCCESS';
  }

  /**
   * Check if event failed
   */
  isFailed(): boolean {
    return this.status === 'FAILED';
  }
}
