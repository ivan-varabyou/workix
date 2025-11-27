/**
 * RBAC Management Tools
 *
 * Provides role-based access control management
 */

import { MCPTool } from '../types.js';
import { makeApiRequest } from '../utils/api-client.js';

export function getRbacTools(): MCPTool[] {
  return [
    {
      name: 'create_role',
      description: 'Create a new role in the system',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Role name',
          },
          description: {
            type: 'string',
            description: 'Role description',
          },
          permissions: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of permission IDs to assign to role',
          },
        },
        required: ['name'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest('/api/v1/rbac/roles', 'POST', {
            name: args.name,
            description: args.description,
            permissions: args.permissions || [],
          });
          return {
            success: true,
            role: result,
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
      name: 'assign_role',
      description: 'Assign role to user',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID to assign role to',
          },
          roleId: {
            type: 'string',
            description: 'Role ID to assign',
          },
        },
        required: ['userId', 'roleId'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest('/api/v1/rbac/assign-role', 'POST', {
            userId: args.userId,
            roleId: args.roleId,
          });
          return {
            success: true,
            assignment: result,
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
      name: 'create_permission',
      description: 'Create a new permission',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Permission name',
          },
          description: {
            type: 'string',
            description: 'Permission description',
          },
          resource: {
            type: 'string',
            description: 'Resource this permission applies to',
          },
          action: {
            type: 'string',
            description: 'Action this permission allows',
          },
        },
        required: ['name', 'resource', 'action'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest('/api/v1/rbac/permissions', 'POST', {
            name: args.name,
            description: args.description,
            resource: args.resource,
            action: args.action,
          });
          return {
            success: true,
            permission: result,
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
      name: 'list_roles',
      description: 'List all roles in the system',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination',
            default: 1,
          },
          limit: {
            type: 'number',
            description: 'Number of roles per page',
            default: 10,
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const page = (args.page as number) || 1;
          const limit = (args.limit as number) || 10;

          const result = await makeApiRequest(`/api/v1/rbac/roles?page=${page}&limit=${limit}`, 'GET');
          return {
            success: true,
            roles: result,
            pagination: { page, limit },
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
      name: 'check_permission',
      description: 'Check if user has specific permission',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID to check permission for',
          },
          resource: {
            type: 'string',
            description: 'Resource to check access to',
          },
          action: {
            type: 'string',
            description: 'Action to check permission for',
          },
        },
        required: ['userId', 'resource', 'action'],
      },
      handler: async (args: Record<string, unknown>) => {
        try {
          const result = await makeApiRequest('/api/v1/rbac/check-permission', 'POST', {
            userId: args.userId,
            resource: args.resource,
            action: args.action,
          });
          return {
            success: true,
            hasPermission: result.hasPermission,
            details: result,
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
