/**
 * Code Quality Tools
 *
 * Provides code quality and linting capabilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';

import { MCPTool } from '../types.js';

const execAsync = promisify(exec);

export function getQualityTools(): MCPTool[] {
  return [
    {
      name: 'run_linter',
      description: 'Run ESLint on specific files or projects',
      inputSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description: 'Target to lint: project name, file path, or "all"',
            default: 'all',
          },
          fix: {
            type: 'boolean',
            description: 'Auto-fix linting issues',
            default: false,
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const target = (args.target as string) || 'all';
        const fix = (args.fix as boolean) || false;

        try {
          let command = '';
          if (target === 'all') {
            command = `npx nx lint${fix ? ' --fix' : ''}`;
          } else if (target.includes('/') || target.includes('.')) {
            // File path
            command = `npx eslint ${target}${fix ? ' --fix' : ''}`;
          } else {
            // Project name
            command = `npx nx lint ${target}${fix ? ' --fix' : ''}`;
          }

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            target,
            fix,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            target,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'format_code',
      description: 'Format code using Prettier',
      inputSchema: {
        type: 'object',
        properties: {
          target: {
            type: 'string',
            description: 'Target to format: file path, directory, or "all"',
            default: 'all',
          },
          check: {
            type: 'boolean',
            description: 'Check formatting without making changes',
            default: false,
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const target = (args.target as string) || 'all';
        const check = (args.check as boolean) || false;

        try {
          let command = '';
          if (target === 'all') {
            command = `npx prettier ${check ? '--check' : '--write'} .`;
          } else {
            command = `npx prettier ${check ? '--check' : '--write'} ${target}`;
          }

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            target,
            check,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            target,
            check,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'check_types',
      description: 'Run TypeScript type checking',
      inputSchema: {
        type: 'object',
        properties: {
          project: {
            type: 'string',
            description: 'Specific project to check (optional)',
          },
          watch: {
            type: 'boolean',
            description: 'Run in watch mode',
            default: false,
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const project = args.project as string;
        const watch = (args.watch as boolean) || false;

        try {
          let command = '';
          if (project) {
            command = `npx nx tsc:typecheck ${project}`;
          } else {
            command = `npx tsc --noEmit${watch ? ' --watch' : ''}`;
          }

          if (watch) {
            // Start in background for watch mode
            exec(command, (error) => {
              if (error) {
                console.error(`TypeScript watch error: ${error}`);
              }
            });

            return {
              success: true,
              project: project || 'all',
              watch: true,
              message: 'TypeScript watch mode started',
            };
          } else {
            const { stdout, stderr } = await execAsync(command);
            return {
              success: true,
              project: project || 'all',
              watch: false,
              output: stdout,
              warnings: stderr || null,
            };
          }
        } catch (error) {
          return {
            success: false,
            project: project || 'all',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'security_scan',
      description: 'Run security vulnerability scan',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Scan type: audit, outdated, licenses',
            enum: ['audit', 'outdated', 'licenses'],
            default: 'audit',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const type = (args.type as string) || 'audit';

        try {
          let command = '';
          switch (type) {
            case 'audit':
              command = 'npm audit --json';
              break;
            case 'outdated':
              command = 'npm outdated --json';
              break;
            case 'licenses':
              command = 'npx license-checker --json';
              break;
          }

          const { stdout, stderr } = await execAsync(command);
          return {
            success: true,
            type,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            type,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },
  ];
}
