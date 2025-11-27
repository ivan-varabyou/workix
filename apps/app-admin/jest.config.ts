// eslint-disable-next-line @nx/enforce-module-boundaries
import { createJestConfig } from '../../libs/shared/frontend/jest.config.base';

export default createJestConfig({
  displayName: 'app-admin',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/app-admin',
  prefix: '<rootDir>/../../',
});
