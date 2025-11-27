/**
 * Testing Guide Resource
 *
 * Provides testing strategy and guidelines
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getTestingGuideResource(): MCPResource {
  return {
    uri: 'workix://testing-guide',
    name: 'Testing Guide',
    description: 'Complete testing guide including unit, integration, and E2E tests',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/process/testing.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Testing Guide\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
