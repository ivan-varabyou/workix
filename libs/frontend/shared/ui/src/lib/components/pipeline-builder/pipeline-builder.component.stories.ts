import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixPipelineBuilderComponent } from './pipeline-builder.component';
import { PipelineBuilderConfig } from './pipeline-builder.component.types';

const meta: Meta<WorkixPipelineBuilderComponent> = {
  title: 'Components/PipelineBuilder',
  component: WorkixPipelineBuilderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixPipelineBuilderComponent>;

const builderConfig: PipelineBuilderConfig = {
  title: 'Pipeline Builder',
  showToolbar: true,
  showStepsList: true,
  showStepEditor: true,
  stepTypes: [
    { value: 'http', label: 'HTTP Request', icon: 'language' },
    { value: 'database', label: 'Database Query', icon: 'storage' },
    { value: 'transform', label: 'Data Transform', icon: 'transform' },
    { value: 'conditional', label: 'Conditional', icon: 'branch' },
    { value: 'email', label: 'Send Email', icon: 'email' },
  ],
  initialData: {
    name: 'Data Processing Pipeline',
    description: 'Process and transform data',
    steps: [],
  },
};

export const Default: Story = {
  args: {
    config: builderConfig,
    isLoading: false,
    isSaving: false,
  },
};

export const WithSteps: Story = {
  args: {
    config: {
      ...builderConfig,
      initialData: {
        ...builderConfig.initialData,
        steps: [
          {
            id: '1',
            name: 'Fetch Data',
            type: 'http',
            config: {},
            position: { x: 100, y: 100 },
            order: 0,
          },
          {
            id: '2',
            name: 'Transform',
            type: 'transform',
            config: {},
            position: { x: 300, y: 100 },
            order: 1,
          },
        ],
      },
    },
    isLoading: false,
    isSaving: false,
  },
};

export const Loading: Story = {
  args: {
    config: builderConfig,
    isLoading: true,
    isSaving: false,
  },
};
