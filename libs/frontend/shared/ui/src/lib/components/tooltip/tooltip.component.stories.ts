import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TooltipModule } from 'primeng/tooltip';

import { WorkixTooltipDirective } from './tooltip.directive';

@Component({
  template: `
    <div style="padding: 100px; display: flex; gap: 20px; flex-wrap: wrap;">
      <button [workixTooltip]="tooltip()" [position]="position()" class="p-button p-button-primary">
        Hover me (Top)
      </button>
      <button workixTooltip="Bottom tooltip" position="bottom" class="p-button p-button-primary">
        Hover me (Bottom)
      </button>
      <button workixTooltip="Left tooltip" position="left" class="p-button p-button-primary">
        Hover me (Left)
      </button>
      <button workixTooltip="Right tooltip" position="right" class="p-button p-button-primary">
        Hover me (Right)
      </button>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, TooltipModule, WorkixTooltipDirective],
})
class TooltipTestComponent {
  tooltip = () => 'This is a tooltip';
  position = () => 'top' as const;
}

const meta: Meta<WorkixTooltipDirective> = {
  title: 'Shared/UI/Tooltip',
  component: WorkixTooltipDirective,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, TooltipModule],
    }),
  ],
  argTypes: {
    tooltip: {
      control: 'text',
      description: 'Tooltip text',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Tooltip position',
    },
    showDelay: {
      control: 'number',
      description: 'Show delay in milliseconds',
    },
    hideDelay: {
      control: 'number',
      description: 'Hide delay in milliseconds',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixTooltipDirective>;

export const Basic: Story = {
  render: () => ({
    template: '<button workixTooltip="Tooltip text">Hover me</button>',
  }),
};

export const AllPositions: Story = {
  render: () => ({
    template: `
      <div style="padding: 100px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        <button workixTooltip="Top tooltip" position="top" class="p-button">Top</button>
        <button workixTooltip="Bottom tooltip" position="bottom" class="p-button">Bottom</button>
        <button workixTooltip="Left tooltip" position="left" class="p-button">Left</button>
        <button workixTooltip="Right tooltip" position="right" class="p-button">Right</button>
      </div>
    `,
  }),
};

export const WithDelay: Story = {
  render: () => ({
    template: `
      <div style="padding: 100px;">
        <button
          workixTooltip="Tooltip with 500ms delay"
          position="top"
          [showDelay]="500"
          [hideDelay]="200"
          class="p-button p-button-primary">
          Hover me (with delay)
        </button>
      </div>
    `,
  }),
};
