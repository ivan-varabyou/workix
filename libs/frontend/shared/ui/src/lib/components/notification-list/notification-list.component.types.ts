/**
 * Types for NotificationList component
 */

export interface NotificationAction {
  label: string;
  url?: string;
  onClick?: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date | string;
  icon?: string;
  action?: NotificationAction;
}

export interface NotificationListConfig {
  title?: string;
  showFilters?: boolean;
  showPagination?: boolean;
  showMarkAllAsRead?: boolean;
  showClearAll?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  emptyIcon?: string;
  filters?: Array<{
    label: string;
    value: string;
    count?: number;
  }>;
}
