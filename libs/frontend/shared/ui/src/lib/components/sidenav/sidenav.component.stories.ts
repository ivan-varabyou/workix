import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixListComponent } from '../list/list.component';
import { WorkixListItemComponent } from '../list/list-item.component';
import {
  WorkixSidenavComponent,
  WorkixSidenavContainerComponent,
  WorkixSidenavContentComponent,
} from './sidenav.component';

const meta: Meta<WorkixSidenavContainerComponent> = {
  title: 'Shared/UI/Sidenav',
  component: WorkixSidenavContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        WorkixSidenavComponent,
        WorkixSidenavContentComponent,
        WorkixListComponent,
        WorkixListItemComponent,
      ],
    }),
  ],
  argTypes: {
    autosize: {
      control: 'boolean',
      description: 'Autosize container',
    },
  },
};

export default meta;
type Story = StoryObj<WorkixSidenavContainerComponent>;

export const Default: Story = {
  args: {
    autosize: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <workix-sidenav-container [autosize]="autosize">
        <workix-sidenav [mode]="'side'" [opened]="true">
          <workix-list>
            <workix-list-item>Dashboard</workix-list-item>
            <workix-list-item>Users</workix-list-item>
            <workix-list-item>Settings</workix-list-item>
          </workix-list>
        </workix-sidenav>
        <workix-sidenav-content>
          <h2>Main Content</h2>
          <p>This is the main content area.</p>
        </workix-sidenav-content>
      </workix-sidenav-container>
    `,
  }),
};
