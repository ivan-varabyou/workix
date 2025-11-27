import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonModule } from 'primeng/button';

import { WorkixButtonComponent } from './button.component';

const meta: Meta<WorkixButtonComponent> = {
  title: 'Shared/UI/Button',
  component: WorkixButtonComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ButtonModule],
    }),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Button label text',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'help'],
      description: 'Button variant/color',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    icon: {
      control: 'text',
      description: 'Icon name (PrimeNG icon)',
    },
    iconPos: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: 'Icon position',
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixButtonComponent>;

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Success: Story = {
  args: {
    label: 'Success Button',
    variant: 'success',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    label: 'Danger Button',
    variant: 'danger',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    label: 'Small Button',
    variant: 'primary',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading Button',
    variant: 'primary',
    loading: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Button with Icon',
    variant: 'primary',
    icon: 'pi pi-check',
    iconPos: 'left',
  },
};

export const Outlined: Story = {
  args: {
    label: 'Outlined Button',
    variant: 'primary',
    outlined: true,
  },
};

export const Text: Story = {
  args: {
    label: 'Text Button',
    variant: 'primary',
    text: true,
  },
};

export const Rounded: Story = {
  args: {
    label: 'Rounded Button',
    variant: 'primary',
    rounded: true,
  },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <workix-button label="Primary" variant="primary" />
        <workix-button label="Secondary" variant="secondary" />
        <workix-button label="Success" variant="success" />
        <workix-button label="Info" variant="info" />
        <workix-button label="Warning" variant="warning" />
        <workix-button label="Danger" variant="danger" />
        <workix-button label="Help" variant="help" />
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <workix-button label="Small" variant="primary" size="sm" />
        <workix-button label="Medium" variant="primary" size="md" />
        <workix-button label="Large" variant="primary" size="lg" />
      </div>
    `,
  }),
};
