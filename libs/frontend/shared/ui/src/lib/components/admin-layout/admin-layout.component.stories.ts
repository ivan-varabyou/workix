import { RouterModule } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixAdminLayoutComponent } from './admin-layout.component';
import { AdminLayoutMenuItem, AdminLayoutUserMenu } from './admin-layout.component.types';

const meta: Meta<WorkixAdminLayoutComponent> = {
  title: 'Layout/AdminLayout',
  component: WorkixAdminLayoutComponent,
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
type Story = StoryObj<WorkixAdminLayoutComponent>;

const defaultMenuItems: AdminLayoutMenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Users', icon: 'people', route: '/users' },
  { label: 'Roles & Permissions', icon: 'security', route: '/roles' },
  { label: 'Analytics', icon: 'analytics', route: '/analytics' },
  { label: 'Integrations', icon: 'link', route: '/integrations' },
  { label: 'Pipelines', icon: 'pipeline', route: '/pipelines' },
  { label: 'Audit Logs', icon: 'history', route: '/audit-logs' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
];

const defaultUserMenu: AdminLayoutUserMenu = {
  items: [
    { label: 'Profile', icon: 'person', routerLink: '/profile' },
    { label: 'Settings', icon: 'settings', routerLink: '/settings' },
    { label: 'Logout', icon: 'logout', action: () => console.log('Logout clicked') },
  ],
};

export const Default: Story = {
  args: {
    title: 'Workix Admin Dashboard',
    isDarkMode: false,
    isAuthenticated: true,
    menuItems: defaultMenuItems,
    userMenu: defaultUserMenu,
  },
};

export const DarkMode: Story = {
  args: {
    ...Default.args,
    isDarkMode: true,
  },
};

export const NoUserMenu: Story = {
  args: {
    ...Default.args,
    userMenu: null,
  },
};

export const EmptyMenu: Story = {
  args: {
    ...Default.args,
    menuItems: [],
  },
};
