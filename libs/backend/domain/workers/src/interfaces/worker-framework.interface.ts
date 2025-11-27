// Worker framework interfaces

export type WorkerInput = Record<
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

export type WorkerOutput = Record<
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

export type WorkerContext = Record<
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

export interface Worker {
  id: string;
  name: string;
  type: string;
  version: string;
  description?: string;
  capabilities: string[];
  execute: (input: WorkerInput, context?: WorkerContext) => Promise<WorkerOutput>;
  validate?: (input: WorkerInput) => boolean;
  healthCheck?: () => Promise<boolean>;
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
