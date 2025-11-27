import { Injectable, Logger } from '@nestjs/common';
import { DataSource, MigrationInterface } from 'typeorm';

/**
 * Service for managing database migrations
 */
@Injectable()
export class MigrationService {
  private logger = new Logger(MigrationService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * Run pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      this.logger.log('Running pending migrations...');
      await this.dataSource.runMigrations();
      this.logger.log('✅ All migrations completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('❌ Migration failed:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Revert last migration
   */
  async revertLastMigration(): Promise<void> {
    try {
      this.logger.log('Reverting last migration...');
      await this.dataSource.undoLastMigration();
      this.logger.log('✅ Last migration reverted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('❌ Revert failed:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get list of executed migrations
   */
  async getExecutedMigrations(): Promise<MigrationInterface[]> {
    try {
      const migrations = await this.dataSource.query(
        `SELECT * FROM typeorm_metadata WHERE type = 'migration' ORDER BY "timestamp" DESC`
      );
      return migrations;
    } catch (error) {
      this.logger.warn('Could not fetch executed migrations:', error);
      return [];
    }
  }

  /**
   * Get list of pending migrations
   */
  async getPendingMigrations(): Promise<string[]> {
    try {
      const pendingMigrations = await this.dataSource.showMigrations();
      return Array.isArray(pendingMigrations) ? pendingMigrations : [];
    } catch (error) {
      this.logger.warn('Could not fetch pending migrations:', error);
      return [];
    }
  }

  /**
   * Check if migrations are needed
   */
  async hasPendingMigrations(): Promise<boolean> {
    try {
      const pending = await this.getPendingMigrations();
      return pending && pending.length > 0;
    } catch (error) {
      this.logger.warn('Error checking pending migrations:', error);
      return false;
    }
  }
}
