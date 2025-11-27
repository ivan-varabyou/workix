import { Injectable, Logger, OnModuleDestroy,OnModuleInit } from '@nestjs/common';

import { DataCleanupService } from './data-cleanup.service';

/**
 * Data Cleanup Scheduler Service
 * Periodically cleans up old security data
 */
@Injectable()
export class DataCleanupSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(DataCleanupSchedulerService.name);
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Run cleanup every 2 hours для более частой очистки и экономии памяти
  private readonly CLEANUP_INTERVAL_MS: number = 2 * 60 * 60 * 1000;

  constructor(private readonly dataCleanup: DataCleanupService) {}

  onModuleInit(): void {
    // Schedule periodic cleanup (don't run immediately on startup to avoid blocking)
    this.cleanupInterval = setInterval((): void => {
      this.runCleanup().catch((error: unknown): void => {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.error(`Scheduled cleanup failed: ${errorMessage}`);
        // Don't rethrow - just log the error
      });
    }, this.CLEANUP_INTERVAL_MS);

    // Run cleanup after a short delay to allow app to fully initialize
    setTimeout((): void => {
      this.runCleanup().catch((error: unknown): void => {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.error(`Initial cleanup failed: ${errorMessage}`);
        // Don't rethrow - just log the error
      });
    }, 5000); // Wait 5 seconds after module init

    this.logger.log(`Data cleanup scheduler started (interval: ${this.CLEANUP_INTERVAL_MS / 1000 / 60} minutes)`);
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.log('Data cleanup scheduler stopped');
    }
  }

  /**
   * Run cleanup manually
   */
  async runCleanup(): Promise<void> {
    this.logger.log('Starting data cleanup...');
    const results: Awaited<ReturnType<typeof this.dataCleanup.cleanupAll>> = await this.dataCleanup.cleanupAll();
    this.logger.log(
      `Data cleanup completed: ${results.ipLocations} IP locations, ${results.securityEvents} security events, ${results.suspiciousActivities} suspicious activities, ${results.expiredCodes} expired codes, ${results.expiredIpBlocks} expired IP blocks`
    );
  }
}
