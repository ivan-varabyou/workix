import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientLayoutUserMenu, WorkixClientLayoutComponent } from '@workix/shared/frontend/ui';

import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WorkixClientLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = signal('Workix');
  isDarkMode = signal(false);
  user = signal<any>(null);

  // Computed signals
  isAuthenticated = computed(() => !!this.user());
  themeIcon = computed(() => (this.isDarkMode() ? 'light_mode' : 'dark_mode'));

  // User menu
  userMenu = signal<ClientLayoutUserMenu>({
    items: [
      { label: 'Profile', icon: 'person', routerLink: '/profile' },
      { label: 'Settings', icon: 'settings', routerLink: '/settings' },
      { label: 'Logout', icon: 'logout', action: () => this.logout() },
    ],
  });

  constructor(private themeService: ThemeService, private authService: AuthService) {
    this.isDarkMode.set(this.themeService.isDarkMode());
    this.user.set(this.authService.getCurrentUser());
  }

  toggleDarkMode(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    this.themeService.setDarkMode(newMode);
  }

  logout(): void {
    this.authService.logout();
    this.user.set(null);
  }
}
