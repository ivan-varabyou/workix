/**
 * Code Review Resource
 *
 * Provides code review and testing guidelines
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getCodeReviewResource(): MCPResource {
  return {
    uri: 'workix://code-review',
    name: 'Code Review & Testing',
    description: 'Pre-commit checklist, testing requirements, and code review process',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/process/code-review.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Code Review & Testing\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
