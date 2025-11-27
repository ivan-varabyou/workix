import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../apps/**/*.stories.ts',
    '../libs/**/*.stories.ts',
    '../libs/shared/frontend/ui/**/*.stories.ts',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-measure',
    '@storybook/addon-styling',
  ],
  framework: {
    name: '@storybook/angular',
    options: {
      enableIvy: true,
    },
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../apps/client-app/src/assets'],
  webpackFinal: async (config) => {
    return config;
  },
};

export default config;
