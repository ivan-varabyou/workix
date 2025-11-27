import { computed, Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Signals
  notifications = signal<Notification[]>([]);
  isConnected = signal(false);

  // Computed
  unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  recentNotifications = computed(() => this.notifications().slice(0, 5));

  constructor() {
    this.initializeWebSocket();
    this.loadNotifications();
  }

  private initializeWebSocket(): void {
    if (typeof window === 'undefined') {
      return; // Skip WebSocket on server
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/notifications/ws`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        this.isConnected.set(true);
      };

      ws.onmessage = (event) => {
        const notification = JSON.parse(event.data) as Notification;
        this.addNotification(notification);
      };

      ws.onclose = () => {
        this.isConnected.set(false);
        // Reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected.set(false);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private loadNotifications(): void {
    // Would be replaced with actual API call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Pipeline Executed',
        message: 'Data Processing Pipeline completed successfully',
        type: 'success',
        timestamp: new Date(Date.now() - 600000),
        read: false,
        action: { label: 'View', url: '/pipelines/1' },
      },
      {
        id: '2',
        title: 'Pipeline Failed',
        message: 'Email Pipeline failed at step 3',
        type: 'error',
        timestamp: new Date(Date.now() - 300000),
        read: false,
        action: { label: 'Details', url: '/pipelines/2' },
      },
      {
        id: '3',
        title: 'System Update',
        message: 'New features available',
        type: 'info',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
      },
    ];

    this.notifications.set(mockNotifications);
  }

  addNotification(notification: Notification): void {
    this.notifications.update((n) => [notification, ...n]);

    // Auto-mark as read after 10 seconds
    setTimeout(() => this.markAsRead(notification.id), 10000);
  }

  markAsRead(notificationId: string): void {
    this.notifications.update((notifications) =>
      notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    this.notifications.update((notifications) => notifications.map((n) => ({ ...n, read: true })));
  }

  deleteNotification(notificationId: string): void {
    this.notifications.update((n) =>
      n.filter((notification) => notification.id !== notificationId)
    );
  }

  deleteAllNotifications(): void {
    this.notifications.set([]);
  }

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
}
