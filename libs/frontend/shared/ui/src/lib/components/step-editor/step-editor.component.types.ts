/**
 * Types for StepEditor component
 */

export interface StepEditorStep {
  id: string;
  name: string;
  type:
    | 'http'
    | 'database'
    | 'transform'
    | 'conditional'
    | 'loop'
    | 'script'
    | 'email'
    | 'webhook'
    | 'delay';
  config: Record<string, any>;
  position?: { x: number; y: number };
  order?: number;
}

export interface StepEditorConfig {
  title?: string;
  showTabs?: boolean;
  showDeleteButton?: boolean;
  stepTypes?: Array<{ value: string; label: string; icon: string }>;
}
