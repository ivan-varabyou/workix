import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixStepEditorComponent } from './step-editor.component';
import { StepEditorConfig, StepEditorStep } from './step-editor.component.types';

const meta: Meta<WorkixStepEditorComponent> = {
  title: 'Components/StepEditor',
  component: WorkixStepEditorComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixStepEditorComponent>;

const httpStep: StepEditorStep = {
  id: '1',
  name: 'HTTP Request',
  type: 'http',
  config: {
    method: 'GET',
    url: 'https://api.example.com/data',
    headers: '{"Content-Type": "application/json"}',
    body: '{}',
  },
};

const databaseStep: StepEditorStep = {
  id: '2',
  name: 'Database Query',
  type: 'database',
  config: {
    database: 'postgresql',
    query: 'SELECT * FROM users WHERE status = "active";',
  },
};

const editorConfig: StepEditorConfig = {
  title: 'Step Editor',
  showTabs: true,
  showDeleteButton: true,
};

export const HttpStep: Story = {
  args: {
    step: httpStep,
    config: editorConfig,
    isLoading: false,
  },
};

export const DatabaseStep: Story = {
  args: {
    step: databaseStep,
    config: editorConfig,
    isLoading: false,
  },
};

export const WithoutTabs: Story = {
  args: {
    step: httpStep,
    config: {
      ...editorConfig,
      showTabs: false,
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    step: httpStep,
    config: editorConfig,
    isLoading: true,
  },
};
