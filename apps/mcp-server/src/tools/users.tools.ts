/**
 * User Management Tools
 */

import { MCPTool } from '../types.js';
import { apiClient } from '../utils/api-client.js';

export function getUserTools(): MCPTool[] {
  return [
    {
      name: 'get_user',
      description: 'Get user information by ID',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID',
          },
        },
        required: ['userId'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.get(`/users/${args.userId}`);
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
      name: 'list_users',
      description: 'List all users with pagination',
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
          const response = await apiClient.get('/users', {
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
      name: 'update_user',
      description: 'Update user information',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID',
          },
          data: {
            type: 'object',
            description: 'User data to update',
          },
        },
        required: ['userId', 'data'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.put(`/users/${args.userId}`, args.data);
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
      name: 'delete_user',
      description: 'Delete user',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID to delete',
          },
        },
        required: ['userId'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.delete(`/users/${args.userId}`);
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
      name: 'get_user_role',
      description: 'Get user role and permissions',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID',
          },
        },
        required: ['userId'],
      },
      handler: async (args) => {
        try {
          const response: any = await apiClient.get(`/rbac/users/${args.userId}/roles`);
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
