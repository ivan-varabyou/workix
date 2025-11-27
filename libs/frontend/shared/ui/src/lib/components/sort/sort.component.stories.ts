import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixSortComponent } from './sort.component';

const meta: Meta<WorkixSortComponent> = {
  title: 'Shared/UI/Sort',
  component: WorkixSortComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    active: {
      control: 'text',
      description: 'Active sort column',
    },
    direction: {
      control: 'select',
      options: ['asc', 'desc', ''],
      description: 'Sort direction',
    },
    disableClear: {
      control: 'boolean',
      description: 'Disable clear sort',
    },
    sortChange: {
      action: 'sortChange',
      description: 'Sort change event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixSortComponent>;

export const Default: Story = {
  args: {
    active: 'name',
    direction: '',
    disableClear: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-sort [active]="active" [direction]="direction" [disableClear]="disableClear">
        Name
      </workix-sort>
    `,
  }),
};

export const Ascending: Story = {
  args: {
    active: 'name',
    direction: 'asc',
    disableClear: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-sort [active]="active" [direction]="direction" [disableClear]="disableClear">
        Name
      </workix-sort>
    `,
  }),
};

export const Descending: Story = {
  args: {
    active: 'name',
    direction: 'desc',
    disableClear: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-sort [active]="active" [direction]="direction" [disableClear]="disableClear">
        Name
      </workix-sort>
    `,
  }),
};
