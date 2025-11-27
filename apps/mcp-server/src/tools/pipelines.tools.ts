/**
 * Pipeline Management Tools
 */

import { MCPTool } from '../types.js';
import { apiClient } from '../utils/api-client.js';

export function getPipelineTools(): MCPTool[] {
  return [
    {
      name: 'create_pipeline',
      description: 'Create a new pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Pipeline name',
          },
          description: {
            type: 'string',
            description: 'Pipeline description',
          },
          steps: {
            type: 'array',
            description: 'Pipeline steps',
          },
        },
        required: ['name'],
      },
      handler: async (args) => {
        try {
          const response = await apiClient.post('/pipelines', {
            name: args.name,
            description: args.description,
            steps: args.steps || [],
          });
          return {
            success: true,
            data: response.data,
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
      name: 'get_pipeline',
      description: 'Get pipeline details',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: {
            type: 'string',
            description: 'Pipeline ID',
          },
        },
        required: ['pipelineId'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.get(`/pipelines/${args.pipelineId}`);
          return {
            success: true,
            data: response.data,
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
      name: 'list_pipelines',
      description: 'List all pipelines',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Page number',
          },
          limit: {
            type: 'number',
            description: 'Items per page',
          },
        },
      },
      handler: async (args) => {
        try {
          const response = await apiClient.get('/pipelines', {
            params: {
              page: args.page || 1,
              limit: args.limit || 10,
            },
          });
          return {
            success: true,
            data: response.data,
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
      name: 'execute_pipeline',
      description: 'Execute a pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: {
            type: 'string',
            description: 'Pipeline ID',
          },
          input: {
            type: 'object',
            description: 'Pipeline input data',
          },
        },
        required: ['pipelineId'],
      },
      handler: async (args) => {
        try {
          const response = await apiClient.post(`/pipelines/${args.pipelineId}/execute`, {
            input: args.input || {},
          });
          return {
            success: true,
            data: response.data,
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
      name: 'get_pipeline_status',
      description: 'Get pipeline execution status',
      inputSchema: {
        type: 'object',
        properties: {
          executionId: {
            type: 'string',
            description: 'Pipeline execution ID',
          },
        },
        required: ['executionId'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.get(`/pipelines/executions/${args.executionId}`);
          return {
            success: true,
            data: response.data,
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
      name: 'update_pipeline',
      description: 'Update pipeline configuration',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: {
            type: 'string',
            description: 'Pipeline ID',
          },
          data: {
            type: 'object',
            description: 'Pipeline data to update',
          },
        },
        required: ['pipelineId', 'data'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.put(`/pipelines/${args.pipelineId}`, args.data);
          return {
            success: true,
            data: response.data,
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
      name: 'delete_pipeline',
      description: 'Delete a pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: {
            type: 'string',
            description: 'Pipeline ID to delete',
          },
        },
        required: ['pipelineId'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.delete(`/pipelines/${args.pipelineId}`);
          return {
            success: true,
            data: response.data,
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}
