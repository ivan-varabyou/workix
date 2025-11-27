/**
 * Tasks Resource
 *
 * Provides current tasks and intermediate tasks to AI agents
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { MCPResource } from '../types.js';

export function getTasksResource(): MCPResource {
  return {
    uri: 'workix://tasks',
    name: 'Tasks',
    description: 'Current development tasks and intermediate tasks checklist',
    mimeType: 'text/markdown',
    getContent: async () => {
      try {
        const tasksPath = join(process.cwd(), '.specify/specs/005-development-process/TASKS.md');
        const intermediatePath = join(
          process.cwd(),
          '.specify/specs/005-development-process/INTERMEDIATE_TASKS.md'
        );

        const tasks = readFileSync(tasksPath, 'utf-8');
        const intermediate = readFileSync(intermediatePath, 'utf-8');

        return `# Workix Development Tasks\n\n## Main Tasks\n\n${tasks}\n\n---\n\n## Intermediate Tasks (Checklist)\n\n${intermediate}`;
      } catch (error) {
        return `# Tasks\n\nError loading file: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    },
  };
}
