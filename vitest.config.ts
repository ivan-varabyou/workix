import { defineConfig } from 'vitest/config';
import * as path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: __dirname,
      projects: [path.resolve(__dirname, 'tsconfig.base.json')],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      'node_modules/**',
      '**/node_modules/**',
      'dist/',
      'coverage/',
      'apps/api-e2e/**',
      // Exclude Jest test files
      '**/jest.config.ts',
      '**/jest.config.js',
      '**/jest.preset.js',
      // Exclude frontend Jest tests
      'libs/shared/frontend/core/**',
      'libs/shared/frontend/ui/**',
      'apps/app-web/**',
      'apps/app-admin/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.spec.ts',
        '**/*.test.ts',
        'apps/api-e2e/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/api/src'),
    },
  },
});
