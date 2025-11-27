// Integration interfaces for admin app

export interface IntegrationProvider {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  capabilities: string[];
  healthStatus?: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
  baseApiUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntegrationCredential {
  id: string;
  providerId: string;
  userId?: string;
  type: 'OAUTH2' | 'API_KEY' | 'BASIC';
  data: Record<string, unknown>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type IntegrationConfigValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | null
  | undefined;

export interface IntegrationConfig {
  id: string;
  providerId: string;
  key: string;
  value: IntegrationConfigValue;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntegrationHealth {
  status: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
  latency?: number;
  lastCheck?: string;
  error?: string;
}

export interface IntegrationMetrics {
  providerId?: string;
  totalRequests?: number;
  successRate?: number;
  averageLatency?: number;
  errorRate?: number;
  cost?: number;
  period?: {
    start: string;
    end: string;
  };
}

export interface IntegrationError {
  id: string;
  providerId: string;
  type: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface IntegrationAlert {
  id: string;
  providerId: string;
  type: 'ERROR_RATE' | 'LATENCY' | 'CONSECUTIVE_FAILURES';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  threshold?: number;
  currentValue?: number;
  createdAt: string;
}

export interface DashboardData {
  period: '1h' | '24h' | '7d' | '30d';
  providers: Array<{
    id: string;
    name: string;
    requests: number;
    errors: number;
    latency: number;
  }>;
  operations: Array<{
    name: string;
    count: number;
    successRate: number;
  }>;
  costs: Array<{
    providerId: string;
    amount: number;
  }>;
  errors: IntegrationError[];
}

export interface CreateProviderDto {
  name: string;
  displayName?: string;
  description?: string;
  capabilities: string[];
  baseApiUrl?: string;
}

export interface UpdateProviderDto {
  displayName?: string;
  description?: string;
  capabilities?: string[];
  baseApiUrl?: string;
}

export interface CreateCredentialDto {
  type: 'OAUTH2' | 'API_KEY' | 'BASIC';
  data: Record<string, unknown>;
  expiresAt?: string;
}

export interface UpdateCredentialDto {
  type?: 'OAUTH2' | 'API_KEY' | 'BASIC';
  data?: Record<string, unknown>;
  expiresAt?: string;
}

export interface SetConfigDto {
  key: string;
  value: IntegrationConfigValue;
}

export interface RotateCredentialsResponse {
  rotated: number;
  failed: number;
  errors?: string[];
}
