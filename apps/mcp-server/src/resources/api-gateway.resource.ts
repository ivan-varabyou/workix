/**
 * API Gateway Resource
 *
 * Provides API Gateway specifications
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getApiGatewayResource(): MCPResource {
  return {
    uri: 'workix://api-gateway',
    name: 'API Gateway Operations',
    description: 'API Gateway routing, versioning, and operational specifications',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/architecture/api-gateway.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# API Gateway Operations\n\n**Note**: API Gateway specification file not found.\n\n## API Gateway Features\n\n- Request routing to backend services\n- Authentication & authorization\n- Rate limiting\n- Health checks\n- CORS configuration\n- Version management\n\n## Routing\n\n- \`/api/v1/auth/*\` → Auth service (port 7200)\n- \`/api/v1/users/*\` → Monolith API (port 7000)\n- \`/api/v1/pipelines/*\` → Monolith API (port 7000)\n\nError: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  };
}
