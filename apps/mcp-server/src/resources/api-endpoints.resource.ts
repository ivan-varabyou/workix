/**
 * API Endpoints Resource
 *
 * Provides complete API Gateway endpoints specification
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getApiEndpointsResource(): MCPResource {
  return {
    uri: 'workix://api-endpoints',
    name: 'API Endpoints',
    description: 'Complete API Gateway endpoints specification with all phases',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/architecture/api-gateway.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# API Endpoints\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
