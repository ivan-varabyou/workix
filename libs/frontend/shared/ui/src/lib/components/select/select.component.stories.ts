import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SelectModule } from 'primeng/select';

import { WorkixSelectComponent } from './select.component';

const meta: Meta<WorkixSelectComponent> = {
  title: 'Shared/UI/Select',
  component: WorkixSelectComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, SelectModule],
    }),
  ],
  argTypes: {
    options: {
      control: 'object',
      description: 'Select options',
    },
    value: {
      control: 'text',
      description: 'Selected value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable select',
    },
    filter: {
      control: 'boolean',
      description: 'Enable filtering',
    },
    valueChange: {
      action: 'valueChanged',
      description: 'Value change event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixSelectComponent>;

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 'option4' },
];

export const Basic: Story = {
  args: {
    options: mockOptions,
    placeholder: 'Select an option',
    value: null,
  },
};

export const WithValue: Story = {
  args: {
    options: mockOptions,
    value: 'option2',
    placeholder: 'Select an option',
  },
};

export const WithFilter: Story = {
  args: {
    options: mockOptions,
    placeholder: 'Search and select...',
    filter: true,
  },
};

export const Disabled: Story = {
  args: {
    options: mockOptions,
    value: 'option1',
    disabled: true,
  },
};

export const WithClear: Story = {
  args: {
    options: mockOptions,
    value: 'option2',
    showClear: true,
    placeholder: 'Select an option',
  },
};

export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 20 }, (_, i) => ({
      label: `Option ${i + 1}`,
      value: `option${i + 1}`,
    })),
    placeholder: 'Select from many options...',
    filter: true,
  },
};
