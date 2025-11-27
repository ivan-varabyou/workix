import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixToolbarComponent } from './toolbar.component';

const meta: Meta<WorkixToolbarComponent> = {
  title: 'Shared/UI/Toolbar',
  component: WorkixToolbarComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'accent', 'warn'],
      description: 'Toolbar color',
    },
    position: {
      control: 'select',
      options: ['static', 'fixed', 'sticky', 'relative', 'absolute'],
      description: 'Toolbar position',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixToolbarComponent>;

export const Primary: Story = {
  args: {
    color: 'primary',
    position: 'static',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-toolbar [color]="color" [position]="position">
        <span>Toolbar Title</span>
        <span style="flex: 1 1 auto;"></span>
        <button>Action</button>
      </workix-toolbar>
    `,
  }),
};

export const Accent: Story = {
  args: {
    color: 'accent',
    position: 'static',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-toolbar [color]="color" [position]="position">
        <span>Accent Toolbar</span>
      </workix-toolbar>
    `,
  }),
};

export const Fixed: Story = {
  args: {
    color: 'primary',
    position: 'fixed',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-toolbar [color]="color" [position]="position">
        <span>Fixed Toolbar</span>
      </workix-toolbar>
    `,
  }),
};
