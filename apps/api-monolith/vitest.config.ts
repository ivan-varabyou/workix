// eslint-disable-next-line @nx/enforce-module-boundaries
import { createVitestConfig } from '../../libs/shared/backend/vitest.config.base';

export default createVitestConfig({
  root: __dirname,
  coverageDirectory: '../../coverage/apps/monolith',
  useTsconfigPaths: true,
  exclude: ['src/**/*.e2e.spec.ts'],
});
