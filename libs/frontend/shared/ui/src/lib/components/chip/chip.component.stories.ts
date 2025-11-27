import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChipModule } from 'primeng/chip';

import { WorkixChipComponent } from './chip.component';

const meta: Meta<WorkixChipComponent> = {
  title: 'Shared/UI/Chip',
  component: WorkixChipComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ChipModule],
    }),
  ],
  argTypes: {
    label: {
      control: 'text',
      description: 'Chip label text',
    },
    removable: {
      control: 'boolean',
      description: 'Show remove button',
    },
    styleClass: {
      control: 'text',
      description: 'Custom CSS class',
    },
    onRemove: {
      action: 'removed',
      description: 'Remove event handler',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixChipComponent>;

export const Basic: Story = {
  args: {
    label: 'Basic Chip',
    removable: false,
  },
};

export const Removable: Story = {
  args: {
    label: 'Removable Chip',
    removable: true,
  },
};

export const Multiple: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <workix-chip label="Chip 1" />
        <workix-chip label="Chip 2" [removable]="true" />
        <workix-chip label="Chip 3" />
        <workix-chip label="Chip 4" [removable]="true" />
      </div>
    `,
  }),
};
