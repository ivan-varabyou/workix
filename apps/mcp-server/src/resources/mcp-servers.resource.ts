/**
 * MCP Servers Resource
 *
 * Provides MCP servers configuration and management
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getMcpServersResource(): MCPResource {
  return {
    uri: 'workix://mcp-servers',
    name: 'MCP Servers Configuration',
    description: 'MCP servers setup, configuration, and management guide',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/architecture/mcp-servers.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# MCP Servers\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
