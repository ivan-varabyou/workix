// eslint-disable-next-line @nx/enforce-module-boundaries
import { createJestConfig } from '../jest.config.base';

export default createJestConfig({
  displayName: 'shared-frontend-api',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/shared/frontend/api',
});
