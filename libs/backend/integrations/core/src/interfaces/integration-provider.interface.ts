import { BasePayload, RequestData, RequestParams } from './integration-payload.interface';

export enum IntegrationCapability {
  ANALYTICS = 'analytics',
  UPLOAD = 'upload',
  CONTENT = 'content',
  COMMENTS = 'comments',
  LIVE = 'live',
}

export interface IntegrationRequest {
  id?: string;
  capability: IntegrationCapability;
  operation: string; // e.g., 'fetchMetrics', 'uploadVideo', 'getComments'
  payload?: BasePayload;
  params?: RequestParams;
  data?: RequestData;
}

export type ResponseMetadata = BasePayload;

export interface IntegrationResponse<T = BasePayload> {
  id?: string;
  provider?: string;
  providerId?: string;
  operation?: string;
  data: T;
  cost?: number;
  timestamp?: Date;
  metadata?: ResponseMetadata;
  success?: boolean;
  latencyMs?: number;
}

export interface AnalyticsRequest extends IntegrationRequest {
  capability: IntegrationCapability.ANALYTICS;
  operation:
    | 'fetchMetrics'
    | 'analyzePerformance'
    | 'retentionCurve'
    | 'predictPostingTime'
    | 'compareVideos';
}

export type AnalyticsResponse = IntegrationResponse<BasePayload>;

export interface IntegrationProvider {
  id: string; // e.g. 'youtube', 'tiktok'
  name: string;
  capabilities: IntegrationCapability[];

  execute<T = BasePayload>(request: IntegrationRequest): Promise<IntegrationResponse<T>>;

  supports(operation: string, capability: IntegrationCapability): boolean;
  healthCheck?(): Promise<boolean>;
  getInfo(): {
    id: string;
    name: string;
    capabilities: IntegrationCapability[];
    status: 'active' | 'inactive' | 'beta' | 'deprecated';
  };
}
