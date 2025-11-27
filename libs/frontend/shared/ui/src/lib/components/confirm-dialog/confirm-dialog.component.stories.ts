import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogConfig } from './confirm-dialog.component.types';

const meta: Meta<WorkixConfirmDialogComponent> = {
  title: 'Components/ConfirmDialog',
  component: WorkixConfirmDialogComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixConfirmDialogComponent>;

const deleteConfig: ConfirmDialogConfig = {
  title: 'Delete User',
  message: 'Are you sure you want to delete this user? This action cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  confirmVariant: 'danger',
};

export const Default: Story = {
  args: {
    visible: true,
    config: deleteConfig,
    isLoading: false,
  },
};

export const Warning: Story = {
  args: {
    visible: true,
    config: {
      ...deleteConfig,
      title: 'Warning',
      message: 'This action may have unintended consequences. Are you sure?',
      confirmVariant: 'warning',
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    visible: true,
    config: deleteConfig,
    isLoading: true,
  },
};

export const NoCancel: Story = {
  args: {
    visible: true,
    config: {
      ...deleteConfig,
      showCancel: false,
    },
    isLoading: false,
  },
};
