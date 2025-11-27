import { WorkerState, WorkerType } from '@workix/backend/domain/workers';

const VALID_WORKER_TYPES: readonly WorkerType[] = [
  'marketer',
  'designer',
  'copywriter',
  'developer',
  'analyst',
  'custom',
];

export function isValidWorkerType(value: string): value is WorkerType {
  // Check if value is in VALID_WORKER_TYPES without type assertion
  for (const validType of VALID_WORKER_TYPES) {
    if (value === validType) {
      return true;
    }
  }
  return false;
}

export function isValidWorkerState(value: string): value is WorkerState {
  const validStates: readonly WorkerState[] = [
    WorkerState.IDLE,
    WorkerState.WORKING,
    WorkerState.PAUSED,
    WorkerState.FAILED,
    WorkerState.COMPLETED,
  ];
  // Check if value is in validStates without type assertion
  for (const validState of validStates) {
    if (value === validState) {
      return true;
    }
  }
  return false;
}
