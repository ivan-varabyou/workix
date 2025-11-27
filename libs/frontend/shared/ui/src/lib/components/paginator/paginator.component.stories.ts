import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixPaginatorComponent } from './paginator.component';

const meta: Meta<WorkixPaginatorComponent> = {
  title: 'Shared/UI/Paginator',
  component: WorkixPaginatorComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  argTypes: {
    length: {
      control: 'number',
      description: 'Total number of items',
    },
    pageSize: {
      control: 'number',
      description: 'Number of items per page',
    },
    pageIndex: {
      control: 'number',
      description: 'Current page index',
    },
    pageSizeOptions: {
      control: 'object',
      description: 'Available page size options',
    },
    showFirstLastButtons: {
      control: 'boolean',
      description: 'Show first/last buttons',
    },
    page: {
      action: 'page',
      description: 'Page change event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixPaginatorComponent>;

export const Default: Story = {
  args: {
    length: 100,
    pageSize: 10,
    pageIndex: 0,
    pageSizeOptions: [5, 10, 20, 50],
    showFirstLastButtons: true,
  },
};

export const LargeDataset: Story = {
  args: {
    length: 1000,
    pageSize: 20,
    pageIndex: 0,
    pageSizeOptions: [10, 20, 50, 100],
    showFirstLastButtons: true,
  },
};

export const SmallDataset: Story = {
  args: {
    length: 15,
    pageSize: 5,
    pageIndex: 0,
    pageSizeOptions: [5, 10],
    showFirstLastButtons: false,
  },
};
