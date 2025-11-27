import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(js|jsx|ts|tsx|mdx)', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials', // Включает большинство необходимых addons
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    // '@storybook/addon-measure', // Опциональный, может отсутствовать
    // '@storybook/addon-styling', // Опциональный, может отсутствовать
    // '@storybook/addon-docs', // Включен в essentials
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
  // staticDirs: ['../../../../apps/client-app/src/assets'], // TODO: создать директорию assets если нужна
  // Port configuration according to project specification
  // Port 7400 is the default for Storybook in Workix project (development tools range)
  port: parseInt(process.env['STORYBOOK_PORT'] || '7400', 10),
  webpackFinal: async (config) => {
    return config;
  },
};

export default config;
