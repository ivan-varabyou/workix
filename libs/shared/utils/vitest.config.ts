// eslint-disable-next-line @nx/enforce-module-boundaries
import { createVitestConfig } from '../backend/vitest.config.base';

export default createVitestConfig({
  root: __dirname,
  coverageDirectory: '../../../../coverage/libs/shared/utils',
  useTsconfigPaths: true,
});
