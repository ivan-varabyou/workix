import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { WorkixCardComponent } from '../card/card.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import { DashboardActivity, DashboardConfig, DashboardStat } from './dashboard.component.types';

/**
 * Workix Dashboard Component
 *
 * Generic component for dashboards with stats and activities.
 * Replaces dashboard.component, analytics.component, etc.
 *
 * Usage:
 * ```html
 * <workix-dashboard
 *   [config]="dashboardConfig"
 *   [isLoading]="isLoading()"
 *   (statClick)="onStatClick($event)"
 *   (activityClick)="onActivityClick($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    WorkixCardComponent,
    WorkixIconComponent,
    WorkixSpinnerComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class WorkixDashboardComponent {
  // Required inputs
  config = input.required<DashboardConfig>();

  // Optional inputs
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Outputs
  statClick = output<DashboardStat>();
  activityClick = output<DashboardActivity>();

  // Computed: Responsive grid columns
  gridCols = computed(() => {
    const config = this.config();
    const cols = config.gridCols || {};

    // Default responsive breakpoints
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1920) return cols.md || 4;
      if (width >= 1024) return cols.md || 3;
      if (width >= 640) return cols.sm || 2;
      return cols.xs || 1;
    }

    return cols.md || 3;
  });

  onStatClick(stat: DashboardStat): void {
    if (stat.onClick) {
      stat.onClick();
    }
    this.statClick.emit(stat);
  }

  onActivityClick(activity: DashboardActivity): void {
    if (activity.onClick) {
      activity.onClick();
    }
    this.activityClick.emit(activity);
  }
}
