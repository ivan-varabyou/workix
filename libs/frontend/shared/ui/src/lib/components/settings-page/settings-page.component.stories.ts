import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixSettingsPageComponent } from './settings-page.component';
import { SettingsPageConfig } from './settings-page.component.types';

const meta: Meta<WorkixSettingsPageComponent> = {
  title: 'Components/SettingsPage',
  component: WorkixSettingsPageComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixSettingsPageComponent>;

const settingsConfig: SettingsPageConfig = {
  title: 'System Settings',
  tabs: [
    {
      label: 'General',
      icon: 'settings',
      content: 'form',
      fields: [
        {
          name: 'appName',
          label: 'App Name',
          type: 'text',
          required: true,
          errorMessages: { required: 'App name is required' },
        },
        {
          name: 'appUrl',
          label: 'App URL',
          type: 'text',
          required: true,
          placeholder: 'https://example.com',
          errorMessages: { required: 'App URL is required' },
        },
        {
          name: 'timezone',
          label: 'Timezone',
          type: 'select',
          required: true,
          options: [
            { label: 'UTC', value: 'UTC' },
            { label: 'EST', value: 'EST' },
            { label: 'PST', value: 'PST' },
          ],
        },
        {
          name: 'maintenanceMode',
          label: 'Maintenance Mode',
          type: 'checkbox',
        },
      ],
    },
    {
      label: 'Security',
      icon: 'security',
      content: 'form',
      fields: [
        {
          name: 'enable2FA',
          label: 'Enable Two-Factor Authentication',
          type: 'checkbox',
        },
        {
          name: 'sessionTimeout',
          label: 'Session Timeout (minutes)',
          type: 'number',
          defaultValue: 30,
        },
      ],
    },
    {
      label: 'Email',
      icon: 'email',
      content: 'form',
      fields: [
        {
          name: 'smtpHost',
          label: 'SMTP Host',
          type: 'text',
          required: true,
        },
        {
          name: 'smtpPort',
          label: 'SMTP Port',
          type: 'number',
          required: true,
          defaultValue: 587,
        },
        {
          name: 'fromEmail',
          label: 'From Email',
          type: 'email',
          required: true,
        },
      ],
    },
  ],
  showSaveButton: true,
  showCancelButton: true,
  saveLabel: 'Save Settings',
  cancelLabel: 'Cancel',
  initialData: {
    appName: 'Workix',
    appUrl: 'https://workix.example.com',
    timezone: 'UTC',
    maintenanceMode: false,
  },
};

export const Default: Story = {
  args: {
    config: settingsConfig,
    isLoading: false,
    isSaving: false,
  },
};

export const Loading: Story = {
  args: {
    config: settingsConfig,
    isLoading: true,
    isSaving: false,
  },
};

export const Saving: Story = {
  args: {
    config: settingsConfig,
    isLoading: false,
    isSaving: true,
  },
};

export const WithError: Story = {
  args: {
    config: settingsConfig,
    isLoading: false,
    isSaving: false,
    errorMessage: 'Failed to save settings',
  },
};
