import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixListComponent } from './list.component';
import { WorkixListItemComponent } from './list-item.component';

const meta: Meta<WorkixListComponent> = {
  title: 'Shared/UI/List',
  component: WorkixListComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, WorkixListItemComponent],
    }),
  ],
  argTypes: {
    dense: {
      control: 'boolean',
      description: 'Dense list',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixListComponent>;

export const Default: Story = {
  args: {
    dense: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-list [dense]="dense">
        <workix-list-item>Item 1</workix-list-item>
        <workix-list-item>Item 2</workix-list-item>
        <workix-list-item>Item 3</workix-list-item>
      </workix-list>
    `,
  }),
};

export const Dense: Story = {
  args: {
    dense: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-list [dense]="dense">
        <workix-list-item>Item 1</workix-list-item>
        <workix-list-item>Item 2</workix-list-item>
        <workix-list-item>Item 3</workix-list-item>
      </workix-list>
    `,
  }),
};

export const WithSelection: Story = {
  args: {
    dense: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-list [dense]="dense">
        <workix-list-item [selected]="true">Selected Item</workix-list-item>
        <workix-list-item>Item 2</workix-list-item>
        <workix-list-item [disabled]="true">Disabled Item</workix-list-item>
      </workix-list>
    `,
  }),
};
