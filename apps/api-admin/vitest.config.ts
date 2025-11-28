// eslint-disable-next-line @nx/enforce-module-boundaries
import { createVitestConfig } from '../../libs/backend/shared/core/vitest.config.base';
import { resolve } from 'path';

export default createVitestConfig({
  root: __dirname,
  coverageDirectory: '../../coverage/apps/auth-service',
  useTsconfigPaths: true,
  alias: {
    [resolve(__dirname, '../../libs/backend/domain/auth/src/index.ts')]: resolve(__dirname, '../../libs/domain/auth/src/index.ts'),
    [resolve(__dirname, '../../libs/backend/domain/users/src/index.ts')]: resolve(__dirname, '../../libs/domain/users/src/index.ts'),
    [resolve(__dirname, '../../libs/backend/domain/pipelines/src/index.ts')]: resolve(__dirname, '../../libs/domain/pipelines/src/index.ts'),
    [resolve(__dirname, '../../libs/backend/domain/rbac/src/index.ts')]: resolve(__dirname, '../../libs/domain/rbac/src/index.ts'),
    [resolve(__dirname, '../../libs/shared/utils/src/index.ts')]: resolve(__dirname, '../../libs/shared/src/index.ts'),
    [resolve(__dirname, '../../libs/backend/infrastructure/database/src/index.ts')]: resolve(__dirname, '../../libs/database/src/index.ts'),
  },
  test: {
    hookTimeout: 60000, // 60 seconds for beforeAll/afterAll hooks
    testTimeout: 30000, // 30 seconds for individual tests
  },
});
