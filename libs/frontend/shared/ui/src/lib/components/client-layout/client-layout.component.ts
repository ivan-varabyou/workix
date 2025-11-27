import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import { WorkixDividerComponent } from '../divider/divider.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixMenuComponent } from '../menu/menu.component';
import { WorkixMenuItemComponent } from '../menu/menu-item.component';
import { WorkixToolbarComponent } from '../toolbar/toolbar.component';
import { ClientLayoutUserMenu } from './client-layout.component.types';

@Component({
  selector: 'workix-client-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    WorkixToolbarComponent,
    WorkixIconComponent,
    WorkixMenuComponent,
    WorkixMenuItemComponent,
    WorkixDividerComponent,
  ],
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.scss'],
})
export class WorkixClientLayoutComponent {
  // Inputs
  title = input<string>('Workix');
  isDarkMode = input<boolean>(false);
  isAuthenticated = input<boolean>(false);
  userMenu = input<ClientLayoutUserMenu | null>(null);

  // Outputs
  darkModeToggled = output<boolean>();
  toggleDarkMode = output<void>();
  logout = output<void>();

  // Computed
  themeIcon = computed(() => (this.isDarkMode() ? 'light_mode' : 'dark_mode'));

  onToggleDarkMode(): void {
    const newMode = !this.isDarkMode();
    this.darkModeToggled.emit(newMode);
    this.toggleDarkMode.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
