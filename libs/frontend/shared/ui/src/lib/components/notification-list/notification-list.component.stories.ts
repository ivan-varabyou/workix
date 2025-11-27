import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixNotificationListComponent } from './notification-list.component';
import { Notification, NotificationListConfig } from './notification-list.component.types';

const meta: Meta<WorkixNotificationListComponent> = {
  title: 'Components/NotificationList',
  component: WorkixNotificationListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixNotificationListComponent>;

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Pipeline Created',
    message: 'Data Processing Pipeline has been created successfully',
    type: 'success',
    read: false,
    timestamp: new Date(),
    icon: 'check_circle',
    action: { label: 'View', url: '/pipelines/1' },
  },
  {
    id: '2',
    title: 'Execution Failed',
    message: 'Email Notification Pipeline execution failed',
    type: 'error',
    read: false,
    timestamp: new Date(Date.now() - 3600000),
    icon: 'error',
    action: { label: 'Retry', url: '/pipelines/2' },
  },
  {
    id: '3',
    title: 'System Update',
    message: 'New features are available in the dashboard',
    type: 'info',
    read: true,
    timestamp: new Date(Date.now() - 7200000),
    icon: 'info',
  },
  {
    id: '4',
    title: 'Warning',
    message: 'High memory usage detected',
    type: 'warning',
    read: true,
    timestamp: new Date(Date.now() - 10800000),
    icon: 'warning',
  },
];

const notificationConfig: NotificationListConfig = {
  title: 'Notifications',
  showFilters: true,
  showPagination: true,
  showMarkAllAsRead: true,
  showClearAll: true,
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  filters: [
    { label: 'All', value: 'all', count: 4 },
    { label: 'Unread', value: 'unread', count: 2 },
    { label: 'Success', value: 'success', count: 1 },
    { label: 'Error', value: 'error', count: 1 },
  ],
};

export const Default: Story = {
  args: {
    notifications: mockNotifications,
    config: notificationConfig,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    notifications: [],
    config: notificationConfig,
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
    config: notificationConfig,
    isLoading: false,
  },
};

export const WithError: Story = {
  args: {
    notifications: [],
    config: notificationConfig,
    isLoading: false,
    errorMessage: 'Failed to load notifications',
  },
};
