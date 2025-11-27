/**
 * Types for PipelineBuilder component
 */

export type PipelineStepType =
  | 'http'
  | 'database'
  | 'transform'
  | 'conditional'
  | 'loop'
  | 'script'
  | 'email'
  | 'webhook'
  | 'delay';

export interface PipelineStep {
  id: string;
  name: string;
  type: PipelineStepType;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  order?: number;
}

export interface PipelineBuilderConfig {
  title?: string;
  showToolbar?: boolean;
  showStepsList?: boolean;
  showStepEditor?: boolean;
  stepTypes?: Array<{ value: string; label: string; icon: string }>;
  initialData?: {
    name?: string;
    description?: string;
    steps?: PipelineStep[];
  };
}
