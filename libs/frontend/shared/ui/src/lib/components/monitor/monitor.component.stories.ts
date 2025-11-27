import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixMonitorComponent } from './monitor.component';
import { MonitorConfig, MonitorExecution } from './monitor.component.types';

const meta: Meta<WorkixMonitorComponent> = {
  title: 'Components/Monitor',
  component: WorkixMonitorComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixMonitorComponent>;

const mockExecution: MonitorExecution = {
  id: '1',
  status: 'running',
  startTime: new Date(),
  progress: 65,
  stepsCompleted: 3,
  totalSteps: 5,
};

const mockExecutions: MonitorExecution[] = [
  {
    id: '1',
    status: 'success',
    startTime: new Date(Date.now() - 7200000),
    endTime: new Date(Date.now() - 7100000),
    duration: 100,
    progress: 100,
    stepsCompleted: 5,
    totalSteps: 5,
  },
  {
    id: '2',
    status: 'failed',
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() - 3500000),
    duration: 100,
    progress: 60,
    stepsCompleted: 3,
    totalSteps: 5,
  },
  {
    id: '3',
    status: 'running',
    startTime: new Date(Date.now() - 60000),
    progress: 40,
    stepsCompleted: 2,
    totalSteps: 5,
  },
];

const monitorConfig: MonitorConfig = {
  title: 'Pipeline Execution Monitor',
  showCurrentExecution: true,
  showTabs: true,
  tabs: [
    { label: 'Execution History', content: 'history' },
    { label: 'Performance', content: 'performance' },
  ],
  stats: [
    { label: 'Average Duration', value: '120s', icon: 'schedule', color: 'info' },
    { label: 'Success Rate', value: '95%', icon: 'check_circle', color: 'success' },
    { label: 'Total Executions', value: 150, icon: 'trending_up', color: 'primary' },
    { label: 'Last Execution', value: '2 hours ago', icon: 'access_time', color: 'info' },
  ],
  actions: [
    {
      label: 'Execute Now',
      icon: 'play_arrow',
      variant: 'primary',
      onClick: () => {
        /* Story action */
      },
    },
  ],
};

export const Default: Story = {
  args: {
    config: monitorConfig,
    currentExecution: mockExecution,
    executions: mockExecutions,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    config: monitorConfig,
    currentExecution: null,
    executions: [],
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    config: monitorConfig,
    currentExecution: null,
    executions: [],
    isLoading: false,
    errorMessage: 'Failed to load monitor data',
  },
};

export const NoCurrentExecution: Story = {
  args: {
    config: {
      ...monitorConfig,
      showCurrentExecution: false,
    },
    currentExecution: null,
    executions: mockExecutions,
    isLoading: false,
  },
};
