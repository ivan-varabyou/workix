import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixDividerComponent } from './divider.component';

const meta: Meta<WorkixDividerComponent> = {
  title: 'Shared/UI/Divider',
  component: WorkixDividerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    vertical: {
      control: 'boolean',
      description: 'Vertical divider',
    },
    inset: {
      control: 'boolean',
      description: 'Inset divider',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixDividerComponent>;

export const Horizontal: Story = {
  args: {
    vertical: false,
    inset: false,
  },
};

export const Vertical: Story = {
  args: {
    vertical: true,
    inset: false,
  },
};

export const Inset: Story = {
  args: {
    vertical: false,
    inset: true,
  },
};
