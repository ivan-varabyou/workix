/**
 * Pipeline Graph Types
 * Defines the structure of a pipeline workflow
 */

export type NodeType =
  | 'start'
  | 'end'
  | 'llm'
  | 'action'
  | 'condition'
  | 'parallel'
  | 'webhook'
  | 'dataSource'
  | 'transform'
  | 'worker'
  | 'decision';
export type ActionType =
  | 'http'
  | 'send_email'
  | 'create_record'
  | 'update_record'
  | 'delay'
  | 'transform';

export interface PipelineNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;

  // For LLM nodes
  model?: string;
  prompt?: string;
  promptTemplate?: string; // For LLM nodes with template
  temperature?: number;
  maxTokens?: number;
  variables?: Record<string, any>; // For LLM nodes with variables

  // For action nodes
  actionType?: ActionType;
  config?: Record<string, any>;

  // For condition nodes
  condition?: string;
  decisionConfig?: Record<string, any>; // For decision nodes
  decisionType?: string; // For decision nodes

  // For dataSource nodes
  dataSourceConfig?: Record<string, any>; // For dataSource nodes
  dataSourceType?: string; // For dataSource nodes

  // For transform nodes
  transformConfig?: Record<string, any>; // For transform nodes
  transformType?: string; // For transform nodes

  // For worker nodes
  workerConfig?: Record<string, any>; // For worker nodes
  workerType?: string; // For worker nodes

  // Metadata
  position?: { x: number; y: number };
  color?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, string>;
}

export interface PipelineEdge {
  from: string;
  to: string;
  label?: string;
  condition?: string; // For conditional edges
}

export interface PipelineGraphConfig {
  version: string;
  name: string;
  description?: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  variables?: Record<string, any>;
  settings?: {
    timeout?: number;
    retryCount?: number;
    parallelism?: number;
  };
}

export interface PipelineExecutionContext {
  pipelineId: string;
  executionId: string;
  userId: string;
  startedAt: Date;
  variables: Record<string, any>;
  nodeResults: Map<string, any>;
}
