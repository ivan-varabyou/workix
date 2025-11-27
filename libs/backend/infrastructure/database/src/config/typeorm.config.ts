import { DataSourceOptions } from 'typeorm';

/**
 * TypeORM DataSource Configuration
 * Supports multiple environments and services
 */

const getDataSourceConfig = (serviceName = 'auth'): DataSourceOptions => {
  const dbHost: string = process.env.DB_HOST || 'localhost';
  const dbPort: number = parseInt(process.env.DB_PORT || '5432');
  const dbUsername: string = process.env.DB_USERNAME || 'postgres';
  const dbPassword: string = process.env.DB_PASSWORD || 'postgres';
  const dbName: string =
    process.env[`DB_NAME_${serviceName.toUpperCase()}`] || `workix_${serviceName}`;
  const nodeEnv: string = process.env.NODE_ENV || 'development';

  return {
    type: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbName,
    synchronize: nodeEnv === 'development', // ⚠️ Only in dev!
    logging: process.env.DB_LOGGING === 'true' || nodeEnv === 'development',
    logger: 'simple-console',

    // Connection pooling
    extra: {
      max: 20,
    },

    // Migrations & entities (will be populated by each service)
    entities: [],
    migrations: [],

    // Additional options
    ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    useUTC: true,

    // Migration options
    migrationsRun: false, // Manual migration control
    migrationsTransactionMode: 'each', // Each migration in transaction
  };
};

export default getDataSourceConfig;
