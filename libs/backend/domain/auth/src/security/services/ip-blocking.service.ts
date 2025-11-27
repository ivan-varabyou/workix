import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * IP Blocking Service
 * Manages IP address blocking for security threats
 */
@Injectable()
export class IpBlockingService {
  private readonly logger: Logger = new Logger(IpBlockingService.name);

  private prisma: PrismaClient;

  constructor(@Optional() @Inject('PrismaService') prisma: PrismaClient) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported.');
    }
    this.prisma = prisma;
  }

  /**
   * Check if IP is blocked
   */
  async isIpBlocked(ipAddress: string): Promise<boolean> {
    try {
      const block: Awaited<ReturnType<typeof this.prisma.ipBlock.findFirst>> = await this.prisma.ipBlock.findFirst({
        where: {
          ipAddress,
          blockedUntil: {
            gt: new Date(),
          },
        },
      });

      return !!block;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to check IP block: ${errorMessage}`);
      // On error, don't block (fail open for availability)
      return false;
    }
  }

  /**
   * Block IP address
   */
  async blockIp(
    ipAddress: string,
    reason: string,
    durationMs: number = 3600000
  ): Promise<void> {
    try {
      const blockedUntil: Date = new Date(Date.now() + durationMs);

      // Check if IP is already blocked
      const existingBlock: Awaited<ReturnType<typeof this.prisma.ipBlock.findFirst>> = await this.prisma.ipBlock.findFirst({
        where: { ipAddress },
      });

      if (existingBlock) {
        // Update existing block if new block duration is longer
        if (blockedUntil > existingBlock.blockedUntil) {
          await this.prisma.ipBlock.update({
            where: { id: existingBlock.id },
            data: {
              reason,
              blockedUntil,
            },
          });
          this.logger.warn(`IP ${ipAddress} block extended until ${blockedUntil.toISOString()}`);
        }
      } else {
        // Create new block
        await this.prisma.ipBlock.create({
          data: {
            ipAddress,
            reason,
            blockedUntil,
          },
        });
        this.logger.warn(`IP ${ipAddress} blocked until ${blockedUntil.toISOString()} - Reason: ${reason}`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to block IP ${ipAddress}: ${errorMessage}`);
      // Don't throw - logging is sufficient
    }
  }

  /**
   * Unblock IP address
   */
  async unblockIp(ipAddress: string): Promise<void> {
    try {
      await this.prisma.ipBlock.deleteMany({
        where: { ipAddress },
      });
      this.logger.log(`IP ${ipAddress} unblocked`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to unblock IP ${ipAddress}: ${errorMessage}`);
    }
  }

  /**
   * Get block duration for reason type
   */
  getBlockDuration(reason: string): number {
    // Duration in milliseconds
    const durations: {
      readonly sql_injection: number;
      readonly command_injection: number;
      readonly xss: number;
      readonly path_traversal: number;
      readonly brute_force: number;
      readonly distributed_attack: number;
      readonly default: number;
    } = {
      sql_injection: 24 * 60 * 60 * 1000, // 24 hours
      command_injection: 24 * 60 * 60 * 1000, // 24 hours
      xss: 6 * 60 * 60 * 1000, // 6 hours
      path_traversal: 12 * 60 * 60 * 1000, // 12 hours
      brute_force: 60 * 60 * 1000, // 1 hour
      distributed_attack: 24 * 60 * 60 * 1000, // 24 hours
      default: 60 * 60 * 1000, // 1 hour
    };

    const defaultDuration: number = durations.default;
    if (reason in durations) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Type guard for key access
      const durationValue: number | undefined = durations[reason as keyof typeof durations];
      if (typeof durationValue === 'number') {
        return durationValue;
      }
    }
    return defaultDuration;
  }

  /**
   * Clean up expired blocks
   */
  async cleanupExpiredBlocks(): Promise<void> {
    try {
      const result: { count: number } = await this.prisma.ipBlock.deleteMany({
        where: {
          blockedUntil: {
            lt: new Date(),
          },
        },
      });
      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired IP blocks`);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup expired blocks: ${errorMessage}`);
    }
  }
}
