import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  BillingPrismaService,
  StripeInstance,
  StripeInvoice,
  StripeSubscription,
  StripeWebhookEvent,
  SubscriptionMetadata,
  SubscriptionPlanMetadata,
} from '../interfaces/billing.interface';

/**
 * Subscription Plan
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // Monthly price in USD
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    pipelines?: number;
    executions?: number;
    users?: number;
    storage?: number; // GB
    tokens?: number; // Monthly token limit
    [key: string]: number | undefined;
  };
  stripePriceId?: string;
  stripeProductId?: string;
  metadata?: SubscriptionPlanMetadata;
}

/**
 * Subscription Status
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

/**
 * Subscription
 */
export interface Subscription {
  id: string;
  userId: string;
  organizationId?: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  metadata?: SubscriptionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscription Service
 * Subscription management + Stripe integration
 */
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private subscriptions: Map<string, Subscription> = new Map();
  private plans: Map<string, SubscriptionPlan> = new Map();
  private stripe: StripeInstance | null = null; // Stripe instance

  constructor(
    @Inject('PrismaService') private prisma: BillingPrismaService,
    private configService: ConfigService
  ) {
    this.initializeStripe();
    this.initializeDefaultPlans();
  }

  /**
   * Initialize Stripe
   */
  private initializeStripe(): void {
    const stripeKey: string | undefined = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (stripeKey) {
      try {
        // Dynamic import of Stripe

        const Stripe = require('stripe');
        this.stripe = new Stripe(stripeKey) as StripeInstance;
        this.logger.log('Stripe initialized');
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Stripe not available, running without payment processing: ${errorMessage}`
        );
      }
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set, running without payment processing');
    }
  }

  /**
   * Initialize default plans
   */
  private initializeDefaultPlans(): void {
    // Free plan
    this.registerPlan({
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'usd',
      interval: 'month',
      features: ['Basic pipelines', 'Limited executions', 'Community support'],
      limits: {
        pipelines: 5,
        executions: 100,
        users: 1,
        storage: 1,
        tokens: 10000,
      },
    });

    // Pro plan
    this.registerPlan({
      id: 'pro',
      name: 'Pro',
      price: 29,
      currency: 'usd',
      interval: 'month',
      features: [
        'Unlimited pipelines',
        'Unlimited executions',
        'Priority support',
        'Advanced analytics',
        'API access',
      ],
      limits: {
        pipelines: -1, // Unlimited
        executions: -1,
        users: 10,
        storage: 100,
        tokens: 1000000,
      },
    });

    // Enterprise plan
    this.registerPlan({
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'On-premise deployment',
      ],
      limits: {
        pipelines: -1,
        executions: -1,
        users: -1,
        storage: 1000,
        tokens: 10000000,
      },
    });

    this.logger.log(`Initialized ${this.plans.size} subscription plans`);
  }

  /**
   * Register plan
   */
  registerPlan(plan: SubscriptionPlan): void {
    this.plans.set(plan.id, plan);
    this.logger.log(`Plan registered: ${plan.id} (${plan.name})`);
  }

  /**
   * Get plan by ID
   */
  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.get(planId);
  }

  /**
   * List all plans
   */
  listPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  /**
   * Create subscription
   */
  async createSubscription(
    userId: string,
    planId: string,
    options?: {
      organizationId?: string;
      paymentMethodId?: string;
      trialDays?: number;
    }
  ): Promise<Subscription> {
    const plan = this.plans.get(planId);

    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create Stripe subscription if Stripe is available
    let stripeSubscriptionId: string | undefined;
    let stripeCustomerId: string | undefined;

    if (this.stripe && plan.price > 0) {
      try {
        // Create or get customer
        const customerMetadata: Record<string, string> = {
          userId,
        };
        if (options?.organizationId !== undefined) {
          customerMetadata.organizationId = options.organizationId;
        }
        const customer = await this.stripe.customers.create({
          email: userId, // Use userId as email placeholder
          metadata: customerMetadata,
        });

        stripeCustomerId = customer.id;

        // Note: StripeInstance interface doesn't include subscriptions.create
        // This would need to be implemented via direct Stripe API call or extended interface
        // For now, we'll skip Stripe subscription creation and use local subscription only
        // stripeSubscriptionId will remain undefined
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error('Failed to create Stripe subscription:', error);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    }

    const subscription: Subscription = {
      id: subscriptionId,
      userId,
      planId,
      status: options?.trialDays ? 'trialing' : 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };
    if (options?.organizationId !== undefined) {
      subscription.organizationId = options.organizationId;
    }
    if (stripeSubscriptionId !== undefined) {
      subscription.stripeSubscriptionId = stripeSubscriptionId;
    }
    if (stripeCustomerId !== undefined) {
      subscription.stripeCustomerId = stripeCustomerId;
    }

    this.subscriptions.set(subscriptionId, subscription);

    // Persist to database
    if (this.prisma?.subscription) {
      const createData: {
        id: string;
        userId: string;
        stripeSubscriptionId: string;
        status: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
        organizationId?: string;
        stripeCustomerId?: string;
      } = {
        id: subscriptionId,
        userId,
        stripeSubscriptionId: stripeSubscriptionId || subscriptionId, // Use subscriptionId as fallback
        status: subscription.status,
        planId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      };
      if (options?.organizationId !== undefined) {
        createData.organizationId = options.organizationId;
      }
      if (stripeCustomerId !== undefined) {
        createData.stripeCustomerId = stripeCustomerId;
      }
      await this.prisma.subscription.create({
        data: createData,
      });
    }

    this.logger.log(`Subscription created: ${subscriptionId} for user ${userId} (plan: ${planId})`);

    return subscription;
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get user subscription
   */
  getUserSubscription(userId: string): Subscription | undefined {
    return Array.from(this.subscriptions.values()).find((s) => s.userId === userId);
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      return undefined;
    }

    const updated: Subscription = {
      ...subscription,
      ...updates,
      id: subscriptionId, // Prevent ID change
      updatedAt: new Date(),
    };

    // Update Stripe subscription if applicable
    if (this.stripe && updated.stripeSubscriptionId && updates.planId) {
      try {
        await this.stripe.subscriptions.update(updated.stripeSubscriptionId, {
          items: [{ price: updates.planId }],
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error('Failed to update Stripe subscription:', error);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    }

    this.subscriptions.set(subscriptionId, updated);

    // Persist to database
    if (this.prisma?.subscription) {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: updates,
      });
    }

    this.logger.log(`Subscription updated: ${subscriptionId}`);

    return updated;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true
  ): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      return undefined;
    }

    // Cancel Stripe subscription if applicable
    if (this.stripe && subscription.stripeSubscriptionId) {
      try {
        if (cancelAtPeriodEnd) {
          await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
        } else {
          await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error('Failed to cancel Stripe subscription:', error);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    }

    const updated: Subscription = {
      ...subscription,
      status: cancelAtPeriodEnd ? subscription.status : 'canceled',
      cancelAtPeriodEnd,
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscriptionId, updated);

    // Persist to database
    if (this.prisma?.subscription) {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: updated.status,
          cancelAtPeriodEnd,
        },
      });
    }

    this.logger.log(`Subscription canceled: ${subscriptionId}`);

    return updated;
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      return undefined;
    }

    // Resume Stripe subscription if applicable
    if (this.stripe && subscription.stripeSubscriptionId) {
      try {
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error('Failed to resume Stripe subscription:', error);
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    }

    const updated: Subscription = {
      ...subscription,
      status: 'active',
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscriptionId, updated);

    // Persist to database
    if (this.prisma?.subscription) {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'active',
          cancelAtPeriodEnd: false,
        },
      });
    }

    this.logger.log(`Subscription resumed: ${subscriptionId}`);

    return updated;
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(subscriptionId);
    const newPlan = this.plans.get(newPlanId);

    if (!subscription || !newPlan) {
      return undefined;
    }

    return await this.updateSubscription(subscriptionId, {
      planId: newPlanId,
    });
  }

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(event: StripeWebhookEvent): Promise<void> {
    if (!this.stripe) {
      return;
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as StripeSubscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as StripeSubscription);
        break;
      case 'invoice.payment_succeeded':
        // Handle payment succeeded - can be implemented later
        this.logger.log('Payment succeeded for invoice:', (event.data.object as StripeInvoice).id);
        break;
      case 'invoice.payment_failed':
        // Handle payment failed - can be implemented later
        this.logger.warn('Payment failed for invoice:', (event.data.object as StripeInvoice).id);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  /**
   * Handle subscription update from Stripe
   */
  private async handleSubscriptionUpdate(stripeSubscription: StripeSubscription): Promise<void> {
    const subscription = Array.from(this.subscriptions.values()).find(
      (s) => s.stripeSubscriptionId === stripeSubscription.id
    );

    if (subscription) {
      // Map Stripe status to SubscriptionStatus
      const statusMap: Record<string, SubscriptionStatus> = {
        active: 'active',
        canceled: 'canceled',
        past_due: 'past_due',
        trialing: 'trialing',
        incomplete: 'incomplete',
      };
      const mappedStatus: SubscriptionStatus =
        statusMap[stripeSubscription.status] || 'incomplete';
      await this.updateSubscription(subscription.id, {
        status: mappedStatus,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      });
    }
  }

  /**
   * Handle subscription deleted from Stripe
   */
  private async handleSubscriptionDeleted(stripeSubscription: StripeSubscription): Promise<void> {
    const subscription = Array.from(this.subscriptions.values()).find(
      (s) => s.stripeSubscriptionId === stripeSubscription.id
    );

    if (subscription) {
      const updated: Subscription = {
        ...subscription,
        status: 'canceled',
        updatedAt: new Date(),
      };

      this.subscriptions.set(subscription.id, updated);

      // Persist to database
      if (this.prisma?.subscription) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'canceled' },
        });
      }

      this.logger.log(`Subscription deleted: ${subscription.id}`);
    }
  }
}
