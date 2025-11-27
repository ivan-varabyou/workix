/**
 * Security Resource
 *
 * Provides security specifications
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getSecurityResource(): MCPResource {
  return {
    uri: 'workix://security',
    name: 'Security Architecture',
    description: 'Authentication, RBAC, API keys, rate limiting, and security specifications',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/architecture/security.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Security Architecture\n\n**Note**: Security specification file not found.\n\n## Core Security Features\n\n- JWT-based authentication\n- Multi-tenant isolation\n- Role-based access control (RBAC)\n- API keys management\n- Rate limiting\n- Audit logging\n\nError: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  };
}
