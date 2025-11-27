/**
 * Workix MCP Server Types
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  getContent: () => string | Promise<string>;
}

export interface ToolResult {
  success: boolean;
  data?: Record<string, unknown> | string | number | boolean | null | unknown[];
  error?: string;
  message?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  authentication?: 'required' | 'optional' | 'none';
}

export interface DatabaseSchema {
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
    }>;
  }>;
}

export interface ProjectArchitecture {
  apps: string[];
  libs: string[];
  sharedLibs: string[];
  description: string;
}
