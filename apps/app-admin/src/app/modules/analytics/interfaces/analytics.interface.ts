// Analytics interfaces for admin app

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPipelines: number;
  activePipelines: number;
  totalExecutions: number;
  successRate: number;
  errorRate: number;
  averageLatency: number;
  apiCalls?: number;
}

export interface UsersGrowth {
  date: string;
  count: number;
  newUsers: number;
  activeUsers: number;
}

export interface AuthenticationStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  period: string;
}

export interface PipelineExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  period: string;
}

export interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  period: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    latency?: number;
  }>;
}

export interface TopUser {
  id: string;
  email: string;
  name: string;
  activityCount: number;
  lastActivity: string;
}

export interface ErrorRate {
  date: string;
  count: number;
  rate: number;
  errors: Array<{
    type: string;
    message: string;
    count: number;
  }>;
}
