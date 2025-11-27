/**
 * Frontend Architecture Resource
 *
 * Provides frontend architecture specifications
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getFrontendResource(): MCPResource {
  return {
    uri: 'workix://frontend',
    name: 'Frontend Architecture',
    description: 'Angular 20, Signals, UI components, and frontend specifications',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/architecture/frontend.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Frontend Architecture\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
