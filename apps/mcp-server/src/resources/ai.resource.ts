/**
 * AI Architecture Resource
 *
 * Provides AI libraries and providers specifications
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getAiResource(): MCPResource {
  return {
    uri: 'workix://ai',
    name: 'AI Architecture',
    description: 'AI providers, router, generation services, and ML integration',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/architecture/ai.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# AI Architecture\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
