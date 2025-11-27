import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Data Cleanup Service
 * Cleans up old security data to prevent accumulation
 */
@Injectable()
export class DataCleanupService {
  private readonly logger: Logger = new Logger(DataCleanupService.name);

  private prisma: PrismaClient;

  // Retention periods (in days) - оптимизировано для экономии памяти
  private readonly IP_LOCATION_RETENTION_DAYS: number = 30; // Keep IP locations for 30 days (было 90)
  private readonly SECURITY_EVENTS_RETENTION_DAYS: number = 14; // Keep security events for 14 days (было 30)
  private readonly SUSPICIOUS_ACTIVITY_RETENTION_DAYS: number = 14; // Keep suspicious activity for 14 days (было 30)
  private readonly MAX_IP_LOCATIONS_PER_USER: number = 20; // Max IP locations per user (было 50)
  private readonly MAX_SECURITY_EVENTS_PER_USER: number = 50; // Max security events per user (было 100)

  constructor(@Optional() @Inject('PrismaService') prisma: PrismaClient) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported.');
    }
    this.prisma = prisma;
  }

  /**
   * Clean up all old data
   */
  async cleanupAll(): Promise<{
    ipLocations: number;
    securityEvents: number;
    suspiciousActivities: number;
    expiredCodes: number;
    expiredIpBlocks: number;
  }> {
    const results: {
      ipLocations: number;
      securityEvents: number;
      suspiciousActivities: number;
      expiredCodes: number;
      expiredIpBlocks: number;
    } = {
      ipLocations: 0,
      securityEvents: 0,
      suspiciousActivities: 0,
      expiredCodes: 0,
      expiredIpBlocks: 0,
    };

    try {
      results.ipLocations = await this.cleanupIpLocations();
      results.securityEvents = await this.cleanupSecurityEvents();
      results.suspiciousActivities = await this.cleanupSuspiciousActivities();
      results.expiredCodes = await this.cleanupExpiredSecurityCodes();
      results.expiredIpBlocks = await this.cleanupExpiredIpBlocks();

      this.logger.log(
        `Data cleanup completed: ${results.ipLocations} IP locations, ${results.securityEvents} security events, ${results.suspiciousActivities} suspicious activities, ${results.expiredCodes} expired codes, ${results.expiredIpBlocks} expired IP blocks`
      );
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Data cleanup failed: ${errorMessage}`);
    }

    return results;
  }

  /**
   * Clean up old IP locations
   */
  private async cleanupIpLocations(): Promise<number> {
    try {
      const cutoffDate: Date = new Date(Date.now() - this.IP_LOCATION_RETENTION_DAYS * 24 * 60 * 60 * 1000);

      // Delete old IP locations
      const deletedOld: { count: number } = await this.prisma.userIpLocation.deleteMany({
        where: {
          lastSeen: {
            lt: cutoffDate,
          },
        },
      });

      // For each user, keep only last N IP locations (оптимизировано - обрабатываем батчами)
      const batchSize: number = 100;
      let offset: number = 0;
      let deletedExcess: number = 0;
      let hasMore: boolean = true;

      while (hasMore) {
        const users: Array<{ userId: string }> = await this.prisma.userIpLocation.findMany({
          select: {
            userId: true,
          },
          distinct: ['userId'],
          skip: offset,
          take: batchSize,
        });

        if (users.length === 0) {
          hasMore = false;
          break;
        }

        for (const user of users) {
          // Используем только ID для экономии памяти
          const locations: Array<{ id: string }> = await this.prisma.userIpLocation.findMany({
            where: { userId: user.userId },
            select: { id: true },
            orderBy: { lastSeen: 'desc' },
          });

          if (locations.length > this.MAX_IP_LOCATIONS_PER_USER) {
            const toDelete: Array<{ id: string }> = locations.slice(this.MAX_IP_LOCATIONS_PER_USER);
            const idsToDelete: string[] = toDelete.map((loc: { id: string }): string => loc.id);

            await this.prisma.userIpLocation.deleteMany({
              where: {
                id: {
                  in: idsToDelete,
                },
              },
            });

            deletedExcess += idsToDelete.length;
          }
        }

        offset += batchSize;
        hasMore = users.length === batchSize;
      }

      return deletedOld.count + deletedExcess;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup IP locations: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Clean up old security events
   */
  private async cleanupSecurityEvents(): Promise<number> {
    try {
      const cutoffDate: Date = new Date(Date.now() - this.SECURITY_EVENTS_RETENTION_DAYS * 24 * 60 * 60 * 1000);

      // Delete old security events
      const deletedOld: { count: number } = await this.prisma.accountSecurityEvent.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      // For each user, keep only last N events (оптимизировано - обрабатываем батчами)
      const batchSize: number = 100;
      let offset: number = 0;
      let deletedExcess: number = 0;
      let hasMore: boolean = true;

      while (hasMore) {
        const users: Array<{ userId: string | null }> = await this.prisma.accountSecurityEvent.findMany({
          select: {
            userId: true,
          },
          distinct: ['userId'],
          where: {
            userId: {
              not: null,
            },
          },
          skip: offset,
          take: batchSize,
        });

        if (users.length === 0) {
          hasMore = false;
          break;
        }

        for (const user of users) {
          if (!user.userId) continue;

          // Используем только ID для экономии памяти
          const events: Array<{ id: string }> = await this.prisma.accountSecurityEvent.findMany({
            where: { userId: user.userId },
            select: { id: true },
            orderBy: { createdAt: 'desc' },
          });

          if (events.length > this.MAX_SECURITY_EVENTS_PER_USER) {
            const toDelete: Array<{ id: string }> = events.slice(this.MAX_SECURITY_EVENTS_PER_USER);
            const idsToDelete: string[] = toDelete.map((event: { id: string }): string => event.id);

            await this.prisma.accountSecurityEvent.deleteMany({
              where: {
                id: {
                  in: idsToDelete,
                },
              },
            });

            deletedExcess += idsToDelete.length;
          }
        }

        offset += batchSize;
        hasMore = users.length === batchSize;
      }

      return deletedOld.count + deletedExcess;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup security events: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Clean up old suspicious activities
   */
  private async cleanupSuspiciousActivities(): Promise<number> {
    try {
      const cutoffDate: Date = new Date(
        Date.now() - this.SUSPICIOUS_ACTIVITY_RETENTION_DAYS * 24 * 60 * 60 * 1000
      );

      const deleted: { count: number } = await this.prisma.suspiciousIpActivity.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      return deleted.count;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup suspicious activities: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Clean up expired security codes
   */
  private async cleanupExpiredSecurityCodes(): Promise<number> {
    try {
      const deleted: { count: number } = await this.prisma.securityVerificationCode.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: new Date(),
              },
            },
            {
              verifiedAt: {
                not: null,
              },
              createdAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Delete verified codes older than 7 days
              },
            },
          ],
        },
      });

      return deleted.count;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup expired security codes: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Clean up expired IP blocks
   */
  private async cleanupExpiredIpBlocks(): Promise<number> {
    try {
      const deleted: { count: number } = await this.prisma.ipBlock.deleteMany({
        where: {
          blockedUntil: {
            lt: new Date(),
          },
        },
      });

      return deleted.count;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup expired IP blocks: ${errorMessage}`);
      return 0;
    }
  }
}
