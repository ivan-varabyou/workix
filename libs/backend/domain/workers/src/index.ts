// Main Service
export * from './services/virtual-worker.service';
export * from './services/worker-framework.service';

// Types and Interfaces
export type {
  Task,
  TaskPayload,
  TaskPayloadValue,
  TaskResult,
  TaskResultValue,
  WorkerConfig,
  WorkerInstance,
  WorkerListItem,
  WorkerMetrics,
  WorkerStatus,
  WorkerType,
} from './interfaces/worker.interface';
export { WorkerState } from './interfaces/worker.interface';
export type {
  WorkerContext,
  WorkerInput,
  WorkerOutput,
} from './interfaces/worker-framework.interface';
export type { Worker } from './services/worker-framework.service';
