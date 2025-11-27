import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixDetailViewComponent } from './detail-view.component';
import { DetailViewConfig } from './detail-view.component.types';

const meta: Meta<WorkixDetailViewComponent> = {
  title: 'Components/DetailView',
  component: WorkixDetailViewComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixDetailViewComponent>;

const userConfig: DetailViewConfig = {
  title: 'John Doe',
  subtitle: 'User Details',
  fields: [
    { label: 'Email', value: 'john.doe@example.com' },
    { label: 'Role', value: 'Admin' },
    { label: 'Status', value: true, format: 'boolean' },
    { label: 'Phone', value: '+1 234 567 8900' },
    { label: 'Bio', value: 'Software developer with 10+ years of experience.', fullWidth: true },
    { label: 'Created At', value: new Date().toISOString(), format: 'date' },
    { label: 'Updated At', value: new Date().toISOString(), format: 'date' },
  ],
  showBackButton: true,
  actions: [
    {
      label: 'Edit',
      icon: 'edit',
      variant: 'primary',
      onClick: () => {
        /* Story action */
      },
    },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      onClick: () => {
        /* Story action */
      },
    },
  ],
};

export const Default: Story = {
  args: {
    config: userConfig,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    config: userConfig,
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    config: userConfig,
    isLoading: false,
    errorMessage: 'Failed to load user details',
  },
};
