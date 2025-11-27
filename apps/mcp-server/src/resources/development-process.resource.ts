/**
 * Development Process Resource
 *
 * Provides main development process specification
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getDevelopmentProcessResource(): MCPResource {
  return {
    uri: 'workix://development-process',
    name: 'Development Process',
    description: 'Main development process specification with full task lifecycle',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/core/development.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Development Process\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
