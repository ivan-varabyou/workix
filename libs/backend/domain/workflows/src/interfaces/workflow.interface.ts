// Workflow interfaces

export type WorkflowStepType = 'action' | 'condition' | 'loop' | 'parallel';

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export type WorkflowTriggerType = 'webhook' | 'schedule' | 'event' | 'manual';

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: WorkflowStepConfig;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
}

export interface WorkflowStepConfig {
  actionType?: 'http' | 'database' | 'email' | 'transform';
  condition?: string;
  thenSteps?: WorkflowStep[];
  elseSteps?: WorkflowStep[];
  items?: string | WorkflowContext;
  steps?: WorkflowStep[];
  outputVar?: string;
  [key: string]: string | number | boolean | WorkflowStep[] | WorkflowContext | undefined;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  result: WorkflowContext;
  error?: string;
}

export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  type: WorkflowTriggerType;
  config: WorkflowTriggerConfig;
}

export interface WorkflowTriggerConfig {
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | Record<string, string | number | boolean>
    | null
    | undefined;
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
