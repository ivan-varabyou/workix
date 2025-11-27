// Workflow DTO interfaces

import { WorkflowContext, WorkflowStep } from './workflow.interface';

export interface CreateWorkflowDto {
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers?: string[];
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  triggers?: string[];
  enabled?: boolean;
}

export interface ExecuteWorkflowDto {
  input?: WorkflowContext;
}
