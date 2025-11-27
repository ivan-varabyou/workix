// Using plain validation instead of Joi to avoid dependency
// Can be replaced with Joi if needed: npm install joi @types/joi

/**
 * Auth Configuration Validation
 * Validates environment variables for auth module
 */

interface AuthConfig {
  JWT_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
  SERVICE_KEY?: string;
  API_GATEWAY_SERVICE_KEY?: string;
  DATABASE_URL_AUTH?: string;
  DATABASE_URL?: string;
  NODE_ENV?: string;
  CORS_ORIGIN?: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_TTL?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_AUTH_MAX?: string;
  RATE_LIMIT_AUTH_TTL?: string;
}

/**
 * Validate environment variables
 * Throws error if validation fails
 */
export function validateAuthConfig(config: AuthConfig): void {
  const errors: string[] = [];
  const isProduction: boolean = config.NODE_ENV === 'production';

  // Validate JWT_SECRET
  if (!config.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate JWT_REFRESH_SECRET (optional, but if provided must be valid)
  if (config.JWT_REFRESH_SECRET && config.JWT_REFRESH_SECRET.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters long if provided');
  }

  // Validate SERVICE_KEY
  const serviceKey: string | undefined = config.SERVICE_KEY || config.API_GATEWAY_SERVICE_KEY;
  if (!serviceKey) {
    errors.push('SERVICE_KEY or API_GATEWAY_SERVICE_KEY is required');
  } else if (serviceKey.length < 32) {
    errors.push('SERVICE_KEY or API_GATEWAY_SERVICE_KEY must be at least 32 characters long');
  }

  // Validate DATABASE_URL_AUTH
  const databaseUrl: string | undefined = config.DATABASE_URL_AUTH || config.DATABASE_URL;
  if (!databaseUrl) {
    errors.push('DATABASE_URL_AUTH or DATABASE_URL is required');
  } else if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    errors.push('DATABASE_URL_AUTH must be a valid PostgreSQL connection string');
  }

  // Validate NODE_ENV
  if (config.NODE_ENV && !['development', 'production', 'test'].includes(config.NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }

  // In production, enforce stricter rules
  if (isProduction) {
    if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET is required and must be at least 32 characters in production');
    }
    if (!serviceKey || serviceKey.length < 32) {
      errors.push('SERVICE_KEY is required and must be at least 32 characters in production');
    }
    if (!databaseUrl) {
      errors.push('DATABASE_URL_AUTH is required in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Auth configuration validation failed:\n${errors.map((e: string): string => `  - ${e}`).join('\n')}`);
  }
}
