import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.spec.ts', '**/*.interface.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@workix/ai/generation': resolve(__dirname, '../../libs/ai/generation/src/index.ts'),
      '@workix/ai/ai-core': resolve(__dirname, '../../libs/ai/ai-core/src/index.ts'),
      '@workix/domain/auth': resolve(__dirname, '../../libs/domain/auth/src/index.ts'),
      '@workix/shared/backend/core': resolve(__dirname, '../../libs/shared/backend/core/src/index.ts'),
      '@workix/infrastructure/prisma': resolve(__dirname, '../../libs/infrastructure/prisma/src/index.ts'),
    },
  },
});
