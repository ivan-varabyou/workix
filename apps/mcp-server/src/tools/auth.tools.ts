/**
 * Authentication Tools
 *
 * Tools for user authentication and authorization
 */

import { MCPTool } from '../types.js';
import { apiClient } from '../utils/api-client.js';

export function getAuthTools(): MCPTool[] {
  return [
    {
      name: 'authenticate_user',
      description: 'Authenticate user with email and password',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'User email address',
          },
          password: {
            type: 'string',
            description: 'User password',
          },
        },
        required: ['email', 'password'],
      },
      handler: async (args) => {
        try {
          const response = await apiClient.post('/auth/login', {
            email: args.email,
            password: args.password,
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
      name: 'create_user',
      description: 'Register a new user',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'User email address',
          },
          password: {
            type: 'string',
            description: 'User password (minimum 8 characters)',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
        },
        required: ['email', 'password', 'name'],
      },
      handler: async (args) => {
        try {
          const response = await apiClient.post('/auth/register', {
            email: args.email,
            password: args.password,
            name: args.name,
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
      name: 'verify_token',
      description: 'Verify JWT token validity',
      inputSchema: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token to verify',
          },
        },
        required: ['token'],
      },
      handler: async (args) => {
        try {
          const response = await apiClient.get('/auth/verify', {
            headers: {
              Authorization: `Bearer ${args.token}`,
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
      name: 'refresh_token',
      description: 'Get new access token using refresh token',
      inputSchema: {
        type: 'object',
        properties: {
          refreshToken: {
            type: 'string',
            description: 'Refresh token',
          },
        },
        required: ['refreshToken'],
      },
      handler: async (args) => {
        try {
          const response = await apiClient.post('/auth/refresh', {
            refreshToken: args.refreshToken,
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
  ];
}
