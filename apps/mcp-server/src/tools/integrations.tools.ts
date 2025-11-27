/**
 * Integration Management Tools
 *
 * Provides external service integration management
 */

import { MCPTool } from '../types.js';
import { makeApiRequest } from '../utils/api-client.js';

export function getIntegrationTools(): MCPTool[] {
  return [
    {
      name: 'list_integrations',
      description: 'List all available integrations',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Filter by category: cloud, code, communication, e-commerce, project-management',
            enum: ['cloud', 'code', 'communication', 'e-commerce', 'project-management'],
          },
          status: {
            type: 'string',
            description: 'Filter by status: enabled, disabled, all',
            enum: ['enabled', 'disabled', 'all'],
            default: 'all',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const queryParams = new URLSearchParams();
          if (args.category) queryParams.append('category', args.category as string);
          if (args.status && args.status !== 'all') queryParams.append('status', args.status as string);

          const result = await makeApiRequest(`/api/v1/integrations?${queryParams.toString()}`, 'GET');
          return {
            success: true,
            integrations: result,
            filters: {
              category: args.category || null,
              status: args.status || 'all',
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'test_integration',
      description: 'Test external service integration',
      inputSchema: {
        type: 'object',
        properties: {
          integrationId: {
            type: 'string',
            description: 'Integration ID to test',
          },
          testType: {
            type: 'string',
            description: 'Test type: connection, auth, full',
            enum: ['connection', 'auth', 'full'],
            default: 'connection',
          },
        },
        required: ['integrationId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest(`/api/v1/integrations/${args.integrationId}/test`, 'POST', {
            testType: args.testType || 'connection',
          });
          return {
            success: true,
            integrationId: args.integrationId,
            testType: args.testType || 'connection',
            result,
          };
        } catch (error) {
          return {
            success: false,
            integrationId: args.integrationId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'integration_health',
      description: 'Check integration health status',
      inputSchema: {
        type: 'object',
        properties: {
          integrationId: {
            type: 'string',
            description: 'Integration ID to check (optional, checks all if not provided)',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const endpoint = args.integrationId
            ? `/api/v1/integrations/${args.integrationId}/health`
            : '/api/v1/integrations/health';

          const result = await makeApiRequest(endpoint, 'GET');
          return {
            success: true,
            integrationId: args.integrationId || 'all',
            health: result,
          };
        } catch (error) {
          return {
            success: false,
            integrationId: args.integrationId || 'all',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'get_credentials',
      description: 'Get integration credentials (masked for security)',
      inputSchema: {
        type: 'object',
        properties: {
          integrationId: {
            type: 'string',
            description: 'Integration ID to get credentials for',
          },
        },
        required: ['integrationId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest(`/api/v1/integrations/${args.integrationId}/credentials`, 'GET');
          return {
            success: true,
            integrationId: args.integrationId,
            credentials: result,
          };
        } catch (error) {
          return {
            success: false,
            integrationId: args.integrationId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'update_credentials',
      description: 'Update integration credentials',
      inputSchema: {
        type: 'object',
        properties: {
          integrationId: {
            type: 'string',
            description: 'Integration ID to update credentials for',
          },
          credentials: {
            type: 'object',
            description: 'New credentials data',
          },
        },
        required: ['integrationId', 'credentials'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest(
            `/api/v1/integrations/${args.integrationId}/credentials`,
            'PUT',
            args.credentials
          );
          return {
            success: true,
            integrationId: args.integrationId,
            result,
          };
        } catch (error) {
          return {
            success: false,
            integrationId: args.integrationId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'integration_metrics',
      description: 'Get integration usage metrics',
      inputSchema: {
        type: 'object',
        properties: {
          integrationId: {
            type: 'string',
            description: 'Integration ID to get metrics for',
          },
          period: {
            type: 'string',
            description: 'Time period: hour, day, week, month',
            enum: ['hour', 'day', 'week', 'month'],
            default: 'day',
          },
        },
        required: ['integrationId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest(
            `/api/v1/integrations/${args.integrationId}/metrics?period=${args.period || 'day'}`,
            'GET'
          );
          return {
            success: true,
            integrationId: args.integrationId,
            period: args.period || 'day',
            metrics: result,
          };
        } catch (error) {
          return {
            success: false,
            integrationId: args.integrationId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}
