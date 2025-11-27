import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  AdminLayoutMenuItem,
  AdminLayoutUserMenu,
  WorkixAdminLayoutComponent,
} from '@workix/shared/frontend/ui';

import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WorkixAdminLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // Services
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  title = signal('Workix Admin Dashboard');
  isDarkMode = signal(false);
  isAuthenticated = signal(false);

  // Computed
  themeIcon = computed(() => (this.isDarkMode() ? 'light_mode' : 'dark_mode'));
  appTheme = computed(() => (this.isDarkMode() ? 'dark' : 'light'));

  // Menu items
  menuItems = signal<AdminLayoutMenuItem[]>([
    { label: 'Dashboard', icon: 'dashboard', routerLink: '/dashboard' },
    { label: 'Users', icon: 'people', routerLink: '/users' },
    { label: 'Roles & Permissions', icon: 'security', routerLink: '/roles' },
    { label: 'Analytics', icon: 'analytics', routerLink: '/analytics' },
    { label: 'Integrations', icon: 'link', routerLink: '/integrations' },
    { label: 'Pipelines', icon: 'pipeline', routerLink: '/pipelines' },
    { label: 'Audit Logs', icon: 'history', routerLink: '/audit-logs' },
    { label: 'Settings', icon: 'settings', routerLink: '/settings' },
  ]);

  // User menu
  userMenu = signal<AdminLayoutUserMenu>({
    items: [
      { label: 'Profile', icon: 'person', routerLink: '/profile' },
      { label: 'Settings', icon: 'settings', routerLink: '/settings' },
      { label: 'Logout', icon: 'logout', action: () => this.logout() },
    ],
  });

  constructor() {
    this.isDarkMode.set(this.themeService.isDarkMode());
    this.isAuthenticated.set(this.authService.isAuthenticated());
  }

  toggleDarkMode(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    this.themeService.setDarkMode(newMode);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
