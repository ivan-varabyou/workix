// Adapter configuration interfaces

import { BasePayload } from '../../../src/interfaces/integration-payload.interface';

export interface AdapterEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  bodySchema?: BasePayload;
}

export interface AdapterResponseMapping {
  dataPath?: string;
  errorPath?: string;
  transform?: (data: BasePayload) => BasePayload;
}

export interface AdapterConfig {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'api_key' | 'bearer' | 'basic' | 'oauth2' | 'none';
  authConfig?: {
    apiKeyHeader?: string;
    apiKeyQuery?: string;
    bearerToken?: string;
    basicUsername?: string;
    basicPassword?: string;
    oauth2ClientId?: string;
    oauth2ClientSecret?: string;
    oauth2TokenUrl?: string;
  };
  capabilities: string[];
  endpoints: {
    [operation: string]: AdapterEndpoint;
  };
  responseMapping?: {
    [operation: string]: AdapterResponseMapping;
  };
  rateLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  retryConfig?: {
    maxRetries?: number;
    retryDelay?: number;
    retryableStatusCodes?: number[];
  };
}
