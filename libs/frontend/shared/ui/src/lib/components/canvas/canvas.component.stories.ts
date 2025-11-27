import type { Meta, StoryObj } from '@storybook/angular';

import { WorkixCanvasComponent } from './canvas.component';
import { CanvasConfig, CanvasStep } from './canvas.component.types';

const meta: Meta<WorkixCanvasComponent> = {
  title: 'Components/Canvas',
  component: WorkixCanvasComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixCanvasComponent>;

const canvasSteps: CanvasStep[] = [
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
  {
    id: '3',
    name: 'Save',
    type: 'database',
    config: {},
    position: { x: 500, y: 100 },
    order: 2,
  },
];

const canvasConfig: CanvasConfig = {
  showConnections: true,
  showGrid: true,
  gridSize: 20,
  stepSize: { width: 120, height: 80 },
};

export const Default: Story = {
  args: {
    steps: canvasSteps,
    config: canvasConfig,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Empty: Story = {
  args: {
    steps: [],
    config: canvasConfig,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const WithoutConnections: Story = {
  args: {
    steps: canvasSteps,
    config: {
      ...canvasConfig,
      showConnections: false,
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};
