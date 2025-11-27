import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { InputTextModule } from 'primeng/inputtext';

import { WorkixInputComponent } from '../input/input.component';
import { WorkixFormFieldComponent } from './form-field.component';

const meta: Meta<WorkixFormFieldComponent> = {
  title: 'Shared/UI/FormField',
  component: WorkixFormFieldComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        WorkixInputComponent,
      ],
    }),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Field label',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message',
    },
    hint: {
      control: 'text',
      description: 'Hint text',
    },
    required: {
      control: 'boolean',
      description: 'Required field',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixFormFieldComponent>;

export const Basic: Story = {
  render: () => {
    const control = new FormControl('', Validators.required);
    return {
      props: { control },
      template: `
        <workix-form-field label="Email" [control]="control" errorMessage="Email is required">
          <workix-input [value]="control.value || ''" (valueChange)="control.setValue($event)" />
        </workix-form-field>
      `,
    };
  },
};

export const WithHint: Story = {
  render: () => {
    const control = new FormControl('');
    return {
      props: { control },
      template: `
        <workix-form-field
          label="Password"
          [control]="control"
          hint="Must be at least 8 characters"
          errorMessage="Password is required">
          <workix-input
            type="password"
            [value]="control.value || ''"
            (valueChange)="control.setValue($event)"
          />
        </workix-form-field>
      `,
    };
  },
};

export const Required: Story = {
  render: () => {
    const control = new FormControl('', Validators.required);
    return {
      props: { control },
      template: `
        <workix-form-field
          label="Username"
          [control]="control"
          [required]="true"
          errorMessage="Username is required">
          <workix-input
            [value]="control.value || ''"
            (valueChange)="control.setValue($event)"
          />
        </workix-form-field>
      `,
    };
  },
};

export const WithError: Story = {
  render: () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <workix-form-field
          label="Email"
          [control]="control"
          errorMessage="Email is required">
          <workix-input
            [value]="control.value || ''"
            (valueChange)="control.setValue($event)"
          />
        </workix-form-field>
      `,
    };
  },
};
