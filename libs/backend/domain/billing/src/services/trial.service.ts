import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  BillingPrismaService,
  TrialCreateData,
  TrialMetadata,
  TrialUpdateData,
} from '../interfaces/billing.interface';

/**
 * Trial Status
 */
export type TrialStatus = 'active' | 'expired' | 'converted' | 'canceled';

/**
 * Trial
 */
export interface Trial {
  id: string;
  userId: string;
  organizationId?: string;
  planId: string;
  status: TrialStatus;
  startDate: Date;
  endDate: Date;
  convertedAt?: Date;
  canceledAt?: Date;
  metadata?: TrialMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Trial Service
 * Trial system + upgrade flow for 14-day free trial
 */
@Injectable()
export class TrialService {
  private readonly logger = new Logger(TrialService.name);
  private trials: Map<string, Trial> = new Map();
  private readonly TRIAL_DURATION_DAYS = 14;

  constructor(@Inject('PrismaService') private prisma: BillingPrismaService) {}

  /**
   * Start trial
   */
  async startTrial(
    userId: string,
    planId: string,
    options?: {
      organizationId?: string;
      durationDays?: number;
    }
  ): Promise<Trial> {
    // Check if user already has a trial
    const existingTrial = this.getUserTrial(userId);
    if (existingTrial && existingTrial.status === 'active') {
      throw new Error('User already has an active trial');
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (options?.durationDays || this.TRIAL_DURATION_DAYS));

    const trialId = `trial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const trial: Trial = {
      id: trialId,
      userId,
      planId,
      status: 'active',
      startDate: now,
      endDate,
      createdAt: now,
      updatedAt: now,
    };
    if (options?.organizationId !== undefined) {
      trial.organizationId = options.organizationId;
    }

    this.trials.set(trialId, trial);

    // Persist to database
    if (this.prisma?.trial) {
      const createData: TrialCreateData = {
        userId,
        status: 'active',
        startDate: now,
        endDate,
      };
      await this.prisma.trial.create({
        data: createData,
      });
    }

    this.logger.log(
      `Trial started: ${trialId} for user ${userId} (plan: ${planId}, ends: ${endDate.toISOString()})`
    );

    return trial;
  }

  /**
   * Get trial by ID
   */
  getTrial(trialId: string): Trial | undefined {
    return this.trials.get(trialId);
  }

  /**
   * Get user trial
   */
  getUserTrial(userId: string): Trial | undefined {
    return Array.from(this.trials.values()).find(
      (t) => t.userId === userId && t.status === 'active'
    );
  }

  /**
   * Check if trial is active
   */
  isTrialActive(userId: string): boolean {
    const trial = this.getUserTrial(userId);

    if (!trial) {
      return false;
    }

    const now = new Date();
    const isActive = trial.status === 'active' && now >= trial.startDate && now <= trial.endDate;

    // Auto-expire if past end date
    if (trial.status === 'active' && now > trial.endDate) {
      this.expireTrial(trial.id);
      return false;
    }

    return isActive;
  }

  /**
   * Get trial days remaining
   */
  getTrialDaysRemaining(userId: string): number {
    const trial = this.getUserTrial(userId);

    if (!trial || trial.status !== 'active') {
      return 0;
    }

    const now = new Date();
    const diff = trial.endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return Math.max(0, daysRemaining);
  }

  /**
   * Convert trial to subscription
   */
  async convertTrial(trialId: string, subscriptionId: string): Promise<Trial | undefined> {
    const trial = this.trials.get(trialId);

    if (!trial) {
      return undefined;
    }

    const updated: Trial = {
      ...trial,
      status: 'converted',
      convertedAt: new Date(),
      updatedAt: new Date(),
    };

    this.trials.set(trialId, updated);

    // Persist to database
    if (this.prisma?.trial) {
      const updateData: TrialUpdateData = {
        status: 'converted',
      };
      if (updated.convertedAt !== undefined) {
        updateData.convertedAt = updated.convertedAt;
      }
      await this.prisma.trial.update({
        where: { id: trialId },
        data: updateData,
      });
    }

    this.logger.log(`Trial converted: ${trialId} -> subscription ${subscriptionId}`);

    return updated;
  }

  /**
   * Cancel trial
   */
  async cancelTrial(trialId: string): Promise<Trial | undefined> {
    const trial = this.trials.get(trialId);

    if (!trial) {
      return undefined;
    }

    const updated: Trial = {
      ...trial,
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    };

    this.trials.set(trialId, updated);

    // Persist to database
    if (this.prisma?.trial) {
      const updateData: TrialUpdateData = {
        status: 'canceled',
      };
      // Note: canceledAt is not in TrialUpdateData interface
      // This would need to be added to the interface if needed
      await this.prisma.trial.update({
        where: { id: trialId },
        data: updateData,
      });
    }

    this.logger.log(`Trial canceled: ${trialId}`);

    return updated;
  }

  /**
   * Expire trial
   */
  async expireTrial(trialId: string): Promise<Trial | undefined> {
    const trial = this.trials.get(trialId);

    if (!trial) {
      return undefined;
    }

    const updated: Trial = {
      ...trial,
      status: 'expired',
      updatedAt: new Date(),
    };

    this.trials.set(trialId, updated);

    // Persist to database
    if (this.prisma?.trial) {
      await this.prisma.trial.update({
        where: { id: trialId },
        data: {
          status: 'expired',
        },
      });
    }

    this.logger.log(`Trial expired: ${trialId}`);

    return updated;
  }

  /**
   * Check and expire old trials
   */
  async checkAndExpireTrials(): Promise<number> {
    const now = new Date();
    let expiredCount = 0;

    for (const [trialId, trial] of this.trials.entries()) {
      if (trial.status === 'active' && now > trial.endDate) {
        await this.expireTrial(trialId);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.logger.log(`Expired ${expiredCount} trials`);
    }

    return expiredCount;
  }

  /**
   * Get trial statistics
   */
  getTrialStatistics(): {
    total: number;
    active: number;
    expired: number;
    converted: number;
    canceled: number;
  } {
    const trials = Array.from(this.trials.values());

    return {
      total: trials.length,
      active: trials.filter((t) => t.status === 'active').length,
      expired: trials.filter((t) => t.status === 'expired').length,
      converted: trials.filter((t) => t.status === 'converted').length,
      canceled: trials.filter((t) => t.status === 'canceled').length,
    };
  }
}
