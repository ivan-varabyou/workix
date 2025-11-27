import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixDataTableComponent } from './data-table.component';
import { DataTableAction, DataTableColumn, DataTableConfig } from './data-table.component.types';

const meta: Meta<WorkixDataTableComponent> = {
  title: 'Components/DataTable',
  component: WorkixDataTableComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixDataTableComponent>;

const mockData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: new Date() },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: new Date() },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'editor', createdAt: new Date() },
];

const mockColumns: DataTableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: false },
  { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
];

const mockActions: DataTableAction[] = [
  { label: 'View', icon: 'visibility', action: (row) => console.log('View', row) },
  { label: 'Edit', icon: 'edit', action: (row) => console.log('Edit', row) },
  { label: 'Delete', icon: 'delete', color: 'warn', action: (row) => console.log('Delete', row) },
];

const defaultConfig: DataTableConfig = {
  title: 'Users',
  columns: mockColumns,
  actions: mockActions,
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 100],
  showPagination: true,
  showSearch: true,
  searchPlaceholder: 'Search users...',
};

export const Default: Story = {
  args: {
    config: defaultConfig,
    data: mockData,
    isLoading: false,
    searchTerm: '',
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    data: [],
  },
};

export const NoActions: Story = {
  args: {
    ...Default.args,
    config: {
      ...defaultConfig,
      actions: undefined,
    },
  },
};

export const NoSearch: Story = {
  args: {
    ...Default.args,
    config: {
      ...defaultConfig,
      showSearch: false,
    },
  },
};
