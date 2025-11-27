/**
 * Development Rules Resource
 *
 * Provides development rules and best practices to AI agents
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getDevelopmentRulesResource(): MCPResource {
  return {
    uri: 'workix://development-rules',
    name: 'Development Rules',
    description: 'Workix development rules, SOLID principles, and best practices',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(
          process.cwd(),
          '.specify/specs/005-development-process/DEVELOPMENT_RULES.md'
        );
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Development Rules\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
