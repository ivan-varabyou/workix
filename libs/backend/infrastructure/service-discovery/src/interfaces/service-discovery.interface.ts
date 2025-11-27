// Service discovery interfaces

export interface ServiceConfig {
  url: string;
  port: number;
  metadata?: Record<string, unknown>;
}

export interface Service {
  id: string;
  name: string;
  url: string;
  port: number;
  health: 'healthy' | 'unhealthy';
  registeredAt: Date;
  lastHeartbeat: Date;
  metadata: Record<string, unknown>;
}

export interface HealthCheck {
  serviceId: string;
  status: 'healthy' | 'unhealthy';
  lastCheck: Date;
  responseTime?: number;
}

export interface CacheStats {
  cachedServices: number;
  totalSize: number;
}

export interface RegisterServiceResponse {
  serviceId: string;
  message: string;
}

export interface DeregisterServiceResponse {
  message: string;
}

export interface HeartbeatResponse {
  message: string;
}

export interface HealthCheckResult {
  removed: number;
  total: number;
}
