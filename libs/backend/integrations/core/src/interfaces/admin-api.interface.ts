// Admin API Management interfaces

export interface ProviderListItem {
  id: string;
  name: string;
  capabilities: string[];
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProviderDetails extends ProviderListItem {
  type?: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

export interface ProviderStats {
  providerId: string;
  period: '1d' | '7d' | '30d';
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  successRate: number;
}
