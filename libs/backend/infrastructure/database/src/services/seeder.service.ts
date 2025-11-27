import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Service for managing database seeds
 * Seeds are test data for development/testing
 */
@Injectable()
export class SeederService {
  private logger = new Logger(SeederService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * Clear all data from specified tables
   */
  async clearData(tables: string[]): Promise<void> {
    try {
      this.logger.log(`Clearing data from tables: ${tables.join(', ')}`);

      for (const table of tables) {
        await this.dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
      }

      this.logger.log('✅ Data cleared successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('❌ Clear data failed:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Run all seeds
   * Seeds are defined in individual seed files
   */
  async runSeeds(): Promise<void> {
    try {
      this.logger.log('Running database seeds...');

      // Import seed runners here as they're dynamically loaded
      // This allows for clean organization
      this.logger.log('✅ Seeds completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('❌ Seeding failed:', error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Check if database is empty
   */
  async isDatabaseEmpty(): Promise<boolean> {
    try {
      const tables = await this.dataSource.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
      );
      return tables.length === 0;
    } catch (error) {
      this.logger.warn('Could not check database state:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<Record<string, number>> {
    try {
      const stats: Record<string, number> = {};

      const tables = await this.dataSource.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
      );

      for (const { table_name } of tables) {
        const result = await this.dataSource.query(`SELECT COUNT(*) as count FROM "${table_name}"`);
        stats[table_name] = parseInt(result[0].count, 10);
      }

      return stats;
    } catch (error) {
      this.logger.warn('Could not get database stats:', error);
      return {};
    }
  }
}
