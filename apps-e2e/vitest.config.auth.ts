import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'auth-e2e',
    globals: true,
    environment: 'node',
    setupFiles: [resolve(__dirname, 'src/support/auth-test-setup.ts')],
    include: ['**/auth/**/*.spec.ts'],
    testTimeout: 30000, // 30 seconds for e2e tests
    hookTimeout: 30000,
    teardownTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'src/support/'],
    },
  },
  resolve: {
    alias: {
      '@workix/domain/auth': resolve(__dirname, '../libs/domain/auth/src/index.ts'),
      '@workix/domain/users': resolve(__dirname, '../libs/domain/users/src/index.ts'),
    },
  },
});
