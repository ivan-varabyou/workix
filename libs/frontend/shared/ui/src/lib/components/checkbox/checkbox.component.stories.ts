import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixCheckboxComponent } from './checkbox.component';

const meta: Meta<WorkixCheckboxComponent> = {
  title: 'Shared/UI/Checkbox',
  component: WorkixCheckboxComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Checked state',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    label: {
      control: 'text',
      description: 'Checkbox label',
    },
    color: {
      control: 'select',
      options: ['primary', 'accent', 'warn'],
      description: 'Checkbox color',
    },
    change: {
      action: 'change',
      description: 'Change event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixCheckboxComponent>;

export const Default: Story = {
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    label: 'Checkbox label',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    indeterminate: false,
    disabled: false,
    label: 'Checked checkbox',
  },
};

export const Indeterminate: Story = {
  args: {
    checked: false,
    indeterminate: true,
    disabled: false,
    label: 'Indeterminate checkbox',
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    indeterminate: false,
    disabled: true,
    label: 'Disabled checkbox',
  },
};

export const WithColor: Story = {
  args: {
    checked: true,
    indeterminate: false,
    disabled: false,
    label: 'Primary checkbox',
    color: 'primary',
  },
};
