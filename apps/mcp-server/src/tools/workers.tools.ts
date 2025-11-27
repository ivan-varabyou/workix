/**
 * Worker Management Tools
 *
 * Provides virtual worker and execution management
 */

import { MCPTool } from '../types.js';
import { makeApiRequest } from '../utils/api-client.js';

export function getWorkerTools(): MCPTool[] {
  return [
    {
      name: 'create_worker',
      description: 'Create a new virtual worker',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Worker name',
          },
          type: {
            type: 'string',
            description: 'Worker type (marketer, designer, copywriter, etc.)',
          },
          description: {
            type: 'string',
            description: 'Worker description',
          },
          capabilities: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Worker capabilities',
          },
          config: {
            type: 'object',
            description: 'Worker configuration',
          },
        },
        required: ['name', 'type'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest('/api/v1/workers', 'POST', {
            name: args.name,
            type: args.type,
            description: args.description,
            capabilities: args.capabilities || [],
            config: args.config || {},
          });
          return {
            success: true,
            worker: result,
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
      name: 'list_workers',
      description: 'List all virtual workers',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Filter by worker type (optional)',
          },
          status: {
            type: 'string',
            description: 'Filter by status (active, inactive, all)',
            enum: ['active', 'inactive', 'all'],
            default: 'all',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const queryParams = new URLSearchParams();
          if (args.type) queryParams.append('type', args.type as string);
          if (args.status && args.status !== 'all') queryParams.append('status', args.status as string);

          const result = await makeApiRequest(`/api/v1/workers?${queryParams.toString()}`, 'GET');
          return {
            success: true,
            workers: result,
            filters: {
              type: args.type || null,
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
      name: 'start_worker',
      description: 'Start worker execution',
      inputSchema: {
        type: 'object',
        properties: {
          workerId: {
            type: 'string',
            description: 'Worker ID to start',
          },
          input: {
            type: 'object',
            description: 'Input data for worker',
          },
          context: {
            type: 'object',
            description: 'Execution context',
          },
        },
        required: ['workerId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest(`/api/v1/workers/${args.workerId}/execute`, 'POST', {
            input: args.input || {},
            context: args.context || {},
          });
          return {
            success: true,
            workerId: args.workerId,
            execution: result,
          };
        } catch (error) {
          return {
            success: false,
            workerId: args.workerId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'worker_status',
      description: 'Get worker execution status',
      inputSchema: {
        type: 'object',
        properties: {
          workerId: {
            type: 'string',
            description: 'Worker ID to check status for',
          },
          executionId: {
            type: 'string',
            description: 'Specific execution ID (optional)',
          },
        },
        required: ['workerId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          let endpoint = `/api/v1/workers/${args.workerId}/status`;
          if (args.executionId) {
            endpoint = `/api/v1/workers/${args.workerId}/executions/${args.executionId}`;
          }

          const result = await makeApiRequest(endpoint, 'GET');
          return {
            success: true,
            workerId: args.workerId,
            executionId: args.executionId || null,
            status: result,
          };
        } catch (error) {
          return {
            success: false,
            workerId: args.workerId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'stop_worker',
      description: 'Stop worker execution',
      inputSchema: {
        type: 'object',
        properties: {
          workerId: {
            type: 'string',
            description: 'Worker ID to stop',
          },
          executionId: {
            type: 'string',
            description: 'Specific execution ID to stop (optional)',
          },
          force: {
            type: 'boolean',
            description: 'Force stop execution',
            default: false,
          },
        },
        required: ['workerId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          let endpoint = `/api/v1/workers/${args.workerId}/stop`;
          if (args.executionId) {
            endpoint = `/api/v1/workers/${args.workerId}/executions/${args.executionId}/stop`;
          }

          const result = await makeApiRequest(endpoint, 'POST', {
            force: args.force || false,
          });
          return {
            success: true,
            workerId: args.workerId,
            executionId: args.executionId || null,
            force: args.force || false,
            result,
          };
        } catch (error) {
          return {
            success: false,
            workerId: args.workerId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'worker_logs',
      description: 'Get worker execution logs',
      inputSchema: {
        type: 'object',
        properties: {
          workerId: {
            type: 'string',
            description: 'Worker ID to get logs for',
          },
          executionId: {
            type: 'string',
            description: 'Specific execution ID (optional)',
          },
          limit: {
            type: 'number',
            description: 'Number of log entries to return',
            default: 100,
          },
        },
        required: ['workerId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const queryParams = new URLSearchParams();
          if (args.limit) queryParams.append('limit', String(args.limit));

          let endpoint = `/api/v1/workers/${args.workerId}/logs?${queryParams.toString()}`;
          if (args.executionId) {
            endpoint = `/api/v1/workers/${args.workerId}/executions/${args.executionId}/logs?${queryParams.toString()}`;
          }

          const result = await makeApiRequest(endpoint, 'GET');
          return {
            success: true,
            workerId: args.workerId,
            executionId: args.executionId || null,
            logs: result,
          };
        } catch (error) {
          return {
            success: false,
            workerId: args.workerId,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}
