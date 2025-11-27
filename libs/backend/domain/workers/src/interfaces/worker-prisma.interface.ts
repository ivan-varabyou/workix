// Prisma service interfaces for workers module

import { PrismaClient } from '@prisma/client';

import { TaskStatus, WorkerConfig } from './worker.interface';

export type WorkerPrismaService = PrismaClient & {
  virtualWorker: {
    create: (args: { data: VirtualWorkerCreateData }) => Promise<VirtualWorker>;
    update: (args: {
      where: { id: string };
      data: VirtualWorkerUpdateData;
    }) => Promise<VirtualWorker>;
    delete: (args: { where: { id: string } }) => Promise<VirtualWorker>;
    findUnique: (args: { where: { id: string } }) => Promise<VirtualWorker | null>;
    findMany: (args?: { where?: { type?: string; state?: string } }) => Promise<VirtualWorker[]>;
  };
  taskExecution: {
    create: (args: { data: TaskExecutionCreateData }) => Promise<TaskExecution>;
    update: (args: {
      where: { id: string };
      data: TaskExecutionUpdateData;
    }) => Promise<TaskExecution>;
    findUnique: (args: { where: { id: string } }) => Promise<TaskExecution | null>;
    findMany: (args?: {
      where?: {
        workerId?: string;
        status?: string;
      };
      orderBy?: {
        createdAt?: 'asc' | 'desc';
      };
    }) => Promise<TaskExecution[]>;
  };
};

export interface VirtualWorker {
  id: string;
  name: string;
  type: string;
  state: string;
  config: WorkerConfig;
  metrics: WorkerMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface VirtualWorkerCreateData {
  id: string;
  name: string;
  type: string;
  state: string;
  config: WorkerConfig;
  metrics: WorkerMetrics;
}

export interface VirtualWorkerUpdateData {
  name?: string;
  state?: string;
  config?: WorkerConfig;
  metrics?: WorkerMetrics;
}

export interface TaskExecution {
  id: string;
  workerId: string;
  taskType: string;
  status: TaskStatus;
  result?: TaskResult;
  error?: string | null;
  executionTime?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskExecutionCreateData {
  id: string;
  workerId: string;
  taskType: string;
  status: TaskStatus;
  result?: TaskResult;
  error?: string | null;
  executionTime?: number | null;
}

export interface TaskExecutionUpdateData {
  status?: TaskStatus;
  result?: TaskResult;
  error?: string | null;
  executionTime?: number | null;
}

export interface WorkerMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageExecutionTime: number;
}

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
