/**
 * Docker Management Tools
 *
 * Provides Docker and container management capabilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';

import { MCPTool } from '../types.js';

const execAsync = promisify(exec);

export function getDockerTools(): MCPTool[] {
  return [
    {
      name: 'docker_status',
      description: 'Check Docker containers status',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Specific service to check (optional)',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const service = args.service as string;

        try {
          let command = 'docker-compose ps --format json';
          if (service) {
            command = `docker-compose ps ${service} --format json`;
          }

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            service: service || 'all',
            containers: JSON.parse(stdout || '[]'),
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            service: service || 'all',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'docker_start_services',
      description: 'Start Docker services',
      inputSchema: {
        type: 'object',
        properties: {
          services: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Specific services to start (optional, starts all if empty)',
          },
          detached: {
            type: 'boolean',
            description: 'Run in detached mode',
            default: true,
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const services = (args.services as string[]) || [];
        const detached = (args.detached as boolean) !== false;

        try {
          const serviceList = services.length > 0 ? services.join(' ') : '';
          const command = `docker-compose up ${detached ? '-d' : ''} ${serviceList}`.trim();

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            services: services.length > 0 ? services : ['all'],
            detached,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            services: services.length > 0 ? services : ['all'],
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'docker_stop_services',
      description: 'Stop Docker services',
      inputSchema: {
        type: 'object',
        properties: {
          services: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Specific services to stop (optional, stops all if empty)',
          },
          remove: {
            type: 'boolean',
            description: 'Remove containers after stopping',
            default: false,
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const services = (args.services as string[]) || [];
        const remove = (args.remove as boolean) || false;

        try {
          const serviceList = services.length > 0 ? services.join(' ') : '';
          const command = `docker-compose ${remove ? 'down' : 'stop'} ${serviceList}`.trim();

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            services: services.length > 0 ? services : ['all'],
            remove,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            services: services.length > 0 ? services : ['all'],
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'docker_logs',
      description: 'Get Docker service logs',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Service name to get logs for',
          },
          tail: {
            type: 'number',
            description: 'Number of lines to show from end',
            default: 100,
          },
          follow: {
            type: 'boolean',
            description: 'Follow log output',
            default: false,
          },
        },
        required: ['service'],
      },
      handler: async (args: Record<string, unknown>) => {
        const service = args.service as string;
        const tail = (args.tail as number) || 100;
        const follow = (args.follow as boolean) || false;

        try {
          if (follow) {
            // Start following logs in background
            exec(`docker-compose logs -f --tail=${tail} ${service}`, (error) => {
              if (error) {
                console.error(`Docker logs follow error: ${error}`);
              }
            });

            return {
              success: true,
              service,
              follow: true,
              message: `Following logs for ${service} service`,
            };
          } else {
            const { stdout, stderr } = await execAsync(`docker-compose logs --tail=${tail} ${service}`);
            return {
              success: true,
              service,
              tail,
              logs: stdout,
              warnings: stderr || null,
            };
          }
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
      name: 'docker_exec',
      description: 'Execute command in Docker container',
      inputSchema: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: 'Service name to execute command in',
          },
          command: {
            type: 'string',
            description: 'Command to execute',
          },
          interactive: {
            type: 'boolean',
            description: 'Run in interactive mode',
            default: false,
          },
        },
        required: ['service', 'command'],
      },
      handler: async (args: Record<string, unknown>) => {
        const service = args.service as string;
        const command = args.command as string;
        const interactive = (args.interactive as boolean) || false;

        try {
          const dockerCommand = `docker-compose exec ${interactive ? '-it' : ''} ${service} ${command}`;
          const { stdout, stderr } = await execAsync(dockerCommand);

          return {
            success: true,
            service,
            command,
            interactive,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            service,
            command,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}
