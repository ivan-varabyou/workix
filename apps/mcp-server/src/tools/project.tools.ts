/**
 * Project Information Tools
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { APIEndpoint, MCPTool, ToolResult } from '../types.js';
import { apiClient } from '../utils/api-client.js';

/**
 * Database Schema Entry
 */
interface DatabaseSchemaEntry {
  service: string;
  schema: string;
}

export function getProjectTools(): MCPTool[] {
  return [
    {
      name: 'get_api_documentation',
      description: 'Get complete API documentation',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args: Record<string, unknown>): Promise<ToolResult> => {
        try {
          // Try to get from API first
          const response: any = await apiClient.get('/docs/json');
          return {
            success: true,
            data: response.data,
          };
        } catch (error: unknown) {
          // Fallback to local file
          try {
            const apiDocsPath = join(
              process.cwd(),
              '.specify/specs-optimized/architecture/api-gateway.md'
            );
            const content = readFileSync(apiDocsPath, 'utf-8');
            return {
              success: true,
              data: content,
            };
          } catch {
            return {
              success: false,
              error: 'API documentation not available',
            };
          }
        }
      },
    },

    {
      name: 'get_project_architecture',
      description: 'Get project architecture overview',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) => {
        try {
          const archPath = join(
            process.cwd(),
            '.specify/specs-optimized/core/architecture.md'
          );
          const content = readFileSync(archPath, 'utf-8');
          return {
            success: true,
            data: content,
          };
        } catch (error: unknown) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'get_database_schema',
      description: 'Get database schema information',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args: Record<string, unknown>): Promise<ToolResult> => {
        try {
          // Get schema from Prisma files
          const schemas: DatabaseSchemaEntry[] = [];
          const services: string[] = ['auth', 'user', 'pipeline', 'rbac'];

          for (const service of services) {
            try {
              const schemaPath = join(
                process.cwd(),
                `apps/${service}-service/prisma/schema.prisma`
              );
              const content = readFileSync(schemaPath, 'utf-8');
              schemas.push({
                service,
                schema: content,
              });
            } catch {
              // Schema file not found for this service
            }
          }

          return {
            success: true,
            data: schemas,
          };
        } catch (error: unknown) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'list_available_endpoints',
      description: 'List all available API endpoints',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args: Record<string, unknown>): Promise<ToolResult> => {
        try {
          // Try to get from API first
          const response: any = await apiClient.get('/docs/json');
          interface SwaggerPaths {
            paths?: Record<string, Record<string, { summary?: string }>>;
          }
          const isSwaggerPaths = (data: unknown): data is SwaggerPaths => {
            return typeof data === 'object' && data !== null;
          };
          const swaggerData = isSwaggerPaths(response.data) ? response.data : null;
          const endpoints: any = swaggerData?.paths || {};

          const endpointList: APIEndpoint[] = [];
          Object.keys(endpoints).forEach((path) => {
            const pathMethods: any = endpoints[path];
            if (pathMethods) {
              Object.keys(pathMethods).forEach((method) => {
                const methodInfo: any = pathMethods[method];
                endpointList.push({
                  method: method.toUpperCase(),
                  path,
                  description: methodInfo?.summary || '',
                });
              });
            }
          });

          return {
            success: true,
            data: endpointList,
          };
        } catch (error: unknown) {
          // Fallback to local file
          try {
            const endpointsPath = join(
              process.cwd(),
              '.specify/specs-optimized/architecture/api-gateway.md'
            );
            const content = readFileSync(endpointsPath, 'utf-8');
            return {
              success: true,
              data: content,
            };
          } catch {
            return {
              success: false,
              error: 'Endpoints not available',
            };
          }
        }
      },
    },
  ];
}
