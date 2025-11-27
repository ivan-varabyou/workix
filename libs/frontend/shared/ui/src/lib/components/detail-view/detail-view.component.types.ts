/**
 * Types for DetailView component
 */

export type DetailViewFieldValue = string | number | boolean | Date | null | undefined;

export interface DetailViewField {
  label: string;
  value: DetailViewFieldValue;
  format?: 'text' | 'date' | 'currency' | 'boolean' | 'custom';
  customFormatter?: (value: DetailViewFieldValue) => string;
  fullWidth?: boolean;
}

export interface DetailViewConfig {
  title: string;
  subtitle?: string;
  fields: DetailViewField[];
  backRoute?: string;
  showBackButton?: boolean;
  actions?: DetailViewAction[];
}

export interface DetailViewAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}
