import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TypeScriptConfig {
  compilerOptions?: {
    paths?: Record<string, string[]>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Base Jest configuration for Angular frontend projects
 * @param options Configuration options
 */
export function createJestConfig(options: {
  displayName: string;
  preset: string;
  setupFilesAfterEnv: string[];
  coverageDirectory: string;
  prefix: string;
  rootDir?: string;
}) {
  const rootDir: string = options.rootDir || __dirname;
  let tsconfig: TypeScriptConfig = { compilerOptions: { paths: {} } };
  const tsconfigPath = join(rootDir, 'tsconfig.spec.json');

  if (existsSync(tsconfigPath)) {
    try {
      tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    } catch (e) {
      console.warn(`Failed to read ${tsconfigPath}, using empty paths`);
    }
  }

  return {
    displayName: options.displayName,
    preset: options.preset,
    setupFilesAfterEnv: options.setupFilesAfterEnv,
    coverageDirectory: options.coverageDirectory,
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(ts|mjs|js|html)$': [
        'jest-preset-angular',
        {
          tsconfig: '<rootDir>/tsconfig.spec.json',
          stringifyContentPathRegex: '\\.(html|svg)$',
        },
      ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
    snapshotSerializers: [
      'jest-preset-angular/build/serializers/no-ng-attributes',
      'jest-preset-angular/build/serializers/ng-snapshot',
      'jest-preset-angular/build/serializers/html-comment',
    ],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions?.paths || {}, {
      prefix: options.prefix,
    }),
  };
}
