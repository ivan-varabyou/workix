// Prisma service interfaces for workflows module

import { PrismaClient } from '@prisma/client';

import { Workflow, WorkflowExecution, WorkflowStep } from './workflow.interface';

export interface WorkflowPrismaService extends PrismaClient {
  workflow: {
    create: (args: { data: WorkflowCreateData }) => Promise<Workflow>;
    update: (args: { where: { id: string }; data: WorkflowUpdateData }) => Promise<Workflow>;
    delete: (args: { where: { id: string } }) => Promise<Workflow>;
    findUnique: (args: { where: { id: string } }) => Promise<Workflow | null>;
    findMany: (args?: { where?: { userId?: string } }) => Promise<Workflow[]>;
  };
  workflowExecution: {
    create: (args: { data: WorkflowExecutionCreateData }) => Promise<WorkflowExecution>;
    update: (args: {
      where: { id: string };
      data: WorkflowExecutionUpdateData;
    }) => Promise<WorkflowExecution>;
    findMany: (args?: {
      where?: { workflowId?: string };
      orderBy?: { startedAt?: 'asc' | 'desc' };
      take?: number;
    }) => Promise<WorkflowExecution[]>;
  };
}

export interface WorkflowCreateData {
  userId: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers?: string[];
  enabled?: boolean;
}

export interface WorkflowUpdateData {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  triggers?: string[];
  enabled?: boolean;
}

export interface WorkflowExecutionCreateData {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  result?: WorkflowContext;
}

export interface WorkflowExecutionUpdateData {
  status?: 'pending' | 'running' | 'completed' | 'failed';
  completedAt?: Date;
  result?: WorkflowContext;
  error?: string | null;
}

export type WorkflowContextValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | Record<string, string | number | boolean>
  | null
  | undefined;
export type WorkflowContext = Record<
  string,
  WorkflowContextValue | Record<string, WorkflowContextValue>
>;
