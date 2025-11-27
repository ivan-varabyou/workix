import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkixResponsiveLayoutComponent } from '@workix/shared/frontend/ui';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-responsive-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WorkixResponsiveLayoutComponent],
  templateUrl: './responsive-layout.component.html',
  styleUrls: ['./responsive-layout.component.scss'],
})
export class ResponsiveLayoutComponent implements OnInit, OnDestroy {
  private resizeSubscription?: Subscription;

  // Signals
  isMobile = signal(false);
  isTablet = signal(false);
  sidenavOpened = signal(false);

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
    const checkMobile = (): void => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      this.isMobile.set(isMobile);
      this.isTablet.set(isTablet);
      this.sidenavOpened.set(!isMobile);
    };

    checkMobile();
    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      checkMobile();
    });
  }
}
