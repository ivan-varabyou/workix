import { RouterModule } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { WorkixResponsiveLayoutComponent } from './responsive-layout.component';
import { ResponsiveLayoutMenuItem } from './responsive-layout.component.types';

const meta: Meta<WorkixResponsiveLayoutComponent> = {
  title: 'Layout/ResponsiveLayout',
  component: WorkixResponsiveLayoutComponent,
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
type Story = StoryObj<WorkixResponsiveLayoutComponent>;

const defaultMenuItems: ResponsiveLayoutMenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Pipelines', icon: 'pipe', route: '/pipelines' },
  { label: 'Virtual Workers', icon: 'work', route: '/virtual-workers' },
  { label: 'Profile', icon: 'person', route: '/profile' },
  { label: 'Notifications', icon: 'notifications_active', route: '/notifications' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
];

const defaultBottomNavItems: ResponsiveLayoutMenuItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Pipelines', icon: 'pipe', route: '/pipelines' },
  { label: 'Virtual Workers', icon: 'work', route: '/virtual-workers' },
  { label: 'Profile', icon: 'person', route: '/profile' },
  { label: 'Notifications', icon: 'notifications_active', route: '/notifications' },
];

export const Default: Story = {
  args: {
    title: 'Workix',
    menuItems: defaultMenuItems,
    bottomNavItems: defaultBottomNavItems,
    showNotifications: true,
    showUserMenu: true,
  },
};

export const NoBottomNav: Story = {
  args: {
    ...Default.args,
    bottomNavItems: [],
  },
};

export const NoNotifications: Story = {
  args: {
    ...Default.args,
    showNotifications: false,
  },
};
