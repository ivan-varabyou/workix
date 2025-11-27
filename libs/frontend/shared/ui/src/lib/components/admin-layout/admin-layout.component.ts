import { CommonModule } from '@angular/common';
import { Component, computed, input, output, viewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import { WorkixDividerComponent } from '../divider/divider.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixListComponent } from '../list/list.component';
import { WorkixListItemComponent } from '../list/list-item.component';
import { WorkixMenuComponent } from '../menu/menu.component';
import { WorkixMenuItemComponent } from '../menu/menu-item.component';
import {
  WorkixSidenavComponent,
  WorkixSidenavContainerComponent,
  WorkixSidenavContentComponent,
} from '../sidenav/sidenav.component';
import { WorkixToolbarComponent } from '../toolbar/toolbar.component';
import { AdminLayoutMenuItem, AdminLayoutUserMenu } from './admin-layout.component.types';

@Component({
  selector: 'workix-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    WorkixToolbarComponent,
    WorkixSidenavContainerComponent,
    WorkixSidenavComponent,
    WorkixSidenavContentComponent,
    WorkixIconComponent,
    WorkixMenuComponent,
    WorkixMenuItemComponent,
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixDividerComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class WorkixAdminLayoutComponent {
  // Inputs
  title = input<string>('Workix Admin Dashboard');
  isDarkMode = input<boolean>(false);
  isAuthenticated = input<boolean>(false);
  menuItems = input<AdminLayoutMenuItem[]>([]);
  userMenu = input<AdminLayoutUserMenu | null>(null);

  // Outputs
  darkModeToggled = output<boolean>();
  toggleDarkModeOutput = output<void>();
  logout = output<void>();

  // Template references
  sidenav = viewChild.required<WorkixSidenavComponent>('sidenav');

  // Computed
  themeIcon = computed(() => (this.isDarkMode() ? 'light_mode' : 'dark_mode'));

  onToggleDarkMode(): void {
    const newMode = !this.isDarkMode();
    this.darkModeToggled.emit(newMode);
    this.toggleDarkModeOutput.emit();
  }

  toggleSidenav(): void {
    this.sidenav()?.toggle();
  }

  onLogout(): void {
    this.logout.emit();
  }
}
