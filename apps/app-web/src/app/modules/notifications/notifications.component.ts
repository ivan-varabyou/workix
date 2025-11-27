import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  Notification,
  NotificationListConfig,
  WorkixNotificationListComponent,
} from '@workix/shared/frontend/ui';

import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, WorkixNotificationListComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);

  // Signals
  filterType = signal<'all' | 'unread' | 'success' | 'error'>('all');
  pageIndex = signal(0);
  pageSize = signal(10);

  // Computed
  allNotifications = computed(() => this.notificationService.notifications());
  unreadCount = computed(() => this.notificationService.unreadCount());

  // Computed: Build notification list config
  notificationListConfig = computed<NotificationListConfig>(() => {
    const allNotifications = this.allNotifications();
    const unreadCount = this.unreadCount();

    return {
      title: 'Notifications',
      showFilters: true,
      showPagination: true,
      showMarkAllAsRead: unreadCount > 0,
      showClearAll: allNotifications.length > 0,
      pageSize: this.pageSize(),
      pageSizeOptions: [5, 10, 20],
      emptyMessage: 'No notifications',
      emptyIcon: 'notifications_none',
      filters: [
        { label: 'All', value: 'all', count: allNotifications.length },
        { label: 'Unread', value: 'unread', count: unreadCount },
        {
          label: 'Success',
          value: 'success',
          count: allNotifications.filter((n) => n.type === 'success').length,
        },
        {
          label: 'Error',
          value: 'error',
          count: allNotifications.filter((n) => n.type === 'error').length,
        },
      ],
    };
  });

  // Computed: Convert notifications to Notification format
  notifications = computed<Notification[]>(() => {
    return this.allNotifications().map((n) => {
      const notification: Notification = {
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type as 'info' | 'success' | 'warning' | 'error',
        read: n.read,
        timestamp: n.timestamp,
        icon: this.notificationService.getTypeIcon(n.type),
      };
      if (n.action !== undefined && n.action !== null) {
        const action: {
          label: string;
          url?: string;
          onClick?: () => void;
        } = {
          label: n.action.label,
        };
        if (n.action.url !== undefined) {
          action.url = n.action.url;
        }
        if (n.action.onClick !== undefined) {
          action.onClick = n.action.onClick;
        }
        notification.action = action;
      }
      return notification;
    });
  });

  // Computed: Filter notifications based on filterType
  filteredNotifications = computed<Notification[]>(() => {
    const notifications = this.notifications();
    const filter = this.filterType();

    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'success':
        return notifications.filter((n) => n.type === 'success');
      case 'error':
        return notifications.filter((n) => n.type === 'error');
      default:
        return notifications;
    }
  });

  onFilterChange(filterValue: string): void {
    this.filterType.set(filterValue as 'all' | 'unread' | 'success' | 'error');
    this.pageIndex.set(0);
  }

  onPageChange(page: number, pageSize: number): void {
    this.pageIndex.set(page);
    this.pageSize.set(pageSize);
  }

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  onDeleteNotification(id: string): void {
    this.notificationService.deleteNotification(id);
  }

  onClearAll(): void {
    this.notificationService.deleteAllNotifications();
  }
}
