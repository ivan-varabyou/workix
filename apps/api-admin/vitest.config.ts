// eslint-disable-next-line @nx/enforce-module-boundaries
import { createVitestConfig } from '../../libs/shared/backend/vitest.config.base';
import { resolve } from 'path';

export default createVitestConfig({
  root: __dirname,
  coverageDirectory: '../../coverage/apps/api-admin',
  useTsconfigPaths: true,
  alias: {
    '@workix/domain/admin': resolve(__dirname, '../../libs/domain/admin/src/index.ts'),
    '@workix/shared': resolve(__dirname, '../../libs/shared/src/index.ts'),
  },
  test: {
    hookTimeout: 60000, // 60 seconds for beforeAll/afterAll hooks
    testTimeout: 30000, // 30 seconds for individual tests
  },
});
