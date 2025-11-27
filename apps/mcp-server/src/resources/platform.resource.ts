/**
 * Platform Foundation Resource
 *
 * Provides platform foundation specifications
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getPlatformResource(): MCPResource {
  return {
    uri: 'workix://platform',
    name: 'Platform Foundation',
    description: 'Platform foundation, multi-tenancy, and core infrastructure',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/architecture/platform.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Platform Foundation\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
