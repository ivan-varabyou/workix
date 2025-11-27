import { Component, input, output } from '@angular/core';
import { Meta, StoryObj } from '@storybook/angular';

/**
 * Button Component - Reusable UI Element
 *
 * Supports multiple variants, sizes, and states
 * Built with Angular 20 signals and new control flow
 */

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [class]="'btn btn-' + variant() + ' btn-' + size()"
      [disabled]="disabled()"
      (click)="handleClick()"
    >
      {{ label() }}
    </button>
  `,
  styles: [
    `
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
      }
      .btn-success {
        background: #28a745;
        color: white;
      }
      .btn-danger {
        background: #dc3545;
        color: white;
      }

      .btn-sm {
        padding: 4px 8px;
        font-size: 12px;
      }
      .btn-md {
        padding: 8px 16px;
        font-size: 14px;
      }
      .btn-lg {
        padding: 12px 24px;
        font-size: 16px;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class ButtonComponent {
  label = input<string>('Click me');
  variant = input<'primary' | 'secondary' | 'success' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  onClick = output<void>();

  handleClick(): void {
    this.onClick.emit();
  }
}

type Story = StoryObj<ButtonComponent>;

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;

/**
 * Primary Button - Default variant
 */
export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

/**
 * Secondary Button
 */
export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

/**
 * Success Button
 */
export const Success: Story = {
  args: {
    label: 'Success Button',
    variant: 'success',
    size: 'md',
  },
};

/**
 * Danger Button
 */
export const Danger: Story = {
  args: {
    label: 'Delete',
    variant: 'danger',
    size: 'md',
  },
};

/**
 * Small Button
 */
export const Small: Story = {
  args: {
    label: 'Small',
    variant: 'primary',
    size: 'sm',
  },
};

/**
 * Large Button
 */
export const Large: Story = {
  args: {
    label: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

/**
 * Disabled Button
 */
export const Disabled: Story = {
  args: {
    label: 'Disabled',
    variant: 'primary',
    disabled: true,
  },
};

/**
 * All Variants
 */
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <app-button label="Primary" variant="primary"></app-button>
        <app-button label="Secondary" variant="secondary"></app-button>
        <app-button label="Success" variant="success"></app-button>
        <app-button label="Danger" variant="danger"></app-button>
      </div>
    `,
    imports: [ButtonComponent],
  }),
};

/**
 * All Sizes
 */
export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <app-button label="Small" size="sm"></app-button>
        <app-button label="Medium" size="md"></app-button>
        <app-button label="Large" size="lg"></app-button>
      </div>
    `,
    imports: [ButtonComponent],
  }),
};
