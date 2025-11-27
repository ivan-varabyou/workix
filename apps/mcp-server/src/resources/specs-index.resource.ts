/**
 * Specifications Index Resource
 *
 * Provides main index of all project specifications
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getSpecsIndexResource(): MCPResource {
  return {
    uri: 'workix://specs-index',
    name: 'Specifications Index',
    description: 'Main index of all Workix project specifications and documentation',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/index.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Specifications Index\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
