import { RouterModule } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixClientLayoutComponent } from './client-layout.component';
import { ClientLayoutUserMenu } from './client-layout.component.types';

const meta: Meta<WorkixClientLayoutComponent> = {
  title: 'Layout/ClientLayout',
  component: WorkixClientLayoutComponent,
  decorators: [
    moduleMetadata({
      imports: [RouterModule.forRoot([])],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WorkixClientLayoutComponent>;

const defaultUserMenu: ClientLayoutUserMenu = {
  items: [
    { label: 'Profile', icon: 'person', routerLink: '/profile' },
    { label: 'Settings', icon: 'settings', routerLink: '/settings' },
    { label: 'Logout', icon: 'logout', action: () => console.log('Logout clicked') },
  ],
};

export const Default: Story = {
  args: {
    title: 'Workix',
    isDarkMode: false,
    isAuthenticated: true,
    userMenu: defaultUserMenu,
  },
};

export const DarkMode: Story = {
  args: {
    ...Default.args,
    isDarkMode: true,
  },
};

export const NotAuthenticated: Story = {
  args: {
    ...Default.args,
    isAuthenticated: false,
    userMenu: null,
  },
};
