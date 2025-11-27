import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  WorkixExpansionPanelComponent,
  WorkixExpansionPanelContentComponent,
  WorkixExpansionPanelHeaderComponent,
  WorkixExpansionPanelTitleComponent,
} from './expansion.component';

const meta: Meta<WorkixExpansionPanelComponent> = {
  title: 'Shared/UI/Expansion Panel',
  component: WorkixExpansionPanelComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        WorkixExpansionPanelHeaderComponent,
        WorkixExpansionPanelTitleComponent,
        WorkixExpansionPanelContentComponent,
      ],
    }),
  ],
  argTypes: {
    expanded: {
      control: 'boolean',
      description: 'Expanded state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    hideToggle: {
      control: 'boolean',
      description: 'Hide toggle icon',
    },
    opened: {
      action: 'opened',
      description: 'Opened event',
    },
    closed: {
      action: 'closed',
      description: 'Closed event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixExpansionPanelComponent>;

export const Default: Story = {
  args: {
    expanded: false,
    disabled: false,
    hideToggle: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-expansion-panel [expanded]="expanded" [disabled]="disabled" [hideToggle]="hideToggle">
        <workix-expansion-panel-header>
          <workix-expansion-panel-title>Panel Title</workix-expansion-panel-title>
        </workix-expansion-panel-header>
        <workix-expansion-panel-content>
          This is the panel content.
        </workix-expansion-panel-content>
      </workix-expansion-panel>
    `,
  }),
};

export const Expanded: Story = {
  args: {
    expanded: true,
    disabled: false,
    hideToggle: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-expansion-panel [expanded]="expanded" [disabled]="disabled" [hideToggle]="hideToggle">
        <workix-expansion-panel-header>
          <workix-expansion-panel-title>Expanded Panel</workix-expansion-panel-title>
        </workix-expansion-panel-header>
        <workix-expansion-panel-content>
          This panel is expanded by default.
        </workix-expansion-panel-content>
      </workix-expansion-panel>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    expanded: false,
    disabled: true,
    hideToggle: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-expansion-panel [expanded]="expanded" [disabled]="disabled" [hideToggle]="hideToggle">
        <workix-expansion-panel-header>
          <workix-expansion-panel-title>Disabled Panel</workix-expansion-panel-title>
        </workix-expansion-panel-header>
        <workix-expansion-panel-content>
          This panel is disabled.
        </workix-expansion-panel-content>
      </workix-expansion-panel>
    `,
  }),
};
