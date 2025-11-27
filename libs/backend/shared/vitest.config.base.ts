/// <reference types='vitest' />
import { defineConfig, UserConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Base Vitest configuration for NestJS backend projects
 * @param options Configuration options
 */
export function createVitestConfig(options: {
  root: string;
  coverageDirectory: string;
  exclude?: string[];
  alias?: Record<string, string>;
  useTsconfigPaths?: boolean;
  test?: {
    hookTimeout?: number;
    testTimeout?: number;
  };
}) {
  const plugins = [nxViteTsPaths()];

  // Always add tsconfigPaths plugin to resolve @workix/* aliases
  plugins.push(
    tsconfigPaths({
      root: resolve(options.root, '../../'),
      projects: [resolve(options.root, '../../tsconfig.base.json')],
      ignoreConfigErrors: true,
    })
  );

  const config: UserConfig = {
    root: options.root,
    plugins,
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: options.exclude || [],
      reporters: ['default'],
      hookTimeout: options.test?.hookTimeout ?? 120000, // 120 seconds for beforeAll/afterAll hooks (for integration tests)
      testTimeout: options.test?.testTimeout ?? 30000, // 30 seconds for individual tests
      coverage: {
        reportsDirectory: options.coverageDirectory,
        provider: 'v8',
      },
    },
  };

  // Add resolve.alias if provided
  if (options.alias && Object.keys(options.alias).length > 0) {
    config.resolve = {
      alias: options.alias,
    };
  }

  return defineConfig(config);
}
