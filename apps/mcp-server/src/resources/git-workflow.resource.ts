/**
 * Git Workflow Resource
 *
 * Provides git workflow and commit conventions
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getGitWorkflowResource(): MCPResource {
  return {
    uri: 'workix://git-workflow',
    name: 'Git Workflow',
    description: 'Git workflow, branching strategy, and commit conventions',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const filePath = join(process.cwd(), '.specify/specs-optimized/core/git-workflow.md');
        return readFileSync(filePath, 'utf-8');
      } catch (error) {
        return `# Git Workflow\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
