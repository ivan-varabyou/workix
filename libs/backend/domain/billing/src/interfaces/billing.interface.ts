/**
 * Billing Interfaces
 * All interfaces for billing module
 */

/**
 * Trial Entity
 */
export interface TrialEntity {
  id: string;
  userId: string;
  status: 'active' | 'expired' | 'converted' | 'canceled';
  startDate: Date;
  endDate: Date;
  convertedAt?: Date | null;
  metadata?: TrialMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trial Create Data
 */
export interface TrialCreateData {
  userId: string;
  status?: 'active' | 'expired' | 'converted' | 'canceled';
  startDate: Date;
  endDate: Date;
  convertedAt?: Date | null;
  metadata?: TrialMetadata | null;
}

/**
 * Trial Update Data
 */
export interface TrialUpdateData {
  status?: 'active' | 'expired' | 'converted' | 'canceled';
  endDate?: Date;
  convertedAt?: Date | null;
  metadata?: TrialMetadata | null;
}

/**
 * Usage Record Entity
 */
export interface UsageRecordEntity {
  id: string;
  userId: string;
  metricType: string;
  value: number;
  timestamp: Date;
  metadata?: UsageRecordMetadata | null;
  createdAt: Date;
}

/**
 * Usage Record Create Data
 */
export interface UsageRecordCreateData {
  userId: string;
  metricType: string;
  value: number;
  timestamp: Date;
  metadata?: UsageRecordMetadata | null;
}

/**
 * Subscription Entity
 */
export interface SubscriptionEntity {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata?: SubscriptionMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscription Create Data
 */
export interface SubscriptionCreateData {
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  metadata?: SubscriptionMetadata | null;
}

/**
 * Subscription Update Data
 */
export interface SubscriptionUpdateData {
  status?: string;
  planId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  metadata?: SubscriptionMetadata | null;
}

/**
 * Prisma Service interface for billing
 * Note: This is a minimal interface. In production, it should match
 * the actual Prisma client methods used by this service.
 */
export interface BillingPrismaService {
  trial?: {
    create: (args: { data: TrialCreateData }) => Promise<TrialEntity>;
    update: (args: { where: { id: string }; data: TrialUpdateData }) => Promise<TrialEntity>;
  };
  usageRecord?: {
    create: (args: { data: UsageRecordCreateData }) => Promise<UsageRecordEntity>;
  };
  subscription?: {
    create: (args: { data: SubscriptionCreateData }) => Promise<SubscriptionEntity>;
    update: (args: {
      where: { id: string };
      data: SubscriptionUpdateData;
    }) => Promise<SubscriptionEntity>;
    findUnique: (args: { where: { id: string } }) => Promise<SubscriptionEntity | null>;
    findMany: (args?: { where?: { userId?: string } }) => Promise<SubscriptionEntity[]>;
  };
  [key: string]: unknown;
}

/**
 * Stripe Customer
 */
export interface StripeCustomer {
  id: string;
  email?: string | null;
  name?: string | null;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Stripe Customer Create Data
 */
export interface StripeCustomerCreateData {
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Stripe Customer Update Data
 */
export interface StripeCustomerUpdateData {
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Stripe Subscription Update Data
 */
export interface StripeSubscriptionUpdateData {
  metadata?: Record<string, string>;
  cancel_at_period_end?: boolean;
  [key: string]: unknown;
}

/**
 * Stripe Instance
 * Minimal interface for Stripe SDK
 */
export interface StripeInstance {
  subscriptions: {
    retrieve: (id: string) => Promise<StripeSubscription>;
    update: (id: string, data: StripeSubscriptionUpdateData) => Promise<StripeSubscription>;
    cancel: (id: string) => Promise<StripeSubscription>;
  };
  customers: {
    create: (data: StripeCustomerCreateData) => Promise<StripeCustomer>;
    retrieve: (id: string) => Promise<StripeCustomer>;
    update: (id: string, data: StripeCustomerUpdateData) => Promise<StripeCustomer>;
  };
  webhooks: {
    constructEvent: (
      payload: string | Buffer,
      signature: string,
      secret: string
    ) => StripeWebhookEvent;
  };
  invoices: {
    retrieve: (id: string) => Promise<StripeInvoice>;
  };
  [key: string]: unknown;
}

/**
 * Stripe Webhook Event Data Object
 */
export type StripeWebhookEventObject = StripeSubscription | StripeInvoice | Record<string, unknown>;

/**
 * Stripe Webhook Event
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeWebhookEventObject;
  };
  created: number;
  [key: string]: unknown;
}

/**
 * Stripe Subscription
 */
export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
      };
    }>;
  };
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Stripe Invoice
 */
export interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Trial Metadata
 */
export type TrialMetadata = Record<string, unknown>;

/**
 * Usage Record Metadata
 */
export type UsageRecordMetadata = Record<string, unknown>;

/**
 * Subscription Plan Metadata
 */
export type SubscriptionPlanMetadata = Record<string, unknown>;

/**
 * Subscription Metadata
 */
export type SubscriptionMetadata = Record<string, unknown>;
