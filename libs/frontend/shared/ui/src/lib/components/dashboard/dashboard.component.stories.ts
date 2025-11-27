import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixDashboardComponent } from './dashboard.component';
import { DashboardConfig } from './dashboard.component.types';

const meta: Meta<WorkixDashboardComponent> = {
  title: 'Components/Dashboard',
  component: WorkixDashboardComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixDashboardComponent>;

const dashboardConfig: DashboardConfig = {
  title: 'Dashboard',
  stats: [
    {
      title: 'Active Pipelines',
      value: 12,
      icon: 'pipe',
      color: 'primary',
      trend: { value: 5, direction: 'up' },
    },
    {
      title: 'Total Executions',
      value: 256,
      icon: 'trending_up',
      color: 'secondary',
      trend: { value: 12, direction: 'up' },
    },
    {
      title: 'Successful',
      value: 248,
      icon: 'check_circle',
      color: 'success',
      trend: { value: 2, direction: 'up' },
    },
    {
      title: 'Failed',
      value: 8,
      icon: 'error',
      color: 'warning',
      trend: { value: 3, direction: 'down' },
    },
  ],
  activities: [
    {
      id: '1',
      title: 'Pipeline Created',
      description: 'Data Processing Pipeline',
      timestamp: new Date(),
      icon: 'add_circle',
      type: 'info',
    },
    {
      id: '2',
      title: 'Execution Completed',
      description: 'Email Notification Pipeline',
      timestamp: new Date(Date.now() - 3600000),
      icon: 'check_circle',
      type: 'success',
    },
    {
      id: '3',
      title: 'Execution Failed',
      description: 'Data Sync Pipeline',
      timestamp: new Date(Date.now() - 7200000),
      icon: 'error',
      type: 'error',
    },
  ],
  showActivities: true,
  activitiesTitle: 'Recent Activity',
};

export const Default: Story = {
  args: {
    config: dashboardConfig,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    config: dashboardConfig,
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    config: dashboardConfig,
    isLoading: false,
    errorMessage: 'Failed to load dashboard data',
  },
};

export const NoActivities: Story = {
  args: {
    config: {
      ...dashboardConfig,
      showActivities: false,
    },
    isLoading: false,
  },
};
