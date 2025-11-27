/**
 * Types for Dashboard component
 */

export interface DashboardStat {
  title: string;
  value: number | string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export interface DashboardConfig {
  title?: string;
  stats: DashboardStat[];
  activities?: DashboardActivity[];
  showActivities?: boolean;
  activitiesTitle?: string;
  gridCols?: {
    xs?: number;
    sm?: number;
    md?: number;
  };
}
