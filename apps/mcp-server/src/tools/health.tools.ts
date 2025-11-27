/**
 * Health Check Tools
 */

import axios from 'axios';

import { MCPTool } from '../types.js';
import { apiClient } from '../utils/api-client.js';

export function getHealthTools(): MCPTool[] {
  return [
    {
      name: 'check_api_health',
      description: 'Check API health status',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) => {
        try {
          const response: any = await apiClient.get('/health');
          return {
            success: true,
            data: response.data,
          };
        } catch (error) {
          return {
            success: false,
            status: 'unhealthy',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'get_system_status',
      description: 'Get overall system status',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) => {
        try {
          const response: any = await apiClient.get('/status');
          return {
            success: true,
            data: response.data,
          };
        } catch (error) {
          return {
            success: false,
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'get_api_version',
      description: 'Get API version',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) => {
        try {
          const response: any = await apiClient.get('/status');
          return {
            success: true,
            version: response.data?.version || '1.0.0',
            data: response.data,
          };
        } catch (error) {
          // Fallback to package.json if API is not available
          try {
            const { readFileSync } = await import('fs');
            const { join } = await import('path');
            const packageJsonPath = join(process.cwd(), 'package.json');
            const packageJson: any = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            return {
              success: true,
              version: packageJson.version || '1.0.0',
            };
          } catch {
            return {
              success: true,
              version: '1.0.0',
            };
          }
        }
      },
    },

    {
      name: 'check_auth_swagger',
      description: 'Check Swagger documentation for API Auth service',
      inputSchema: {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            description: 'API Auth port (default: 7200)',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const port = (args.port as number) || 7200;
        const baseUrl = `http://localhost:${port}`;

        const results: {
          port: number;
          baseUrl: string;
          endpoints: Record<string, unknown>;
          swaggerUI?: Record<string, unknown>;
          health?: Record<string, unknown>;
        } = {
          port,
          baseUrl,
          endpoints: {},
        };

        // Check different possible Swagger paths
        const swaggerPaths = [
          '/docs-json',
          '/docs/json',
          '/api-json',
          '/swagger.json',
          '/api-auth/v1/docs-json',
        ];

        for (const path of swaggerPaths) {
          try {
            const response = await axios.get(`${baseUrl}${path}`, {
              timeout: 5000,
              validateStatus: () => true,
            });

            if (response.status === 200 && response.data) {
              results.endpoints[path] = {
                status: 'available',
                statusCode: response.status,
                hasData: !!response.data,
                info: response.data?.info || null,
              };
            } else {
              results.endpoints[path] = {
                status: 'not_found',
                statusCode: response.status,
              };
            }
          } catch (error) {
            results.endpoints[path] = {
              status: 'error',
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }

        // Check Swagger UI
        try {
          const uiResponse = await axios.get(`${baseUrl}/docs`, {
            timeout: 5000,
            validateStatus: () => true,
          });
          results.swaggerUI = {
            status: uiResponse.status === 200 ? 'available' : 'not_found',
            statusCode: uiResponse.status,
            url: `${baseUrl}/docs`,
          };
        } catch (error) {
          results.swaggerUI = {
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          };
        }

        // Check health endpoint
        try {
          const healthResponse = await axios.get(`${baseUrl}/api-auth/v1/auth/health`, {
            timeout: 5000,
            validateStatus: () => true,
          });
          results.health = {
            status: healthResponse.status === 200 ? 'ok' : 'error',
            statusCode: healthResponse.status,
            data: healthResponse.data,
          };
        } catch (error) {
          results.health = {
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
          };
        }

        return {
          success: true,
          ...results,
        };
      },
    },
  ];
}
