import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { InputTextModule } from 'primeng/inputtext';

import { WorkixInputComponent } from './input.component';

const meta: Meta<WorkixInputComponent> = {
  title: 'Shared/UI/Input',
  component: WorkixInputComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, InputTextModule],
    }),
  ],
  argTypes: {
    value: {
      control: 'text',
      description: 'Input value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input',
    },
    readonly: {
      control: 'boolean',
      description: 'Make input readonly',
    },
    styleClass: {
      control: 'text',
      description: 'Custom CSS class',
    },
    valueChange: {
      action: 'valueChanged',
      description: 'Value change event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixInputComponent>;

export const Basic: Story = {
  args: {
    placeholder: 'Enter text...',
    value: '',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Initial value',
    placeholder: 'Enter text...',
  },
};

export const Disabled: Story = {
  args: {
    value: 'Disabled input',
    disabled: true,
  },
};

export const Readonly: Story = {
  args: {
    value: 'Readonly input',
    readonly: true,
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Type something here...',
  },
};

export const EmailInput: Story = {
  args: {
    placeholder: 'email@example.com',
    value: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div>
        <label>Email</label>
        <workix-input
          [value]="value"
          [placeholder]="placeholder"
          type="email"
        />
      </div>
    `,
  }),
};

export const PasswordInput: Story = {
  args: {
    placeholder: 'Enter password',
    value: '',
  },
  render: (args) => ({
    props: args,
    template: `
      <div>
        <label>Password</label>
        <workix-input
          [value]="value"
          [placeholder]="placeholder"
          type="password"
        />
      </div>
    `,
  }),
};

export const WithCustomClass: Story = {
  args: {
    value: 'Custom styled input',
    styleClass: 'custom-input',
  },
};
