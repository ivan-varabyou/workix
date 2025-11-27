// Pipeline interfaces for admin app

export interface PipelineStep {
  id?: string;
  name: string;
  type: string;
  order: number;
  config?: Record<string, unknown>;
  condition?: string;
}

export interface Pipeline {
  id?: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  status?: 'active' | 'inactive' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'timeout'
  | 'completed';

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: ExecutionStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface ExecutionDetails extends PipelineExecution {
  pipeline?: Pipeline;
  steps?: Array<{
    id: string;
    name: string;
    status: ExecutionStatus;
    output?: Record<string, unknown>;
    error?: string;
    duration?: number;
  }>;
}

export interface CreatePipelineDto {
  name: string;
  description: string;
  steps: PipelineStep[];
  status?: 'active' | 'inactive' | 'draft';
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  steps?: PipelineStep[];
  status?: 'active' | 'inactive' | 'draft';
}
