// Worker template interfaces

export type WorkerTemplateDomain = 'content' | 'ecommerce' | 'support' | 'marketing' | 'analytics';

export interface WorkerTemplate {
  id: string;
  name: string;
  domain: WorkerTemplateDomain;
  description: string;
  capabilities: string[];
  config: WorkerTemplateConfig;
  prompt?: string;
  metadata?: Record<
    string,
    | string
    | number
    | boolean
    | Date
    | string[]
    | number[]
    | Record<string, string | number | boolean>
    | null
    | undefined
  >;
}

export interface WorkerTemplateConfig {
  type?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: string | number | boolean | undefined;
}
