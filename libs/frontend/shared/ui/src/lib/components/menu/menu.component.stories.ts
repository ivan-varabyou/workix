import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixMenuComponent } from './menu.component';
import { WorkixMenuItemComponent } from './menu-item.component';

const meta: Meta<WorkixMenuComponent> = {
  title: 'Shared/UI/Menu',
  component: WorkixMenuComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, WorkixMenuItemComponent],
    }),
  ],
  argTypes: {
    xPosition: {
      control: 'select',
      options: ['before', 'after'],
      description: 'Horizontal position',
    },
    yPosition: {
      control: 'select',
      options: ['above', 'below'],
      description: 'Vertical position',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixMenuComponent>;

export const Default: Story = {
  args: {
    xPosition: 'after',
    yPosition: 'below',
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-menu [xPosition]="xPosition" [yPosition]="yPosition">
        <button workix-menu-trigger>Open Menu</button>
        <workix-menu-content>
          <workix-menu-item>Item 1</workix-menu-item>
          <workix-menu-item>Item 2</workix-menu-item>
          <workix-menu-item [disabled]="true">Disabled Item</workix-menu-item>
        </workix-menu-content>
      </workix-menu>
    `,
  }),
};
