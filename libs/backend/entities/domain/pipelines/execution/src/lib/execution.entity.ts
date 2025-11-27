/**
 * Execution Entity
 * Represents a pipeline execution in the system
 */
export class ExecutionEntity {
  id!: string;
  pipelineId!: string;
  userId!: string;
  inputs!: Record<string, unknown>;
  outputs!: Record<string, unknown>;
  stepResults!: Record<string, unknown>;
  status!: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  error?: string | null;
  errorMessage?: string | null;
  stepsExecuted!: number;
  stepsFailed!: number;
  startedAt!: Date;
  completedAt?: Date | null;
  durationMs?: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<ExecutionEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if execution is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if execution failed
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * Check if execution is running
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Get execution duration in milliseconds
   */
  getDuration(): number | null {
    if (this.durationMs !== null && this.durationMs !== undefined) {
      return this.durationMs;
    }
    if (this.completedAt && this.startedAt) {
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
    return null;
  }
}
