/**
 * Subscription Entity
 * Represents a subscription in the system
 */
export class SubscriptionEntity {
  id!: string;
  userId!: string;
  stripeSubscriptionId!: string;
  status!: string;
  planId!: string;
  currentPeriodStart!: Date;
  currentPeriodEnd!: Date;
  cancelAtPeriodEnd!: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<SubscriptionEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if subscription is active
   */
  isActive(): boolean {
    return this.status === 'active' || this.status === 'trialing';
  }

  /**
   * Check if subscription is canceled
   */
  isCanceled(): boolean {
    return this.status === 'canceled' || this.cancelAtPeriodEnd;
  }

  /**
   * Check if subscription will be canceled at period end
   */
  willCancelAtPeriodEnd(): boolean {
    return this.cancelAtPeriodEnd;
  }

  /**
   * Get days remaining in current period
   */
  getDaysRemaining(): number {
    const now = new Date();
    const diff = this.currentPeriodEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
