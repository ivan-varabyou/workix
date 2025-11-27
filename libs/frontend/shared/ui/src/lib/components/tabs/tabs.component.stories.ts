import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TabsModule } from 'primeng/tabs';

import { WorkixTabsComponent } from './tabs.component';

const meta: Meta<WorkixTabsComponent> = {
  title: 'Shared/UI/Tabs',
  component: WorkixTabsComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, TabsModule],
    }),
  ],
  argTypes: {
    activeIndex: {
      control: 'number',
      description: 'Active tab index',
    },
    scrollable: {
      control: 'boolean',
      description: 'Enable scrolling for many tabs',
    },
    styleClass: {
      control: 'text',
      description: 'Custom CSS class',
    },
    activeIndexChange: {
      action: 'tabChanged',
      description: 'Tab change event',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixTabsComponent>;

export const Basic: Story = {
  render: () => ({
    template: `
      <workix-tabs [activeIndex]="0">
        <p-tabPanel header="Tab 1">
          <p>Content for Tab 1</p>
        </p-tabPanel>
        <p-tabPanel header="Tab 2">
          <p>Content for Tab 2</p>
        </p-tabPanel>
        <p-tabPanel header="Tab 3">
          <p>Content for Tab 3</p>
        </p-tabPanel>
      </workix-tabs>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <workix-tabs [activeIndex]="0">
        <p-tabPanel header="Home" leftIcon="pi pi-home">
          <p>Home content</p>
        </p-tabPanel>
        <p-tabPanel header="Settings" leftIcon="pi pi-cog">
          <p>Settings content</p>
        </p-tabPanel>
        <p-tabPanel header="Profile" leftIcon="pi pi-user">
          <p>Profile content</p>
        </p-tabPanel>
      </workix-tabs>
    `,
  }),
};

export const Scrollable: Story = {
  render: () => ({
    template: `
      <workix-tabs [activeIndex]="0" [scrollable]="true">
        <p-tabPanel header="Tab 1">Content 1</p-tabPanel>
        <p-tabPanel header="Tab 2">Content 2</p-tabPanel>
        <p-tabPanel header="Tab 3">Content 3</p-tabPanel>
        <p-tabPanel header="Tab 4">Content 4</p-tabPanel>
        <p-tabPanel header="Tab 5">Content 5</p-tabPanel>
        <p-tabPanel header="Tab 6">Content 6</p-tabPanel>
        <p-tabPanel header="Tab 7">Content 7</p-tabPanel>
        <p-tabPanel header="Tab 8">Content 8</p-tabPanel>
      </workix-tabs>
    `,
  }),
};

export const WithRichContent: Story = {
  render: () => ({
    template: `
      <workix-tabs [activeIndex]="0">
        <p-tabPanel header="Overview">
          <h3>Overview</h3>
          <p>This is the overview tab with rich content.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </p-tabPanel>
        <p-tabPanel header="Details">
          <h3>Details</h3>
          <p>Detailed information goes here.</p>
        </p-tabPanel>
        <p-tabPanel header="Settings">
          <h3>Settings</h3>
          <p>Configuration options.</p>
        </p-tabPanel>
      </workix-tabs>
    `,
  }),
};
