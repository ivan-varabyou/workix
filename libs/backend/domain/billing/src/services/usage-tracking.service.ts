import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  BillingPrismaService,
  UsageRecordCreateData,
  UsageRecordMetadata,
} from '../interfaces/billing.interface';

/**
 * Usage Metric Type
 */
export type UsageMetricType =
  | 'pipeline_executions'
  | 'tokens_used'
  | 'api_calls'
  | 'storage_bytes'
  | 'users'
  | 'pipelines'
  | 'custom';

/**
 * Usage Record
 */
export interface UsageRecord {
  id: string;
  userId: string;
  organizationId?: string;
  metricType: UsageMetricType;
  value: number;
  period: 'daily' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
  metadata?: UsageRecordMetadata;
  createdAt: Date;
}

/**
 * Quota Definition
 */
export interface QuotaDefinition {
  metricType: UsageMetricType;
  limit: number; // -1 for unlimited
  period: 'daily' | 'monthly';
  resetAt?: Date;
}

/**
 * Usage Tracking Service
 * Detailed usage tracking + quotas for daily/monthly limits
 */
@Injectable()
export class UsageTrackingService {
  private readonly logger = new Logger(UsageTrackingService.name);
  private usageRecords: Map<string, UsageRecord> = new Map();
  private quotas: Map<string, QuotaDefinition[]> = new Map(); // userId -> quotas

  constructor(@Inject('PrismaService') private prisma: BillingPrismaService) {}

  /**
   * Record usage
   */
  async recordUsage(
    userId: string,
    metricType: UsageMetricType,
    value: number,
    options?: {
      organizationId?: string;
      metadata?: UsageRecordMetadata;
    }
  ): Promise<UsageRecord> {
    const now = new Date();
    const period = this.getPeriod(now);

    const recordId = `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const record: UsageRecord = {
      id: recordId,
      userId,
      metricType,
      value,
      period: 'daily', // Default to daily
      periodStart: period.start,
      periodEnd: period.end,
      createdAt: now,
    };
    if (options?.organizationId !== undefined) {
      record.organizationId = options.organizationId;
    }
    if (options?.metadata !== undefined) {
      record.metadata = options.metadata;
    }

    this.usageRecords.set(recordId, record);

    // Persist to database
    if (this.prisma?.usageRecord) {
      const createData: UsageRecordCreateData = {
        userId,
        metricType,
        value,
        timestamp: now,
      };
      if (options?.metadata !== undefined && options.metadata !== null) {
        createData.metadata = options.metadata;
      }
      await this.prisma.usageRecord.create({
        data: createData,
      });
    }

    this.logger.debug(`Usage recorded: ${userId} - ${metricType} = ${value}`);

    return record;
  }

  /**
   * Get usage for period
   */
  async getUsage(
    userId: string,
    metricType: UsageMetricType,
    period: 'daily' | 'monthly' = 'daily',
    date?: Date
  ): Promise<number> {
    const targetDate = date || new Date();
    const periodRange = this.getPeriod(targetDate, period);

    const records = Array.from(this.usageRecords.values()).filter(
      (r) =>
        r.userId === userId &&
        r.metricType === metricType &&
        r.period === period &&
        r.periodStart >= periodRange.start &&
        r.periodEnd <= periodRange.end
    );

    return records.reduce((sum, r) => sum + r.value, 0);
  }

  /**
   * Check quota
   */
  async checkQuota(
    userId: string,
    metricType: UsageMetricType,
    requestedValue = 1,
    period: 'daily' | 'monthly' = 'daily'
  ): Promise<{ allowed: boolean; current: number; limit: number; remaining: number }> {
    const quotas = this.quotas.get(userId) || [];
    const quota = quotas.find((q) => q.metricType === metricType && q.period === period);

    if (!quota) {
      // No quota defined, allow
      return {
        allowed: true,
        current: 0,
        limit: -1,
        remaining: -1,
      };
    }

    const current = await this.getUsage(userId, metricType, period);

    if (quota.limit === -1) {
      // Unlimited
      return {
        allowed: true,
        current,
        limit: -1,
        remaining: -1,
      };
    }

    const remaining = quota.limit - current;
    const allowed = remaining >= requestedValue;

    return {
      allowed,
      current,
      limit: quota.limit,
      remaining: Math.max(0, remaining),
    };
  }

  /**
   * Set quota for user
   */
  setQuota(userId: string, quota: QuotaDefinition): void {
    const quotas = this.quotas.get(userId) || [];
    const existingIndex = quotas.findIndex(
      (q) => q.metricType === quota.metricType && q.period === quota.period
    );

    if (existingIndex >= 0) {
      quotas[existingIndex] = quota;
    } else {
      quotas.push(quota);
    }

    this.quotas.set(userId, quotas);
    this.logger.log(
      `Quota set for user ${userId}: ${quota.metricType} (${quota.period}) = ${quota.limit}`
    );
  }

  /**
   * Get quotas for user
   */
  getQuotas(userId: string): QuotaDefinition[] {
    return this.quotas.get(userId) || [];
  }

  /**
   * Get usage summary
   */
  async getUsageSummary(
    userId: string,
    period: 'daily' | 'monthly' = 'daily',
    date?: Date
  ): Promise<Record<UsageMetricType, number>> {
    const summary: Record<string, number> = {};

    const metricTypes: UsageMetricType[] = [
      'pipeline_executions',
      'tokens_used',
      'api_calls',
      'storage_bytes',
      'users',
      'pipelines',
    ];

    for (const metricType of metricTypes) {
      summary[metricType] = await this.getUsage(userId, metricType, period, date);
    }

    return summary as Record<UsageMetricType, number>;
  }

  /**
   * Get usage with quotas
   */
  async getUsageWithQuotas(
    userId: string,
    period: 'daily' | 'monthly' = 'daily'
  ): Promise<
    Array<{ metricType: UsageMetricType; current: number; limit: number; remaining: number }>
  > {
    const quotas = this.getQuotas(userId);
    const summary = await this.getUsageSummary(userId, period);

    return quotas.map((quota) => {
      const current = summary[quota.metricType] || 0;
      const remaining = quota.limit === -1 ? -1 : Math.max(0, quota.limit - current);

      return {
        metricType: quota.metricType,
        current,
        limit: quota.limit,
        remaining,
      };
    });
  }

  /**
   * Reset usage for period
   */
  async resetUsage(
    userId: string,
    metricType: UsageMetricType,
    period: 'daily' | 'monthly'
  ): Promise<void> {
    const records = Array.from(this.usageRecords.values()).filter(
      (r) => r.userId === userId && r.metricType === metricType && r.period === period
    );

    for (const record of records) {
      this.usageRecords.delete(record.id);
    }

    this.logger.log(`Usage reset for user ${userId}: ${metricType} (${period})`);
  }

  /**
   * Get period range
   */
  private getPeriod(date: Date, period: 'daily' | 'monthly' = 'daily'): { start: Date; end: Date } {
    const start = new Date(date);
    const end = new Date(date);

    if (period === 'daily') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      // Monthly
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }
}
