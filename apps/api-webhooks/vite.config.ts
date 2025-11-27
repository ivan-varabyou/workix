import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: resolve(__dirname, '../../'),
      projects: [resolve(__dirname, '../../tsconfig.base.json')],
      ignoreConfigErrors: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'webhooks-service',
      fileName: 'main',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: (id) => {
        // Externalize node_modules, but bundle @workix/* libraries
        if (id.startsWith('@workix/')) {
          return false;
        }
        // Externalize Prisma Client
        if (id.includes('.prisma/client') || id.includes('@prisma/client')) {
          return true;
        }
        // Externalize all other node_modules
        return !id.startsWith('.') && !id.startsWith('/') && !id.includes('node_modules/@workix');
      },
      output: {
        dir: 'dist/apps/api-webhooks',
        format: 'cjs',
        entryFileNames: 'main.js',
      },
    },
    outDir: 'dist/apps/api-webhooks',
    target: 'node18',
    ssr: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      // More specific aliases must come first
      "@workix/shared/backend/core": resolve(__dirname, '../../libs/shared/backend/core/src/index.ts'),
      "@workix/domain/auth": resolve(__dirname, '../../libs/domain/auth/src/index.ts'),
      "@workix/domain/webhooks": resolve(__dirname, '../../libs/domain/webhooks/src/index.ts'),
      "@workix/infrastructure/prisma": resolve(__dirname, '../../libs/infrastructure/prisma/src/index.ts'),
      // Less specific aliases come last
      "@workix/shared": resolve(__dirname, '../../libs/shared/src/index.ts'),
    },
  },
});
