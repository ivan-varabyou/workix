/**
 * Architecture Vision Resource
 *
 * Provides project architecture vision and strategy
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getArchitectureVisionResource(): MCPResource {
  return {
    uri: 'workix://architecture-vision',
    name: 'Architecture Vision',
    description: 'Workix architecture vision, monolith-first strategy, and phases',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/core/architecture.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Architecture Vision\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
