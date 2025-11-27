import * as path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/api-monolith/src/app/integrations/**/*.e2e.spec.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
    setupFiles: [],
    globalSetup: path.resolve(
      process.cwd(),
      'apps/api-monolith/src/app/integrations/support/global-setup.ts'
    ),
    testTimeout: 30000,
    hookTimeout: 60000, // Give more time for server startup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'apps/monolith/src/app/integrations/support/'],
    },
  },
});
