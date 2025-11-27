// eslint-disable-next-line @nx/enforce-module-boundaries
import { createJestConfig } from '../jest.config.base';

export default createJestConfig({
  displayName: 'shared-frontend-ui',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/libs/shared/frontend/ui',
  prefix: '<rootDir>/../../../../',
});
