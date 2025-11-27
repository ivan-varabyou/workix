/**
 * Database Management Tools
 *
 * Provides Prisma and database management capabilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';

import { MCPTool } from '../types.js';

const execAsync = promisify(exec);

export function getDatabaseTools(): MCPTool[] {
  return [
    {
      name: 'prisma_generate',
      description: 'Generate Prisma client from schema',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Service to generate for: monolith, auth',
            enum: ['monolith', 'auth'],
            default: 'monolith',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const service = (args.service as string) || 'monolith';

        try {
          let command = '';
          switch (service) {
            case 'monolith':
              command = 'cd apps/api-monolith && npx prisma generate';
              break;
            case 'auth':
              command = 'cd apps/api-auth && npx prisma generate';
              break;
          }

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            service,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            service,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'prisma_migrate',
      description: 'Run Prisma migrations',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Service to migrate: monolith, auth',
            enum: ['monolith', 'auth'],
            default: 'monolith',
          },
          name: {
            type: 'string',
            description: 'Migration name (for new migrations)',
          },
          action: {
            type: 'string',
            description: 'Migration action: dev, deploy, reset',
            enum: ['dev', 'deploy', 'reset'],
            default: 'dev',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const service = (args.service as string) || 'monolith';
        const action = (args.action as string) || 'dev';
        const name = args.name as string;

        try {
          let command = '';
          const basePath = service === 'monolith' ? 'apps/api-monolith' : 'apps/api-auth';

          switch (action) {
            case 'dev':
              command = `cd ${basePath} && npx prisma migrate dev${name ? ` --name ${name}` : ''}`;
              break;
            case 'deploy':
              command = `cd ${basePath} && npx prisma migrate deploy`;
              break;
            case 'reset':
              command = `cd ${basePath} && npx prisma migrate reset --force`;
              break;
          }

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            service,
            action,
            name: name || null,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            service,
            action,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'database_status',
      description: 'Check database connection and status',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Service to check: monolith, auth, all',
            enum: ['monolith', 'auth', 'all'],
            default: 'all',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const service = (args.service as string) || 'all';

        try {
          const services = service === 'all' ? ['monolith', 'auth'] : [service];
          const results = [];

          for (const svc of services) {
            try {
              const basePath = svc === 'monolith' ? 'apps/api-monolith' : 'apps/api-auth';
              const { stdout } = await execAsync(`cd ${basePath} && npx prisma db pull --dry-run`);
              results.push({
                service: svc,
                status: 'connected',
                details: stdout,
              });
            } catch (error) {
              results.push({
                service: svc,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }

          return {
            success: true,
            service,
            results,
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
      name: 'database_seed',
      description: 'Seed database with initial data',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Service to seed: monolith, auth',
            enum: ['monolith', 'auth'],
            default: 'monolith',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const service = (args.service as string) || 'monolith';

        try {
          const basePath = service === 'monolith' ? 'apps/api-monolith' : 'apps/api-auth';
          const { stdout, stderr } = await execAsync(`cd ${basePath} && npx prisma db seed`);

          return {
            success: true,
            service,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            service,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}
