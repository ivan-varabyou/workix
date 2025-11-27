/**
 * Package.json Command Tools
 *
 * Provides access to npm scripts and package management
 */

import { exec } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { MCPTool } from '../types.js';

const execAsync = promisify(exec);

/**
 * Recursively find all package.json files in the project
 */
function findAllPackageJsonFiles(rootDir: string, currentDir: string = rootDir, maxDepth: number = 5, currentDepth: number = 0): string[] {
  if (currentDepth > maxDepth) {
    return [];
  }

  const packageFiles: string[] = [];

  try {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip node_modules and dist directories
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }

      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Recursively search in subdirectories
        packageFiles.push(...findAllPackageJsonFiles(rootDir, fullPath, maxDepth, currentDepth + 1));
      } else if (entry.name === 'package.json') {
        packageFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return packageFiles;
}

/**
 * Read package.json and extract scripts
 */
function readPackageScripts(packagePath: string): { name: string; scripts: Record<string, string> } | null {
  try {
    if (!existsSync(packagePath)) {
      return null;
    }

    const content = readFileSync(packagePath, 'utf-8');
    const packageJson = JSON.parse(content);

    // Get relative path from project root
    const projectRoot = join(process.cwd());
    const relativePath = packagePath.replace(projectRoot, '').replace(/^\//, '');

    return {
      name: packageJson.name || relativePath,
      scripts: packageJson.scripts || {},
    };
  } catch (error) {
    return null;
  }
}

export function getPackageTools(): MCPTool[] {
  return [
    {
      name: 'run_npm_script',
      description: 'Execute any npm script from package.json',
      inputSchema: {
        type: 'object',
        properties: {
          script: {
            type: 'string',
            description: 'NPM script name to execute',
          },
          args: {
            type: 'string',
            description: 'Additional arguments for the script',
          },
        },
        required: ['script'],
      },
      handler: async (args: Record<string, unknown>) => {
        const script = args.script as string;
        const additionalArgs = (args.args as string) || '';

        try {
          const { stdout, stderr } = await execAsync(`npm run ${script} ${additionalArgs}`);
          return {
            success: true,
            script,
            output: stdout,
            warnings: stderr || null,
          };
        } catch (error) {
          return {
            success: false,
            script,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    },

    {
      name: 'list_npm_scripts',
      description: 'List all available npm scripts from root package.json',
      inputSchema: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            description: 'Filter scripts by pattern (optional)',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const filter = args.filter as string;

        try {
          const packagePath = join(process.cwd(), 'package.json');
          const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
          const scripts = packageJson.scripts || {};

          let filteredScripts = scripts;
          if (filter) {
            filteredScripts = Object.fromEntries(
              Object.entries(scripts).filter(([name]) =>
                name.includes(filter)
              )
            );
          }

          return {
            success: true,
            filter: filter || null,
            scripts: filteredScripts,
            total: Object.keys(scripts).length,
            filtered: Object.keys(filteredScripts).length,
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
      name: 'list_all_package_scripts',
      description: 'List all npm scripts from all package.json files in the project (root, apps, libs)',
      inputSchema: {
        type: 'object',
        properties: {
          filter: {
            type: 'string',
            description: 'Filter scripts by pattern (optional)',
          },
          package: {
            type: 'string',
            description: 'Filter by package name or path (optional)',
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const filter = args.filter as string;
        const packageFilter = args.package as string;

        try {
          const projectRoot = process.cwd();
          const allPackageFiles = findAllPackageJsonFiles(projectRoot);

          const allScripts: Record<string, { name: string; path: string; scripts: Record<string, string> }> = {};

          for (const packagePath of allPackageFiles) {
            const packageData = readPackageScripts(packagePath);
            if (!packageData) continue;

            const relativePath = packagePath.replace(projectRoot, '').replace(/^\//, '');

            // Apply package filter
            if (packageFilter && !packageData.name.includes(packageFilter) && !relativePath.includes(packageFilter)) {
              continue;
            }

            // Apply script filter
            let filteredScripts = packageData.scripts;
            if (filter) {
              filteredScripts = Object.fromEntries(
                Object.entries(packageData.scripts).filter(([name]) =>
                  name.includes(filter)
                )
              );
            }

            // Only include if there are scripts
            if (Object.keys(filteredScripts).length > 0) {
              allScripts[relativePath] = {
                name: packageData.name,
                path: relativePath,
                scripts: filteredScripts,
              };
            }
          }

          // Calculate totals
          const totalScripts = Object.values(allScripts).reduce(
            (sum, pkg) => sum + Object.keys(pkg.scripts).length,
            0
          );

          return {
            success: true,
            filter: filter || null,
            packageFilter: packageFilter || null,
            packages: allScripts,
            totalPackages: Object.keys(allScripts).length,
            totalScripts,
            summary: Object.entries(allScripts).map(([path, data]) => ({
              path,
              name: data.name,
              scriptCount: Object.keys(data.scripts).length,
            })),
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
      name: 'start_development',
      description: 'Start development environment',
      inputSchema: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            description: 'Development mode: basic, full, mcp-only',
            enum: ['basic', 'full', 'mcp-only'],
          },
        },
        required: [],
      },
      handler: async (args: Record<string, unknown>) => {
        const mode = (args.mode as string) || 'basic';

        try {
          let command = '';
          switch (mode) {
            case 'basic':
              command = 'npm run dev';
              break;
            case 'full':
              command = 'npm run dev:full';
              break;
            case 'mcp-only':
              command = 'npm run dev:mcp-only';
              break;
          }

          // Start in background
          exec(command, (error) => {
            if (error) {
              console.error(`Development start error: ${error}`);
            }
          });

          return {
            success: true,
            mode,
            command,
            message: `Development environment starting in ${mode} mode`,
            ports: {
              gateway: 7100,
              monolith: 7000,
              auth: 7200,
              admin: 7300,
              web: 7301,
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
  ];
}
