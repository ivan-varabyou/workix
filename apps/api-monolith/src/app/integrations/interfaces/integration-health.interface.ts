/**
 * Integration Health Interfaces
 * Правильные типы для health check без использования as утверждений
 */

export interface IntegrationProviderCredentials {
  [key: string]: string | number | boolean | null | undefined | IntegrationProviderCredentials;
}

export interface IntegrationProviderConfig {
  healthStatus?: 'UNKNOWN' | 'HEALTHY' | 'DEGRADED' | 'OUTAGE';
  [key: string]: string | number | boolean | null | undefined | IntegrationProviderConfig;
}

export interface ProviderHealthCheckResult {
  providerId: string;
  name?: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  registered?: boolean;
  hasValidCredentials?: boolean;
  recentErrors?: number;
  dbStatus?: string;
  issues?: string[];
  lastChecked?: Date;
  reason?: string;
}

export interface OverallHealthResponse {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  providers: ProviderHealthCheckResult[];
}

/**
 * Type guard для проверки, что значение является объектом
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard для проверки credentials
 */
export function isIntegrationProviderCredentials(
  value: unknown
): value is IntegrationProviderCredentials {
  if (!isRecord(value)) {
    return false;
  }
  // Проверяем, что все значения являются допустимыми типами
  return Object.values(value).every(
    (v: unknown): boolean =>
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean' ||
      v === null ||
      v === undefined ||
      isRecord(v)
  );
}

/**
 * Type guard для проверки config
 */
export function isIntegrationProviderConfig(value: unknown): value is IntegrationProviderConfig {
  if (!isRecord(value)) {
    return false;
  }
  // Проверяем наличие healthStatus, если он есть
  if ('healthStatus' in value) {
    const healthStatus: unknown = value.healthStatus;
    if (
      typeof healthStatus === 'string' &&
      (healthStatus === 'UNKNOWN' ||
        healthStatus === 'HEALTHY' ||
        healthStatus === 'DEGRADED' ||
        healthStatus === 'OUTAGE')
    ) {
      return true;
    }
  }
  // Если healthStatus нет, все равно валидный config
  return true;
}

/**
 * Безопасное извлечение credentials из Prisma JSON поля
 */
export function extractCredentials(
  value: unknown
): IntegrationProviderCredentials {
  if (isIntegrationProviderCredentials(value)) {
    return value;
  }
  if (isRecord(value)) {
    // Пытаемся преобразовать в правильный тип
    const result: IntegrationProviderCredentials = {};
    for (const [key, val] of Object.entries(value)) {
      if (
        typeof val === 'string' ||
        typeof val === 'number' ||
        typeof val === 'boolean' ||
        val === null ||
        val === undefined
      ) {
        result[key] = val;
      } else if (isRecord(val)) {
        result[key] = extractCredentials(val);
      }
    }
    return result;
  }
  return {};
}

/**
 * Безопасное извлечение config из Prisma JSON поля
 */
export function extractConfig(value: unknown): IntegrationProviderConfig {
  if (isIntegrationProviderConfig(value)) {
    return value;
  }
  if (isRecord(value)) {
    const result: IntegrationProviderConfig = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === 'healthStatus' && typeof val === 'string') {
        if (val === 'UNKNOWN' || val === 'HEALTHY' || val === 'DEGRADED' || val === 'OUTAGE') {
          result.healthStatus = val;
        } else {
          result.healthStatus = 'UNKNOWN';
        }
      } else if (
        typeof val === 'string' ||
        typeof val === 'number' ||
        typeof val === 'boolean' ||
        val === null ||
        val === undefined
      ) {
        result[key] = val;
      } else if (isRecord(val)) {
        result[key] = extractConfig(val);
      }
    }
    return result;
  }
  return { healthStatus: 'UNKNOWN' };
}
