import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Account Security Service
 * Tracks account security status and detects distributed attacks
 */
@Injectable()
export class AccountSecurityService {
  private readonly logger: Logger = new Logger(AccountSecurityService.name);

  private prisma: PrismaClient;

  // Configuration
  private readonly BRUTE_FORCE_THRESHOLD: number = 5; // Failed attempts before lock
  private readonly DISTRIBUTED_ATTACK_THRESHOLD: number = 3; // Different IPs to same account
  private readonly DISTRIBUTED_ATTACK_WINDOW_MS: number = 60 * 60 * 1000; // 1 hour window
  private readonly ACCOUNT_LOCK_DURATION_MS: number = 15 * 60 * 1000; // 15 minutes

  constructor(@Optional() @Inject('PrismaService') prisma: PrismaClient) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported.');
    }
    this.prisma = prisma;
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const status: Awaited<ReturnType<typeof this.getOrCreateSecurityStatus>> = await this.getOrCreateSecurityStatus(userId);

      if (!status.isLocked) {
        return false;
      }

      // Check if lock has expired
      if (status.lockedUntil && status.lockedUntil < new Date()) {
        // Unlock expired account
        await this.unlockAccount(userId);
        return false;
      }

      return true;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to check account lock for ${userId}: ${errorMessage}`);
      // On error, don't lock (fail open for availability)
      return false;
    }
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLogin(userId: string, email: string, _ipAddress: string): Promise<void> {
    try {
      const status: Awaited<ReturnType<typeof this.getOrCreateSecurityStatus>> = await this.getOrCreateSecurityStatus(userId);

      // Update failed attempts
      const newFailedAttempts: number = status.failedAttempts + 1;
      const lastFailedLogin: Date = new Date();

      // Check if we need to lock account
      const shouldLock: boolean = newFailedAttempts >= this.BRUTE_FORCE_THRESHOLD;

      await this.prisma.accountSecurityStatus.update({
        where: { userId },
        data: {
          failedAttempts: newFailedAttempts,
          lastFailedLogin,
          isLocked: shouldLock,
          lockedUntil: shouldLock ? new Date(Date.now() + this.ACCOUNT_LOCK_DURATION_MS) : status.lockedUntil,
        },
      });

      if (shouldLock) {
        this.logger.warn(`Account ${userId} (${email}) locked due to ${newFailedAttempts} failed login attempts`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to record failed login for ${userId}: ${errorMessage}`);
    }
  }

  /**
   * Reset failed login attempts on successful login
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await this.prisma.accountSecurityStatus.update({
        where: { userId },
        data: {
          failedAttempts: 0,
          lastFailedLogin: null,
        },
      });
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to reset failed attempts for ${userId}: ${errorMessage}`);
    }
  }

  /**
   * Find user ID by email
   */
  async getUserIdByEmail(email: string): Promise<string | undefined> {
    try {
      const user: { id: string } | null = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { id: true },
      });
      return user?.id;
    } catch {
      return undefined;
    }
  }

  /**
   * Track suspicious IP activity for account
   * Detects distributed attacks (multiple IPs trying to access same account)
   */
  async trackSuspiciousIpActivity(
    userId: string | undefined,
    email: string,
    ipAddress: string
  ): Promise<{ isDistributedAttack: boolean; uniqueIpCount: number }> {
    // If userId not provided, try to find by email
    if (!userId) {
      userId = await this.getUserIdByEmail(email);
    }

    if (!userId) {
      // User doesn't exist, just log the activity
      try {
        await this.prisma.suspiciousIpActivity.create({
          data: {
            ipAddress,
            email,
            activityType: 'failed_login',
            createdAt: new Date(),
          },
        });
      } catch {
        // Ignore errors
      }
      return {
        isDistributedAttack: false,
        uniqueIpCount: 0,
      };
    }

    try {
      const windowStart: Date = new Date(Date.now() - this.DISTRIBUTED_ATTACK_WINDOW_MS);

      // Get unique IPs that attempted login to this account in the window
      // Используем select только нужных полей для экономии памяти
      const uniqueIps: Array<{ ipAddress: string }> = await this.prisma.suspiciousIpActivity.findMany({
        where: {
          userId,
          createdAt: {
            gte: windowStart,
          },
        },
        select: {
          ipAddress: true,
        },
        distinct: ['ipAddress'],
        take: 100, // Ограничение для экономии памяти
      });

      const uniqueIpCount: number = uniqueIps.length + (uniqueIps.some((ip: { ipAddress: string }): boolean => ip.ipAddress === ipAddress) ? 0 : 1);

      // Record this IP activity
      await this.prisma.suspiciousIpActivity.create({
        data: {
          ipAddress,
          userId,
          email,
          activityType: 'failed_login',
          createdAt: new Date(),
        },
      });

      // Update account security status
      await this.getOrCreateSecurityStatus(userId);
      await this.prisma.accountSecurityStatus.update({
        where: { userId },
        data: {
          suspiciousIpCount: uniqueIpCount,
          lastSuspiciousActivity: new Date(),
        },
      });

      const isDistributedAttack: boolean = uniqueIpCount >= this.DISTRIBUTED_ATTACK_THRESHOLD;

      if (isDistributedAttack) {
        this.logger.warn(
          `Distributed attack detected for account ${userId} (${email}): ${uniqueIpCount} unique IPs in ${this.DISTRIBUTED_ATTACK_WINDOW_MS / 1000 / 60} minutes`
        );
      }

      return {
        isDistributedAttack,
        uniqueIpCount,
      };
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to track suspicious IP activity for ${userId}: ${errorMessage}`);
      return {
        isDistributedAttack: false,
        uniqueIpCount: 0,
      };
    }
  }

  /**
   * Lock account
   */
  async lockAccount(userId: string, durationMs: number = this.ACCOUNT_LOCK_DURATION_MS): Promise<void> {
    try {
      await this.prisma.accountSecurityStatus.update({
        where: { userId },
        data: {
          isLocked: true,
          lockedUntil: new Date(Date.now() + durationMs),
        },
      });
      this.logger.warn(`Account ${userId} locked until ${new Date(Date.now() + durationMs).toISOString()}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to lock account ${userId}: ${errorMessage}`);
    }
  }

  /**
   * Unlock account
   */
  async unlockAccount(userId: string): Promise<void> {
    try {
      await this.prisma.accountSecurityStatus.update({
        where: { userId },
        data: {
          isLocked: false,
          lockedUntil: null,
          failedAttempts: 0,
        },
      });
      this.logger.log(`Account ${userId} unlocked`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to unlock account ${userId}: ${errorMessage}`);
    }
  }

  /**
   * Get or create security status for account
   */
  private async getOrCreateSecurityStatus(userId: string): Promise<{
    id: string;
    userId: string;
    email: string;
    isLocked: boolean;
    lockedUntil: Date | null;
    failedAttempts: number;
    lastFailedLogin: Date | null;
    suspiciousIpCount: number;
    lastSuspiciousActivity: Date | null;
  }> {
    let status: Awaited<ReturnType<typeof this.prisma.accountSecurityStatus.findUnique>> = await this.prisma.accountSecurityStatus.findUnique({
      where: { userId },
    });

    if (!status) {
      // Get user email
      const user: { email: string } | null = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Create new status
      status = await this.prisma.accountSecurityStatus.create({
        data: {
          userId,
          email: user.email,
          isLocked: false,
          failedAttempts: 0,
          suspiciousIpCount: 0,
        },
      });
    }

    return status;
  }

  /**
   * Get unique IPs for account in time window (оптимизировано для экономии памяти)
   */
  async getUniqueIpsForAccount(userId: string, windowMs: number = this.DISTRIBUTED_ATTACK_WINDOW_MS): Promise<string[]> {
    try {
      const windowStart: Date = new Date(Date.now() - windowMs);

      const activities: Array<{ ipAddress: string }> = await this.prisma.suspiciousIpActivity.findMany({
        where: {
          userId,
          createdAt: {
            gte: windowStart,
          },
        },
        select: {
          ipAddress: true,
        },
        distinct: ['ipAddress'],
        take: 50, // Ограничение для экономии памяти
      });

      return activities.map((activity: { ipAddress: string }): string => activity.ipAddress);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get unique IPs for account ${userId}: ${errorMessage}`);
      return [];
    }
  }
}
