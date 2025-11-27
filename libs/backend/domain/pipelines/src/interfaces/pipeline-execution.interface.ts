// Pipeline Execution interfaces

import { BasePayload } from '@workix/integrations/core';

/**
 * Pipeline execution input/output types
 */
export type PipelineInput = BasePayload;
export type PipelineOutput = BasePayload | BasePayload[] | string | number | boolean | null;

/**
 * DataSource configuration
 */
export interface DataSourceConfig extends BasePayload {
  type: 'api' | 'database' | 'file';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  table?: string;
  queryString?: string;
  filePath?: string;
  format?: 'json' | 'csv' | 'xml';
}

/**
 * Transform configuration
 */
export interface TransformConfig extends BasePayload {
  type: 'map' | 'filter' | 'aggregate' | 'sort' | 'group';
  mapping?: Record<string, string>;
  filterExpression?: string;
  aggregation?: {
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count';
    field?: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string;
}

/**
 * Worker configuration
 */
export interface WorkerConfig extends BasePayload {
  type: string;
  task?: string;
  params?: BasePayload;
  timeout?: number;
  retries?: number;
}

/**
 * LLM response data (can be various formats)
 */
export interface LLMResponseData {
  content?: string;
  output?: string;
  data?: BasePayload;
  text?: string;
  message?: string;
}

/**
 * Execution Status
 */
export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'timeout';

/**
 * Step Result
 */
export interface StepResult {
  result: BasePayload;
  error?: string;
  timestamp: Date;
}

/**
 * Execution Step Results
 */
export interface ExecutionStepResults {
  [stepId: string]: StepResult;
}

/**
 * Pipeline Execution
 */
export interface PipelineExecution {
  id: string;
  pipelineId: string;
  userId: string;
  inputs: BasePayload;
  outputs: BasePayload;
  stepResults: ExecutionStepResults;
  status: ExecutionStatus;
  error?: string;
  errorMessage?: string;
  stepsExecuted: number;
  stepsFailed: number;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Execution Statistics
 */
export interface ExecutionStats {
  total: number;
  successful: number;
  failed: number;
  avgDuration: number;
}

/**
 * Step Execution Result
 */
export interface StepExecutionResult {
  success: boolean;
  output: BasePayload | null;
  error?: string;
}

/**
 * Pipeline Execution Result
 */
export interface PipelineExecutionResult {
  executionId: string;
  output: BasePayload;
  duration: number;
}

/**
 * Execution Prisma Service interface
 */
export interface ExecutionPrismaService {
  execution: {
    create: (args: {
      data: {
        pipelineId: string;
        userId?: string;
        inputs?: BasePayload | string;
        status: ExecutionStatus;
        outputs?: BasePayload | string;
        stepResults?: ExecutionStepResults;
        stepsExecuted?: number;
        stepsFailed?: number;
        startedAt?: Date;
        input?: string;
        output?: string;
        duration?: number;
        error?: string;
      };
    }) => Promise<PipelineExecution>;
    findUnique: (args: { where: { id: string } }) => Promise<PipelineExecution | null>;
    findMany: (args?: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, string>;
      take?: number;
      skip?: number;
    }) => Promise<PipelineExecution[]>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    update: (args: {
      where: { id: string };
      data: {
        status?: ExecutionStatus;
        error?: string;
        errorMessage?: string;
        completedAt?: Date;
        durationMs?: number;
        duration?: number;
        stepResults?: ExecutionStepResults;
        stepsExecuted?: number;
        stepsFailed?: number;
        outputs?: BasePayload | string;
        output?: string;
      };
    }) => Promise<PipelineExecution>;
  };
}

/**
 * Pipeline entity
 */
export interface Pipeline {
  id: string;
  userId: string;
  name: string;
  description?: string;
  config?: BasePayload;
  tags?: string[];
  category?: string;
  version: number;
  isPublic: boolean;
  isActive: boolean;
  isTemplate: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Pipeline Prisma Service interface
 */
/**
 * Pipeline Step
 */
export interface PipelineStep {
  id: string;
  pipelineId: string;
  name: string;
  type: string;
  order: number;
  config: BasePayload;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Step Result
 */
export interface StepResultEntity {
  id: string;
  executionId: string;
  stepId: string;
  status: 'success' | 'failed';
  output?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Step Prisma Service interface
 */
export interface StepPrismaService {
  step: {
    findUnique: (args: { where: { id: string } }) => Promise<PipelineStep | null>;
    findMany: (args?: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, string>;
    }) => Promise<PipelineStep[]>;
    create: (args: {
      data: {
        pipelineId: string;
        name: string;
        type: string;
        order: number;
        config: BasePayload;
      };
    }) => Promise<PipelineStep>;
    update: (args: { where: { id: string }; data: { order?: number } }) => Promise<PipelineStep>;
    delete: (args: { where: { id: string } }) => Promise<PipelineStep>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
  };
  stepResult: {
    create: (args: {
      data: {
        executionId: string;
        stepId: string;
        status: 'success' | 'failed';
        output?: string;
        error?: string;
      };
    }) => Promise<StepResultEntity>;
    findFirst: (args: {
      where: { stepId: string; executionId: string };
    }) => Promise<StepResultEntity | null>;
  };
}

/**
 * Pipeline with Steps
 */
export interface PipelineWithSteps extends Pipeline {
  steps: PipelineStep[];
}

/**
 * Pipeline with Steps and Executions
 */
export interface PipelineWithDetails extends PipelineWithSteps {
  executions?: PipelineExecution[];
}

/**
 * Create Pipeline Data
 */
export interface CreatePipelineData {
  name: string;
  description?: string;
  steps: CreateStepData[];
}

/**
 * Create Step Data
 */
export interface CreateStepData {
  name: string;
  type: string;
  config?: BasePayload;
}

/**
 * Update Pipeline Data
 */
export interface UpdatePipelineData {
  name?: string;
  description?: string;
}

/**
 * Pipeline List Response
 */
export interface PipelineListResponse {
  pipelines: PipelineWithSteps[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PipelinePrismaService {
  pipeline: {
    create: (args: {
      data: {
        userId: string;
        name: string;
        description?: string;
        config?: BasePayload;
        tags?: string[];
        category?: string;
        version: number;
        isPublic: boolean;
        isActive: boolean;
        isTemplate: boolean;
        executionCount: number;
        status?: string;
        publishedAt?: Date;
        steps?: {
          create: Array<{
            name: string;
            type: string;
            order: number;
            config: BasePayload;
          }>;
        };
      };
      include?: { steps?: boolean };
    }) => Promise<Pipeline | PipelineWithSteps>;
    findUnique: (args: {
      where: { id: string };
      include?: {
        steps?:
          | { orderBy?: { order: string } }
          | { select?: { id: boolean; name: boolean; type: boolean } };
        executions?: { take?: number; orderBy?: { createdAt: string } };
      };
    }) => Promise<Pipeline | PipelineWithSteps | PipelineWithDetails | null>;
    findFirst: (args: { where: Record<string, unknown> }) => Promise<Pipeline | null>;
    findMany: (args?: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, string> | Array<Record<string, string>>;
      take?: number;
      skip?: number;
      include?: { steps?: { select?: { id: boolean; name: boolean; type: boolean } } };
    }) => Promise<Pipeline[] | PipelineWithSteps[]>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    update: (args: {
      where: { id: string };
      data: {
        name?: string;
        description?: string;
        config?: BasePayload;
        tags?: string[];
        category?: string;
        version?: number;
        isPublic?: boolean;
        isActive?: boolean;
        isTemplate?: boolean;
        executionCount?: number;
        lastExecutedAt?: Date;
        deletedAt?: Date | null;
        status?: string;
        publishedAt?: Date;
      };
      include?: { steps?: boolean };
    }) => Promise<Pipeline | PipelineWithSteps>;
    delete: (args: { where: { id: string } }) => Promise<Pipeline>;
  };
  pipelineExecution?: {
    create: (args: {
      data: { pipelineId: string; status: string; input: BasePayload; output?: BasePayload };
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: { status?: string; output?: BasePayload };
    }) => Promise<{ id: string }>;
  };
}
