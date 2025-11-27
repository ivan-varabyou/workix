import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WorkixBadgeComponent } from '../badge/badge.component';
import { WorkixButtonComponent } from '../button/button.component';
import { WorkixCardComponent } from '../card/card.component';
import { WorkixChipComponent } from '../chip/chip.component';
import { WorkixDividerComponent } from '../divider/divider.component';
import { WorkixIconComponent } from '../icon/icon.component';
import { WorkixListComponent } from '../list/list.component';
import { WorkixListItemComponent } from '../list/list-item.component';
import { WorkixPaginatorComponent } from '../paginator/paginator.component';
import { WorkixSpinnerComponent } from '../spinner/spinner.component';
import { Notification, NotificationListConfig } from './notification-list.component.types';

/**
 * Workix NotificationList Component
 *
 * Generic component for notification lists with filtering and pagination.
 * Replaces notifications.component, notification-center.component, etc.
 *
 * Usage:
 * ```html
 * <workix-notification-list
 *   [notifications]="notifications()"
 *   [config]="notificationConfig"
 *   [isLoading]="isLoading()"
 *   (markAsRead)="onMarkAsRead($event)"
 *   (delete)="onDelete($event)"
 *   (actionClick)="onActionClick($event)"
 * />
 * ```
 */
@Component({
  selector: 'workix-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    WorkixCardComponent,
    WorkixListComponent,
    WorkixListItemComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixBadgeComponent,
    WorkixChipComponent,
    WorkixDividerComponent,
    WorkixPaginatorComponent,
    WorkixSpinnerComponent,
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
})
export class WorkixNotificationListComponent {
  // Required inputs
  notifications = input.required<Notification[]>();
  config = input<NotificationListConfig>({});

  // Optional inputs
  isLoading = input<boolean>(false);
  errorMessage = input<string | null>(null);

  // Internal state
  filterType = signal<string>('all');
  pageIndex = signal(0);
  pageSize = signal(10);

  // Outputs
  markAsRead = output<string>();
  markAllAsRead = output<void>();
  delete = output<string>();
  clearAll = output<void>();
  actionClick = output<{ notification: Notification; action: string }>();
  filterChange = output<string>();
  pageChange = output<{ pageIndex: number; pageSize: number }>();

  // Computed
  unreadCount = computed(() => {
    return this.notifications().filter((n) => !n.read).length;
  });

  filteredNotifications = computed(() => {
    const notifications = this.notifications();
    const filter = this.filterType();

    if (filter === 'all') {
      return notifications;
    }
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications.filter((n) => n.type === filter);
  });

  paginatedNotifications = computed(() => {
    const filtered = this.filteredNotifications();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  // Helper methods
  getTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      info: '#2196f3',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    };
    return colorMap[type] || '#2196f3';
  }

  getTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
    };
    return iconMap[type] || 'info';
  }

  onFilterChange(filter: string): void {
    this.filterType.set(filter);
    this.pageIndex.set(0);
    this.filterChange.emit(filter);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }

  onMarkAsRead(id: string): void {
    this.markAsRead.emit(id);
  }

  onMarkAllAsRead(): void {
    this.markAllAsRead.emit();
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  onActionClick(notification: Notification, action: string): void {
    this.actionClick.emit({ notification, action });
  }
}
