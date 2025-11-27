import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { WorkixSpinnerComponent } from './spinner.component';

const meta: Meta<WorkixSpinnerComponent> = {
  title: 'Shared/UI/Spinner',
  component: WorkixSpinnerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ProgressSpinnerModule],
    }),
  ],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show spinner',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spinner size',
    },
    strokeWidth: {
      control: 'text',
      description: 'Stroke width',
    },
    styleClass: {
      control: 'text',
      description: 'Custom CSS class',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixSpinnerComponent>;

export const Basic: Story = {
  args: {
    loading: true,
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    loading: true,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    loading: true,
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; align-items: center;">
        <div>
          <p>Small</p>
          <workix-spinner [loading]="true" size="sm" />
        </div>
        <div>
          <p>Medium</p>
          <workix-spinner [loading]="true" size="md" />
        </div>
        <div>
          <p>Large</p>
          <workix-spinner [loading]="true" size="lg" />
        </div>
      </div>
    `,
  }),
};

export const NotLoading: Story = {
  args: {
    loading: false,
    size: 'md',
  },
};
