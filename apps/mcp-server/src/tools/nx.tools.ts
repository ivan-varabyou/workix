/**
 * NX Workspace Tools
 *
 * Provides NX workspace management capabilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';

import { MCPTool } from '../types.js';

const execAsync = promisify(exec);

export function getNxTools(): MCPTool[] {
  return [
    {
      name: 'nx_show_projects',
      description: 'List all NX projects in workspace',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => {
        try {
          const { stdout } = await execAsync('npx nx show projects');
          const projects = stdout.trim().split('\n').filter(Boolean);
          return {
            success: true,
            projects,
            count: projects.length,
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
      name: 'nx_project_info',
      description: 'Get detailed information about specific NX project',
      inputSchema: {
        type: 'object',
        properties: {
          project: {
            type: 'string',
            description: 'Project name to get info for',
          },
        },
        required: ['project'],
      },
      handler: async (args: Record<string, unknown>) => {
        const project = args.project as string;
        try {
          const { stdout } = await execAsync(`npx nx show project ${project}`);
          return {
            success: true,
            project,
            info: stdout,
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
      name: 'nx_run_command',
      description: 'Execute NX command on specific project',
      inputSchema: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'NX command to run (build, test, lint, serve)',
          },
          project: {
            type: 'string',
            description: 'Project name to run command on',
          },
          args: {
            type: 'string',
            description: 'Additional arguments for the command',
          },
        },
        required: ['command', 'project'],
      },
      handler: async (args: Record<string, unknown>) => {
        const command = args.command as string;
        const project = args.project as string;
        const additionalArgs = (args.args as string) || '';

        try {
          const { stdout, stderr } = await execAsync(
            `npx nx ${command} ${project} ${additionalArgs}`
          );
          return {
            success: true,
            command,
            project,
            output: stdout,
            warnings: stderr || null,
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
