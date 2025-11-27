import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';

import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCardComponent } from '../card/card.component';
import { WorkixChipComponent } from '../chip/chip.component';
import { WorkixDividerComponent } from '../divider/divider.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixListComponent } from '../list/list.component';
import { WorkixListItemComponent } from '../list/list-item.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import { WorkixTabsComponent } from '../tabs/tabs.component';
import { MonitorConfig, MonitorExecution } from './monitor.component.types';

/**
 * Workix Monitor Component
 *
 * Generic component for monitoring processes with execution history and stats.
 * Replaces pipeline-monitor, integration-analytics, etc.
 *
 * Usage:
 * ```html
 * <workix-monitor
 *   [currentExecution]="currentExecution()"
 *   [executions]="executions()"
 *   [config]="monitorConfig"
 *   [isLoading]="isLoading()"
 *   (actionClick)="onActionClick($event)"
 *   (executionClick)="onExecutionClick($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-monitor',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    WorkixCardComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixChipComponent,
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixTabsComponent,
    WorkixSpinnerComponent,
    WorkixDividerComponent,
  ],
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss'],
})
export class WorkixMonitorComponent {
  // Required inputs
  config = input.required<MonitorConfig>();

  // Optional inputs
  currentExecution = input<MonitorExecution | null>(null);
  executions = input<MonitorExecution[]>([]);
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Internal state
  activeTab = signal<number>(0);

  // Outputs
  actionClick = output<{ action: string; data?: Record<string, unknown> }>();
  executionClick = output<MonitorExecution>();
  tabChange = output<number>();

  // Computed
  executionProgress = computed(() => {
    const exec = this.currentExecution();
    return exec?.progress || 0;
  });

  executionDuration = computed(() => {
    const exec = this.currentExecution();
    if (!exec) return '0s';

    if (exec.duration) {
      return `${exec.duration}s`;
    }

    const startTime =
      typeof exec.startTime === 'string' ? new Date(exec.startTime) : exec.startTime;
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return `${elapsed}s`;
  });

  // Helper methods
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      running: '#ff9800',
      success: '#4caf50',
      failed: '#f44336',
      pending: '#9e9e9e',
      cancelled: '#757575',
    };
    return colorMap[status] || '#9e9e9e';
  }

  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      running: 'schedule',
      success: 'check_circle',
      failed: 'cancel',
      pending: 'pending_actions',
      cancelled: 'cancel',
    };
    return iconMap[status] || 'info';
  }

  onActionClick(action: string, data?: Record<string, unknown>): void {
    const eventData: { action: string; data?: Record<string, unknown> } = { action };
    if (data !== undefined) {
      eventData.data = data;
    }
    this.actionClick.emit(eventData);
  }

  onExecutionClick(execution: MonitorExecution): void {
    this.executionClick.emit(execution);
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    this.tabChange.emit(index);
  }
}
