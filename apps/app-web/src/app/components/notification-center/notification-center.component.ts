import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  WorkixBadgeComponent,
  WorkixButtonComponent,
  WorkixIconComponent,
  WorkixMenuComponent,
  WorkixMenuItemComponent,
  WorkixNotificationListComponent,
} from '@workix/shared/frontend/ui';

import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    WorkixNotificationListComponent,
    WorkixButtonComponent,
    WorkixIconComponent,
    WorkixMenuComponent,
    WorkixMenuItemComponent,
    WorkixBadgeComponent,
    RouterLink,
  ],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent {
  private notificationService = inject(NotificationService);

  // Signals from service
  notifications = computed(() => this.notificationService.recentNotifications());
  unreadCount = computed(() => this.notificationService.unreadCount());
  isConnected = computed(() => this.notificationService.isConnected());

  // Track index for template
  $index = signal(0);

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id);
  }

  deleteAllNotifications(): void {
    this.notificationService.deleteAllNotifications();
  }

  getTypeColor(type: string): string {
    return this.notificationService.getTypeColor(type);
  }

  getTypeIcon(type: string): string {
    return this.notificationService.getTypeIcon(type);
  }
}
