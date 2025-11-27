/**
 * A/B Testing Interfaces
 * All interfaces for A/B testing module
 */

/**
 * Prisma Service interface for A/B testing
 */
export interface ABTestPrismaService {
  abTest: {
    create: (args: { data: ABTestCreateData }) => Promise<ABTestEntity>;
    findUnique: (args: {
      where: { id: string };
      include?: { events: boolean };
    }) => Promise<ABTestEntity | null>;
    update: (args: { where: { id: string }; data: ABTestUpdateData }) => Promise<ABTestEntity>;
  };
  abTestEvent: {
    create: (args: { data: ABTestEventCreateData }) => Promise<ABTestEventEntity>;
  };
}

/**
 * ABTest Entity (from database)
 */
export interface ABTestEntity {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  variants: ABTestVariant[];
  config: ABTestConfigData | null;
  status: string;
  results: ABTestResultsData | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  events?: ABTestEventEntity[];
  type?: string;
  trafficSplit?: Record<string, number>;
  startDate?: Date;
  endDate?: Date | null;
  winnerVariant?: string | null;
  confidenceLevel?: number | null;
}

/**
 * ABTestEvent Entity (from database)
 */
export interface ABTestEventEntity {
  id: string;
  testId: string;
  variant: string;
  eventType: 'view' | 'conversion';
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * ABTest Create Data
 */
export interface ABTestCreateData {
  id: string;
  name: string;
  description?: string | null;
  type?: string;
  status: string;
  variants: ABTestVariant[];
  trafficSplit?: Record<string, number>;
  startDate?: Date;
}

/**
 * ABTest Update Data
 */
export interface ABTestUpdateData {
  status?: string;
  endDate?: Date;
  winnerVariant?: string | null;
  confidenceLevel?: number | null;
}

/**
 * ABTest Event Create Data
 */
export interface ABTestEventCreateData {
  id: string;
  testId: string;
  variant: string;
  eventType: 'view' | 'conversion';
  metadata: Record<string, unknown>;
}

/**
 * ABTest Variant Value Type
 * Can be string, number, boolean, or object
 */
export type ABTestVariantValue = string | number | boolean | Record<string, unknown> | unknown[];

/**
 * ABTest Variant
 */
export interface ABTestVariant {
  id: string;
  name: string;
  value: ABTestVariantValue;
  weight?: number;
}

/**
 * ABTest Config Data
 */
export interface ABTestConfigData {
  hypothesis?: string;
  targetSampleSize?: number;
  confidenceLevel?: number;
  minEffectSize?: number;
  metric?: string;
  [key: string]: unknown;
}

/**
 * ABTest Results Data
 */
export interface ABTestResultsData {
  [variantId: string]: ABTestResult;
}

/**
 * ABTest Result
 */
export interface ABTestResult {
  variantId: string;
  views: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
}

/**
 * ABTest Full (in-memory representation)
 */
export interface ABTest {
  id: string;
  name: string;
  description?: string;
  variants: ABTestVariant[];
  hypothesis?: string;
  targetSampleSize?: number;
  confidenceLevel?: number;
  minEffectSize?: number;
  metric: string;
  status: 'running' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  results: Record<string, ABTestResult>;
}

/**
 * ABTest Config (for creating tests)
 */
export interface ABTestConfig {
  name: string;
  description?: string;
  variants: ABTestVariant[];
  hypothesis?: string;
  targetSampleSize?: number;
  confidenceLevel?: number;
  minEffectSize?: number;
  metric: string;
}

/**
 * ABTest Results Response
 */
export interface ABTestResultsResponse {
  testId: string;
  status: string;
  results: ABTestResult[];
  winner?: string;
  statisticalSignificance?: number;
  recommendation?: string;
}

/**
 * Traffic Split
 */
export type TrafficSplit = Record<string, number>;

/**
 * Test Metadata
 */
export type TestMetadata = Record<string, unknown>;

/**
 * Event Metadata
 */
export type EventMetadata = Record<string, unknown>;
