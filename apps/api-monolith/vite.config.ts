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
      name: 'monolith',
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
        dir: 'dist/apps/monolith',
        format: 'cjs',
        entryFileNames: 'main.js',
      },
    },
    outDir: 'dist/apps/monolith',
    target: 'node18',
    ssr: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@workix/domain/auth': resolve(__dirname, '../../libs/domain/auth/src/index.ts'),
      '@workix/domain/users': resolve(__dirname, '../../libs/domain/users/src/index.ts'),
      '@workix/domain/pipelines': resolve(__dirname, '../../libs/domain/pipelines/src/index.ts'),
      '@workix/domain/rbac': resolve(__dirname, '../../libs/domain/rbac/src/index.ts'),
      '@workix/domain/webhooks': resolve(__dirname, '../../libs/domain/webhooks/src/index.ts'),
      '@workix/infrastructure/api-keys': resolve(
        __dirname,
        '../../libs/infrastructure/api-keys/src/index.ts'
      ),
      '@workix/domain/workflows': resolve(__dirname, '../../libs/domain/workflows/src/index.ts'),
      '@workix/utilities/batch-processing': resolve(
        __dirname,
        '../../libs/utilities/batch-processing/src/index.ts'
      ),
      '@workix/utilities/file-storage': resolve(
        __dirname,
        '../../libs/utilities/file-storage/src/index.ts'
      ),
      '@workix/utilities/data-validation': resolve(
        __dirname,
        '../../libs/utilities/data-validation/src/index.ts'
      ),
      '@workix/utilities/custom-scripts': resolve(
        __dirname,
        '../../libs/utilities/custom-scripts/src/index.ts'
      ),
      '@workix/ai/ml-integration': resolve(__dirname, '../../libs/ai/ml-integration/src/index.ts'),
      '@workix/integrations/communication/slack': resolve(
        __dirname,
        '../../libs/integrations/communication/slack/src/index.ts'
      ),
      '@workix/integrations/code/github': resolve(
        __dirname,
        '../../libs/integrations/code/github/src/index.ts'
      ),
      '@workix/integrations/code/gitlab': resolve(
        __dirname,
        '../../libs/integrations/code/gitlab/src/index.ts'
      ),
      '@workix/integrations/project-management/jira': resolve(
        __dirname,
        '../../libs/integrations/project-management/jira/src/index.ts'
      ),
      '@workix/integrations/cloud/aws': resolve(
        __dirname,
        '../../libs/integrations/cloud/aws/src/index.ts'
      ),
      '@workix/integrations/cloud/gcp': resolve(
        __dirname,
        '../../libs/integrations/cloud/gcp/src/index.ts'
      ),
      '@workix/integrations/cloud/azure': resolve(
        __dirname,
        '../../libs/integrations/cloud/azure/src/index.ts'
      ),
      '@workix/integrations/project-management/salesforce': resolve(
        __dirname,
        '../../libs/integrations/project-management/salesforce/src/index.ts'
      ),
      '@workix/ai/ai-core': resolve(__dirname, '../../libs/ai/ai-core/src/index.ts'),
      '@workix/ai/generation': resolve(__dirname, '../../libs/ai/generation/src/index.ts'),
      '@workix/integrations/core': resolve(__dirname, '../../libs/integrations/core/src/index.ts'),
      '@workix/integrations': resolve(__dirname, '../../libs/integrations/src/index.ts'),
      '@workix/utilities/ab-testing': resolve(
        __dirname,
        '../../libs/utilities/ab-testing/src/index.ts'
      ),
      '@workix/domain/workers': resolve(__dirname, '../../libs/domain/workers/src/index.ts'),
    },
  },
  ssr: {
    noExternal: ['@workix/*'],
  },
});
