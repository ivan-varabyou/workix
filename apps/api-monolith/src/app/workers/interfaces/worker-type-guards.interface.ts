/**
 * Worker Type Guards
 * Правильные type guards без использования as утверждений
 */

import { WorkerState, WorkerType } from '@workix/domain/workers';

/**
 * Список всех допустимых типов worker'ов
 */
const VALID_WORKER_TYPES: readonly WorkerType[] = [
  'marketer',
  'designer',
  'copywriter',
  'developer',
  'analyst',
  'custom',
] as const;

/**
 * Type guard для проверки, что значение является WorkerType
 */
export function isValidWorkerType(value: string): value is WorkerType {
  return VALID_WORKER_TYPES.includes(value as WorkerType);
}

/**
 * Type guard для проверки, что значение является WorkerState
 */
export function isValidWorkerState(value: string): value is WorkerState {
  const validStates: readonly WorkerState[] = [
    WorkerState.IDLE,
    WorkerState.WORKING,
    WorkerState.PAUSED,
    WorkerState.FAILED,
    WorkerState.COMPLETED,
  ];
  return validStates.includes(value as WorkerState);
}
