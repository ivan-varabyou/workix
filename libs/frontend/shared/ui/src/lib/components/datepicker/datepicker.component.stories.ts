import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixDatepickerComponent } from './datepicker.component';

const meta: Meta<WorkixDatepickerComponent> = {
  title: 'Shared/UI/Datepicker',
  component: WorkixDatepickerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    value: {
      control: 'date',
      description: 'Selected date',
    },
    label: {
      control: 'text',
      description: 'Datepicker label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    min: {
      control: 'date',
      description: 'Minimum date',
    },
    max: {
      control: 'date',
      description: 'Maximum date',
    },
    dateChange: {
      action: 'dateChange',
      description: 'Date change event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixDatepickerComponent>;

export const Default: Story = {
  args: {
    value: undefined,
    label: 'Select Date',
    placeholder: 'Select date',
    disabled: false,
    min: undefined,
    max: undefined,
  },
};

export const WithValue: Story = {
  args: {
    value: new Date('2024-01-15'),
    label: 'Select Date',
    placeholder: 'Select date',
    disabled: false,
    min: undefined,
    max: undefined,
  },
};

export const WithMinMax: Story = {
  args: {
    value: undefined,
    label: 'Select Date',
    placeholder: 'Select date',
    disabled: false,
    min: new Date('2024-01-01'),
    max: new Date('2024-12-31'),
  },
};

export const Disabled: Story = {
  args: {
    value: undefined,
    label: 'Select Date',
    placeholder: 'Select date',
    disabled: true,
    min: undefined,
    max: undefined,
  },
};
