import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixDividerComponent } from '../divider/divider.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixListComponent } from '../list/list.component';
import { WorkixListItemComponent } from '../list/list-item.component';
import {
  WorkixSidenavComponent,
  WorkixSidenavContainerComponent,
  WorkixSidenavContentComponent,
} from '../sidenav/sidenav.component';
import { WorkixToolbarComponent } from '../toolbar/toolbar.component';
import { ResponsiveLayoutMenuItem } from './responsive-layout.component.types';

@Component({
  selector: 'workix-responsive-layout',
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
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixDividerComponent,
    WorkixButtonComponent,
  ],
  templateUrl: './responsive-layout.component.html',
  styleUrls: ['./responsive-layout.component.scss'],
})
export class WorkixResponsiveLayoutComponent implements OnInit, OnDestroy {
  private resizeSubscription?: Subscription;

  // Inputs
  title = input<string>('Workix');
  menuItems = input<ResponsiveLayoutMenuItem[]>([]);
  bottomNavItems = input<ResponsiveLayoutMenuItem[]>([]);
  showNotifications = input<boolean>(true);
  showUserMenu = input<boolean>(true);

  // Outputs
  logout = output<void>();
  notificationsClick = output<void>();
  userMenuClick = output<void>();

  // Internal state
  isMobile = signal(false);
  sidenavOpened = signal(false);

  // Template references
  sidenav = viewChild<WorkixSidenavComponent>('sidenav');

  // Computed
  sidenavMode = computed(() => (this.isMobile() ? ('over' as const) : ('side' as const)));

  constructor() {
    this.setupResponsive();
  }

  ngOnInit(): void {
    this.sidenavOpened.set(!this.isMobile());
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }

  private setupResponsive(): void {
    // Use window resize event instead of BreakpointObserver
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      this.isMobile.set(isMobile);
      this.sidenavOpened.set(!isMobile);
    };

    checkMobile();
    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      checkMobile();
    });
  }
}
