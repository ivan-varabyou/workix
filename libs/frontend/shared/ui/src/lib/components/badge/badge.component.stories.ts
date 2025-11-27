import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixBadgeComponent } from './badge.component';

const meta: Meta<WorkixBadgeComponent> = {
  title: 'Shared/UI/Badge',
  component: WorkixBadgeComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, WorkixIconComponent],
    }),
  ],
  argTypes: {
    value: {
      control: 'text',
      description: 'Badge value',
    },
    color: {
      control: 'select',
      options: ['primary', 'accent', 'warn'],
      description: 'Badge color',
    },
    overlap: {
      control: 'boolean',
      description: 'Overlap badge',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixBadgeComponent>;

export const Primary: Story = {
  args: {
    value: '5',
    color: 'primary',
    overlap: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-badge [value]="value" [color]="color" [overlap]="overlap">
        <workix-icon name="notifications" />
      </workix-badge>
    `,
  }),
};

export const Accent: Story = {
  args: {
    value: '12',
    color: 'accent',
    overlap: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-badge [value]="value" [color]="color" [overlap]="overlap">
        <workix-icon name="mail" />
      </workix-badge>
    `,
  }),
};

export const Warn: Story = {
  args: {
    value: '99+',
    color: 'warn',
    overlap: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-badge [value]="value" [color]="color" [overlap]="overlap">
        <workix-icon name="error" />
      </workix-badge>
    `,
  }),
};
