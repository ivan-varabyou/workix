/**
 * Types for Monitor component
 */

export interface MonitorExecution {
  id: string;
  status: 'running' | 'success' | 'failed' | 'pending' | 'cancelled';
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number;
  progress: number;
  stepsCompleted: number;
  totalSteps: number;
  metadata?: Record<string, unknown>;
}

export interface MonitorStat {
  label: string;
  value: string | number;
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
}

export interface MonitorTab {
  label: string;
  icon?: string;
  content: 'history' | 'performance' | 'logs' | 'custom';
  customContent?: Record<string, unknown>;
}

export interface MonitorConfig {
  title: string;
  showCurrentExecution?: boolean;
  showTabs?: boolean;
  tabs?: MonitorTab[];
  showStats?: boolean;
  stats?: MonitorStat[];
  actions?: Array<{
    label: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
    onClick: () => void;
  }>;
}
