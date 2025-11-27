/**
 * Worker Entity
 * Represents a virtual worker in the system
 */
export class WorkerEntity {
  id!: string;
  name!: string;
  type!: string;
  state!: string;
  config!: {
    name: string;
    type: string;
    maxConcurrentTasks: number;
    retryAttempts: number;
    timeout: number;
    customPrompt?: string;
  };
  metrics!: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    averageExecutionTime: number;
  };
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<WorkerEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if worker is idle
   */
  isIdle(): boolean {
    return this.state === 'idle';
  }

  /**
   * Check if worker is working
   */
  isWorking(): boolean {
    return this.state === 'working';
  }

  /**
   * Check if worker is available for new tasks
   */
  isAvailable(): boolean {
    return this.isIdle() && this.metrics.totalTasks < this.config.maxConcurrentTasks;
  }
}
