import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixSnackbarComponent } from './snackbar.component';

const meta: Meta<WorkixSnackbarComponent> = {
  title: 'Shared/UI/Snackbar',
  component: WorkixSnackbarComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    message: {
      control: 'text',
      description: 'Snackbar message',
    },
    action: {
      control: 'text',
      description: 'Action button label',
    },
    duration: {
      control: 'number',
      description: 'Duration in milliseconds',
    },
    open: {
      control: 'boolean',
      description: 'Open state',
    },
    horizontalPosition: {
      control: 'select',
      options: ['start', 'center', 'end', 'left', 'right'],
      description: 'Horizontal position',
    },
    verticalPosition: {
      control: 'select',
      options: ['top', 'bottom'],
      description: 'Vertical position',
    },
    actionClick: {
      action: 'actionClick',
      description: 'Action click event',
    },
    dismiss: {
      action: 'dismiss',
      description: 'Dismiss event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixSnackbarComponent>;

export const Default: Story = {
  args: {
    message: 'This is a snackbar message',
    action: undefined,
    duration: 3000,
    open: true,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  },
};

export const WithAction: Story = {
  args: {
    message: 'This is a snackbar message',
    action: 'Action',
    duration: 3000,
    open: true,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  },
};

export const TopPosition: Story = {
  args: {
    message: 'This is a snackbar message',
    action: undefined,
    duration: 3000,
    open: true,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  },
};
