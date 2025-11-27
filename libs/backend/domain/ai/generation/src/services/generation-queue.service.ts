import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

import { QueueTaskPayload, QueueTaskResult } from '../interfaces/generation.interface';

export interface QueuedTask {
  id: string;
  priority: number;
  payload: QueueTaskPayload;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: QueueTaskResult;
  error?: string;
}

/**
 * Job queue service for batch generation tasks
 * In production, should use BullMQ or similar
 */
@Injectable()
export class GenerationQueueService extends EventEmitter {
  private queue: Map<string, QueuedTask> = new Map();
  private processing: Set<string> = new Set();
  private maxConcurrent = 5;

  addTask(task: QueueTaskPayload, priority = 0): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    this.queue.set(id, {
      id,
      priority,
      payload: task,
      status: 'pending',
      createdAt: new Date(),
    });

    this.emit('task_added', { id, priority });
    this.processTasks();

    return id;
  }

  async getTask(id: string): Promise<QueuedTask | undefined> {
    return this.queue.get(id);
  }

  private async processTasks(): Promise<void> {
    if (this.processing.size >= this.maxConcurrent) {
      return;
    }

    const tasks = Array.from(this.queue.values())
      .filter((t) => t.status === 'pending' && !this.processing.has(t.id))
      .sort((a, b) => b.priority - a.priority);

    for (const task of tasks) {
      if (this.processing.size >= this.maxConcurrent) break;

      this.processing.add(task.id);
      task.status = 'processing';
      task.startedAt = new Date();

      this.emit('task_started', { id: task.id });

      try {
        // Task would be processed here
        // In real implementation, would call actual generation service
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing

        task.status = 'completed';
        task.completedAt = new Date();
        this.emit('task_completed', { id: task.id });
      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Unknown error';
        task.completedAt = new Date();
        this.emit('task_failed', { id: task.id, error: task.error });
      } finally {
        this.processing.delete(task.id);
      }
    }

    if (tasks.length > 0) {
      this.processTasks();
    }
  }

  getQueueStats() {
    return {
      pending: Array.from(this.queue.values()).filter((t) => t.status === 'pending').length,
      processing: this.processing.size,
      completed: Array.from(this.queue.values()).filter((t) => t.status === 'completed').length,
      failed: Array.from(this.queue.values()).filter((t) => t.status === 'failed').length,
      total: this.queue.size,
    };
  }

  clearCompleted(): void {
    for (const [id, task] of this.queue.entries()) {
      if (task.status === 'completed') {
        this.queue.delete(id);
      }
    }
  }
}
