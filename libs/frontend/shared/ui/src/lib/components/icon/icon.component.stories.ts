import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixIconComponent } from './icon.component';

const meta: Meta<WorkixIconComponent> = {
  title: 'Shared/UI/Icon',
  component: WorkixIconComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    name: {
      control: 'text',
      description: 'Icon name',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Icon size',
    },
    color: {
      control: 'color',
      description: 'Icon color',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixIconComponent>;

export const Primary: Story = {
  args: {
    name: 'home',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    name: 'home',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    name: 'home',
    size: 'lg',
  },
};

export const WithColor: Story = {
  args: {
    name: 'home',
    size: 'md',
    color: '#1976d2',
  },
};
