/**
 * Types for ConfirmDialog component
 */

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  cancelVariant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  showCancel?: boolean;
  width?: string;
  height?: string;
}
