import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import {
  Task,
  TaskResult,
  TaskResultValue,
  WorkerConfig,
  WorkerInstance,
  WorkerListItem,
  WorkerMetrics,
  WorkerState,
  WorkerStatus,
  WorkerType,
} from '../interfaces/worker.interface';
import {
  TaskExecutionCreateData,
  WorkerPrismaService,
} from '../interfaces/worker-prisma.interface';

@Injectable()
export class VirtualWorkerService {
  private logger = new Logger(VirtualWorkerService.name);
  private workers: Map<string, WorkerInstance> = new Map();
  private taskQueues: Map<string, Task[]> = new Map();

  constructor(private prisma: WorkerPrismaService) {}

  /**
   * Create new virtual worker
   */
  async createWorker(config: WorkerConfig): Promise<WorkerInstance> {
    const workerId = uuid();
    const worker = {
      id: workerId,
      ...config,
      state: WorkerState.IDLE,
      currentTasks: 0,
      totalTasksCompleted: 0,
      successRate: 0,
      averageExecutionTime: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workers.set(workerId, worker);
    this.taskQueues.set(workerId, []);

    this.logger.log(`Virtual worker created: ${workerId} (${config.type})`);

    // Persist to database
    await this.prisma.virtualWorker.create({
      data: {
        id: workerId,
        name: config.name,
        type: config.type,
        state: WorkerState.IDLE,
        config: config,
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          successRate: 0,
          averageExecutionTime: 0,
        },
      },
    });

    return worker;
  }

  /**
   * Assign task to worker
   */
  async assignTask(workerId: string, task: Task): Promise<Task> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    if (worker.currentTasks >= worker.maxConcurrentTasks) {
      // Add to queue
      const queue = this.taskQueues.get(workerId) || [];
      queue.push(task);
      this.taskQueues.set(workerId, queue);

      this.logger.debug(`Task ${task.id} queued for worker ${workerId}`);
      return task;
    }

    // Execute immediately
    return this.executeTask(workerId, task);
  }

  /**
   * Execute task
   */
  private async executeTask(workerId: string, task: Task): Promise<Task> {
    const worker = this.workers.get(workerId);
    if (!worker) throw new Error(`Worker ${workerId} not found`);

    const startTime = Date.now();
    worker.state = WorkerState.WORKING;
    worker.currentTasks++;
    task.status = 'in_progress';
    task.startedAt = new Date();

    try {
      // Execute based on worker type
      const result = await this.executeByType(worker.type, task, worker);

      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();

      // Update metrics
      const executionTime = Date.now() - startTime;
      worker.totalTasksCompleted++;
      const failedTasksCount: number = worker.failedTasks || 0;
      worker.successRate =
        worker.totalTasksCompleted / (worker.totalTasksCompleted + failedTasksCount || 1);
      worker.averageExecutionTime =
        (worker.averageExecutionTime * (worker.totalTasksCompleted - 1) + executionTime) /
        worker.totalTasksCompleted;

      this.logger.log(`Task ${task.id} completed by worker ${workerId} in ${executionTime}ms`);
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      task.completedAt = new Date();
      worker.failedTasks = (worker.failedTasks || 0) + 1;

      this.logger.error(`Task ${task.id} failed: ${task.error}`);
    }

    worker.currentTasks--;
    if (worker.currentTasks === 0 && this.taskQueues.get(workerId)?.length === 0) {
      worker.state = WorkerState.IDLE;
    }

    // Persist task result
    const createData: TaskExecutionCreateData = {
      id: task.id,
      workerId,
      taskType: task.type,
      status: task.status,
      executionTime: Date.now() - (task.startedAt?.getTime() || 0),
    };
    if (task.result !== undefined) {
      createData.result = task.result;
    }
    if (task.error !== undefined) {
      createData.error = task.error;
    }
    await this.prisma.taskExecution.create({
      data: createData,
    });

    // Process next queued task
    const queue = this.taskQueues.get(workerId);
    if (queue && queue.length > 0) {
      const nextTask: Task | undefined = queue.shift();
      if (nextTask) {
        this.executeTask(workerId, nextTask);
      }
    }

    return task;
  }

  /**
   * Execute task based on worker type
   */
  private async executeByType(
    type: WorkerType,
    task: Task,
    _worker: WorkerInstance
  ): Promise<TaskResult> {
    switch (type) {
      case 'marketer':
        return this.executeMarketerTask(task);
      case 'designer':
        return this.executeDesignerTask(task);
      case 'copywriter':
        return this.executeCopywriterTask(task);
      case 'analyst':
        return this.executeAnalystTask(task);
      default:
        throw new Error(`Unknown worker type: ${type}`);
    }
  }

  private async executeMarketerTask(task: Task): Promise<TaskResult> {
    const action: string | undefined = task.payload.action as string | undefined;
    // Marketer tasks: campaign analysis, audience research, etc
    const processed: TaskResultValue | Record<string, TaskResultValue> = task.payload as
      | TaskResultValue
      | Record<string, TaskResultValue>;
    return { status: 'success', action: action || '', processed };
  }

  private async executeDesignerTask(task: Task): Promise<TaskResult> {
    const action: string | undefined = task.payload.action as string | undefined;
    // Designer tasks: image generation, design review, etc
    const processed: TaskResultValue | Record<string, TaskResultValue> = task.payload as
      | TaskResultValue
      | Record<string, TaskResultValue>;
    return { status: 'success', action: action || '', processed };
  }

  private async executeCopywriterTask(task: Task): Promise<TaskResult> {
    const action: string | undefined = task.payload.action as string | undefined;
    // Copywriter tasks: content generation, editing, etc
    const processed: TaskResultValue | Record<string, TaskResultValue> = task.payload as
      | TaskResultValue
      | Record<string, TaskResultValue>;
    return { status: 'success', action: action || '', processed };
  }

  private async executeAnalystTask(task: Task): Promise<TaskResult> {
    const action: string | undefined = task.payload.action as string | undefined;
    // Analyst tasks: data analysis, report generation, etc
    const processed: TaskResultValue | Record<string, TaskResultValue> = task.payload as
      | TaskResultValue
      | Record<string, TaskResultValue>;
    return { status: 'success', action: action || '', processed };
  }

  /**
   * Get worker status
   */
  async getWorkerStatus(workerId: string): Promise<WorkerStatus> {
    const worker = this.workers.get(workerId);
    if (!worker) throw new Error(`Worker ${workerId} not found`);

    return {
      id: worker.id,
      name: worker.name,
      type: worker.type,
      state: worker.state,
      currentTasks: worker.currentTasks,
      queuedTasks: this.taskQueues.get(workerId)?.length || 0,
      totalTasksCompleted: worker.totalTasksCompleted,
      successRate: worker.successRate,
      averageExecutionTime: worker.averageExecutionTime,
    };
  }

  /**
   * Get all workers
   */
  async getAllWorkers(): Promise<WorkerListItem[]> {
    return Array.from(this.workers.values()).map((w) => ({
      id: w.id,
      name: w.name,
      type: w.type,
      state: w.state,
      currentTasks: w.currentTasks,
      totalTasksCompleted: w.totalTasksCompleted,
    }));
  }

  /**
   * List workers with optional filters
   */
  async listWorkers(type?: WorkerType, state?: WorkerState): Promise<WorkerListItem[]> {
    let workers = Array.from(this.workers.values());
    if (type) {
      workers = workers.filter((w) => w.type === type);
    }
    if (state) {
      workers = workers.filter((w) => w.state === state);
    }
    return workers.map((w) => ({
      id: w.id,
      name: w.name,
      type: w.type,
      state: w.state,
      currentTasks: w.currentTasks,
      totalTasksCompleted: w.totalTasksCompleted,
    }));
  }

  /**
   * Get worker by ID
   */
  async getWorker(workerId: string): Promise<WorkerInstance & { queuedTasks: number }> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }
    return {
      ...worker,
      queuedTasks: this.taskQueues.get(workerId)?.length || 0,
    };
  }

  /**
   * Update worker configuration
   */
  async updateWorker(workerId: string, config: Partial<WorkerConfig>): Promise<WorkerInstance> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    Object.assign(worker, config);
    worker.updatedAt = new Date();

    const updatedConfig: WorkerConfig = {
      name: config.name || worker.name,
      type: config.type || worker.type,
      maxConcurrentTasks: config.maxConcurrentTasks ?? worker.maxConcurrentTasks,
      retryAttempts: config.retryAttempts ?? worker.retryAttempts,
      timeout: config.timeout ?? worker.timeout,
    };
    const customPromptValue = config.customPrompt ?? worker.customPrompt;
    if (customPromptValue !== undefined) {
      updatedConfig.customPrompt = customPromptValue;
    }

    await this.prisma.virtualWorker.update({
      where: { id: workerId },
      data: {
        name: updatedConfig.name,
        config: updatedConfig,
      },
    });

    return worker;
  }

  /**
   * Get worker tasks
   */
  async getWorkerTasks(workerId: string, status?: string): Promise<Task[]> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    const tasks = await this.prisma.taskExecution.findMany({
      where: {
        workerId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((t) => {
      const task: Task = {
        id: t.id,
        type: t.taskType,
        status: t.status,
        createdAt: t.createdAt,
        payload: {},
        priority: 0,
      };
      if (t.result !== undefined) {
        task.result = t.result;
      }
      if (t.error !== undefined && t.error !== null) {
        task.error = t.error;
      }
      if (t.createdAt) {
        task.startedAt = t.createdAt;
      }
      if (t.updatedAt) {
        task.completedAt = t.updatedAt;
      }
      return task;
    });
  }

  /**
   * Get task by ID
   */
  async getTask(workerId: string, taskId: string): Promise<Task> {
    const task = await this.prisma.taskExecution.findUnique({
      where: { id: taskId },
    });

    if (!task || task.workerId !== workerId) {
      throw new Error(`Task ${taskId} not found for worker ${workerId}`);
    }

    const taskResult: Task = {
      id: task.id,
      type: task.taskType,
      status: task.status,
      createdAt: task.createdAt,
      payload: {},
      priority: 0,
    };
    if (task.result !== undefined) {
      taskResult.result = task.result;
    }
    if (task.error !== undefined && task.error !== null) {
      taskResult.error = task.error;
    }
    if (task.createdAt) {
      taskResult.startedAt = task.createdAt;
    }
    if (task.updatedAt) {
      taskResult.completedAt = task.updatedAt;
    }
    return taskResult;
  }

  /**
   * Cancel task
   */
  async cancelTask(workerId: string, taskId: string): Promise<Task> {
    const task = await this.prisma.taskExecution.findUnique({
      where: { id: taskId },
    });

    if (!task || task.workerId !== workerId) {
      throw new Error(`Task ${taskId} not found for worker ${workerId}`);
    }

    if (task.status === 'completed' || task.status === 'failed') {
      throw new Error(`Task ${taskId} is already ${task.status}`);
    }

    await this.prisma.taskExecution.update({
      where: { id: taskId },
      data: {
        status: 'failed',
        error: 'Task cancelled',
      },
    });

    return {
      id: task.id,
      type: task.taskType,
      status: 'failed',
      error: 'Task cancelled',
      createdAt: task.createdAt,
      startedAt: task.createdAt,
      completedAt: new Date(),
      payload: {},
      priority: 0,
    };
  }

  /**
   * Pause worker
   */
  async pauseWorker(workerId: string): Promise<WorkerInstance> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    worker.state = WorkerState.PAUSED;
    worker.updatedAt = new Date();

    await this.prisma.virtualWorker.update({
      where: { id: workerId },
      data: { state: WorkerState.PAUSED },
    });

    return worker;
  }

  /**
   * Resume worker
   */
  async resumeWorker(workerId: string): Promise<WorkerInstance> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    worker.state = worker.currentTasks > 0 ? WorkerState.WORKING : WorkerState.IDLE;
    worker.updatedAt = new Date();

    await this.prisma.virtualWorker.update({
      where: { id: workerId },
      data: { state: worker.state },
    });

    // Process queued tasks
    const queue = this.taskQueues.get(workerId);
    if (queue && queue.length > 0 && worker.currentTasks < worker.maxConcurrentTasks) {
      const nextTask: Task | undefined = queue.shift();
      if (nextTask) {
        this.executeTask(workerId, nextTask);
      }
    }

    return worker;
  }

  /**
   * Get worker metrics
   */
  async getWorkerMetrics(workerId: string): Promise<WorkerMetrics> {
    return this.getTaskMetrics(workerId);
  }

  /**
   * Delete worker
   */
  async deleteWorker(workerId: string): Promise<void> {
    this.workers.delete(workerId);
    this.taskQueues.delete(workerId);

    await this.prisma.virtualWorker.delete({
      where: { id: workerId },
    });

    this.logger.log(`Virtual worker deleted: ${workerId}`);
  }

  /**
   * Get task metrics
   */
  async getTaskMetrics(workerId: string): Promise<WorkerMetrics> {
    const executions = await this.prisma.taskExecution.findMany({
      where: { workerId },
    });

    const successful = executions.filter((e) => e.status === 'completed');
    const failed = executions.filter((e) => e.status === 'failed');
    const avgExecutionTime =
      successful.length > 0
        ? successful.reduce((sum, e) => sum + (e.executionTime || 0), 0) / successful.length
        : 0;

    return {
      total: executions.length,
      completed: successful.length,
      failed: failed.length,
      successRate: successful.length / executions.length || 0,
      averageExecutionTime: avgExecutionTime,
    };
  }
}
