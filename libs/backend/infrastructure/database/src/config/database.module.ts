import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

import { MigrationService } from '../services/migration.service';
import { SeederService } from '../services/seeder.service';

/**
 * DatabaseModule - provides database connection and services
 *
 * Usage in your service:
 *
 * @Module({
 *   imports: [DatabaseModule],
 * })
 * export class YourServiceModule {}
 */

export function createDatabaseModule(options: DataSourceOptions, serviceName?: string) {
  @Module({
    imports: [
      TypeOrmModule.forRoot({
        ...options,
        name: serviceName || 'default',
      }),
    ],
    providers: [MigrationService, SeederService],
    exports: [MigrationService, SeederService, serviceName || 'default'],
  })
  class DatabaseModule {
    constructor(public dataSource: DataSource) {
      this.logConnectionInfo();
    }

    public logConnectionInfo(): void {
      const ds = this.dataSource;
      const options: DataSourceOptions = ds.options;
      const database = 'database' in options ? String(options.database) : 'N/A';
      const host = 'host' in options ? String(options.host) : 'N/A';
      const port = 'port' in options ? String(options.port) : 'N/A';
      const type = 'type' in options ? String(options.type) : 'N/A';
      console.log(`
╔════════════════════════════════════════════════════════════╗
║           Database Connection Established                  ║
╠════════════════════════════════════════════════════════════╣
║ Database: ${database}
║ Host:     ${host}
║ Port:     ${port}
║ Type:     ${type}
╚════════════════════════════════════════════════════════════╝
      `);
    }
  }

  return DatabaseModule;
}

/**
 * Standalone DatabaseModule for direct import
 */
@Module({
  providers: [MigrationService, SeederService],
  exports: [MigrationService, SeederService],
})
export class DatabaseUtilsModule {}
