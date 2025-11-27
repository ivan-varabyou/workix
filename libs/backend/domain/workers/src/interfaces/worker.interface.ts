// Worker interfaces

export enum WorkerState {
  IDLE = 'idle',
  WORKING = 'working',
  PAUSED = 'paused',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export type WorkerType =
  | 'marketer'
  | 'designer'
  | 'copywriter'
  | 'developer'
  | 'analyst'
  | 'custom';

export interface WorkerConfig {
  name: string;
  type: WorkerType;
  maxConcurrentTasks: number;
  retryAttempts: number;
  timeout: number;
  customPrompt?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Task {
  id: string;
  type: string;
  priority: number;
  payload: TaskPayload;
  status: TaskStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: TaskResult;
}

export type TaskPayloadValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | Record<string, string | number | boolean>
  | null
  | undefined;
export type TaskPayload = Record<string, TaskPayloadValue | Record<string, TaskPayloadValue>>;

export type TaskResultValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | Record<string, string | number | boolean>
  | null
  | undefined;
export type TaskResult = Record<string, TaskResultValue | Record<string, TaskResultValue>>;

export interface WorkerInstance {
  id: string;
  name: string;
  type: WorkerType;
  state: WorkerState;
  currentTasks: number;
  totalTasksCompleted: number;
  failedTasks?: number;
  successRate: number;
  averageExecutionTime: number;
  createdAt: Date;
  updatedAt: Date;
  maxConcurrentTasks: number;
  retryAttempts: number;
  timeout: number;
  customPrompt?: string;
  config?: WorkerConfig;
}

export interface WorkerStatus {
  id: string;
  name: string;
  type: WorkerType;
  state: WorkerState;
  currentTasks: number;
  queuedTasks: number;
  totalTasksCompleted: number;
  successRate: number;
  averageExecutionTime: number;
}

export interface WorkerListItem {
  id: string;
  name: string;
  type: WorkerType;
  state: WorkerState;
  currentTasks: number;
  totalTasksCompleted: number;
}

export interface WorkerMetrics {
  total: number;
  completed: number;
  failed: number;
  successRate: number;
  averageExecutionTime: number;
}
