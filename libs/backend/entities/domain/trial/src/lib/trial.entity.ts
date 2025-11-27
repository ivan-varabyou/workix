/**
 * Trial Entity
 * Represents a trial subscription in the system
 */
export class TrialEntity {
  id!: string;
  userId!: string;
  status!: 'active' | 'expired' | 'converted' | 'canceled';
  startDate!: Date;
  endDate!: Date;
  convertedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<TrialEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if trial is active
   */
  isActive(): boolean {
    return this.status === 'active' && this.endDate > new Date();
  }

  /**
   * Check if trial is expired
   */
  isExpired(): boolean {
    return this.status === 'expired' || (this.status === 'active' && this.endDate <= new Date());
  }

  /**
   * Check if trial was converted to subscription
   */
  isConverted(): boolean {
    return this.status === 'converted' && this.convertedAt !== null;
  }

  /**
   * Get days remaining in trial
   */
  getDaysRemaining(): number {
    if (this.isExpired() || this.isConverted()) {
      return 0;
    }
    const now = new Date();
    const diff = this.endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
