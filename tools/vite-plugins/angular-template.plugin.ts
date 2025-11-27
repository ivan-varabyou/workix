import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import type { Plugin } from 'vite';

/**
 * Vite plugin for Angular components testing
 *
 * Mimics jest-preset-angular behavior:
 * - Transforms HTML files to string exports (like jest-preset-angular's stringifyContentPathRegex)
 * - Handles SCSS files (returns empty string for tests)
 * - Properly resolves relative paths
 *
 * Usage in vitest.config.ts:
 * ```typescript
 * import angularTemplatePlugin from './tools/vite-plugins/angular-template.plugin';
 *
 * export default defineConfig({
 *   plugins: [angularTemplatePlugin()],
 * });
 * ```
 */
export default function angularTemplatePlugin(): Plugin {
  return {
    name: 'angular-template',
    enforce: 'pre', // Run before other plugins

    resolveId(id: string, importer?: string) {
      // Handle relative HTML/SCSS imports
      if (id.endsWith('.html') || id.endsWith('.scss')) {
        if (importer) {
          // Resolve relative to importer
          const resolved = resolve(dirname(importer), id);
          return resolved;
        }
        // Also handle absolute paths
        if (id.startsWith('/')) {
          return id;
        }
        return id;
      }
      return undefined;
    },

    load(id: string) {
      // Transform HTML files to string exports (like jest-preset-angular)
      if (id.endsWith('.html')) {
        try {
          const content = readFileSync(id, 'utf-8');
          // Export as default string (mimics jest-preset-angular stringifyContentPathRegex)
          return `export default ${JSON.stringify(content)};`;
        } catch (error) {
          // If file doesn't exist, return empty string
          console.warn(`[angular-template-plugin] Could not read ${id}:`, error);
          return 'export default "";';
        }
      }

      // Handle SCSS files (return empty string for tests, similar to jest-preset-angular)
      if (id.endsWith('.scss')) {
        return 'export default "";';
      }

      return undefined;
    },

    transformIndexHtml(_html: string) {
      // Don't transform index.html files
      return undefined;
    },
  };
}
