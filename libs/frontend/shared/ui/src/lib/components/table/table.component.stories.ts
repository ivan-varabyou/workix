import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

import { WorkixTableComponent } from './table.component';

const meta: Meta<WorkixTableComponent> = {
  title: 'Shared/UI/Table',
  component: WorkixTableComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, TableModule, PaginatorModule],
    }),
  ],
  argTypes: {
    data: {
      control: 'object',
      description: 'Table data',
    },
    columns: {
      control: 'object',
      description: 'Table columns',
    },
    paginator: {
      control: 'boolean',
      description: 'Show paginator',
    },
    rows: {
      control: 'number',
      description: 'Rows per page',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixTableComponent>;

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Admin' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' },
];

const mockColumns = [
  { field: 'id', header: 'ID', sortable: true },
  { field: 'name', header: 'Name', sortable: true },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'role', header: 'Role', sortable: true },
];

export const Basic: Story = {
  args: {
    data: mockData,
    columns: mockColumns,
    paginator: false,
  },
};

export const WithPaginator: Story = {
  args: {
    data: mockData,
    columns: mockColumns,
    paginator: true,
    rows: 3,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: mockColumns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: mockColumns,
    paginator: false,
  },
};

export const Sortable: Story = {
  args: {
    data: mockData,
    columns: mockColumns,
    paginator: false,
    sortMode: 'single',
  },
};

export const Selectable: Story = {
  args: {
    data: mockData,
    columns: mockColumns,
    paginator: false,
    selectionMode: 'single',
  },
};
