import { Injectable, Logger } from '@nestjs/common';

import {
  Worker,
  WorkerContext,
  WorkerInput,
  WorkerOutput,
} from '../interfaces/worker-framework.interface';

export type { Worker } from '../interfaces/worker-framework.interface';

/**
 * Worker Registry
 * Plugin system for AI agents
 */
@Injectable()
export class WorkerFrameworkService {
  private readonly logger = new Logger(WorkerFrameworkService.name);
  private workers: Map<string, Worker> = new Map();
  private workersByType: Map<string, Worker[]> = new Map();
  private workersByCapability: Map<string, Worker[]> = new Map();

  /**
   * Register worker
   */
  registerWorker(worker: Worker): void {
    if (this.workers.has(worker.id)) {
      this.logger.warn(`Worker ${worker.id} already registered, overwriting`);
    }

    this.workers.set(worker.id, worker);

    // Index by type
    if (!this.workersByType.has(worker.type)) {
      this.workersByType.set(worker.type, []);
    }
    const typeWorkers: Worker[] | undefined = this.workersByType.get(worker.type);
    if (typeWorkers) {
      typeWorkers.push(worker);
    }

    // Index by capabilities
    for (const capability of worker.capabilities) {
      if (!this.workersByCapability.has(capability)) {
        this.workersByCapability.set(capability, []);
      }
      const capabilityWorkers: Worker[] | undefined = this.workersByCapability.get(capability);
      if (capabilityWorkers) {
        capabilityWorkers.push(worker);
      }
    }

    this.logger.log(`Worker registered: ${worker.id} (${worker.type})`);
  }

  /**
   * Unregister worker
   */
  unregisterWorker(workerId: string): boolean {
    const worker = this.workers.get(workerId);

    if (!worker) {
      return false;
    }

    // Remove from type index
    const typeWorkers = this.workersByType.get(worker.type);
    if (typeWorkers) {
      const index = typeWorkers.findIndex((w) => w.id === workerId);
      if (index !== -1) {
        typeWorkers.splice(index, 1);
      }
    }

    // Remove from capability index
    for (const capability of worker.capabilities) {
      const capabilityWorkers = this.workersByCapability.get(capability);
      if (capabilityWorkers) {
        const index = capabilityWorkers.findIndex((w) => w.id === workerId);
        if (index !== -1) {
          capabilityWorkers.splice(index, 1);
        }
      }
    }

    this.workers.delete(workerId);
    this.logger.log(`Worker unregistered: ${workerId}`);

    return true;
  }

  /**
   * Get worker by ID
   */
  getWorker(workerId: string): Worker | undefined {
    return this.workers.get(workerId);
  }

  /**
   * Get workers by type
   */
  getWorkersByType(type: string): Worker[] {
    return this.workersByType.get(type) || [];
  }

  /**
   * Get workers by capability
   */
  getWorkersByCapability(capability: string): Worker[] {
    return this.workersByCapability.get(capability) || [];
  }

  /**
   * List all workers
   */
  listWorkers(): Worker[] {
    return Array.from(this.workers.values());
  }

  /**
   * Execute worker
   */
  async executeWorker(
    workerId: string,
    input: WorkerInput,
    context?: WorkerContext
  ): Promise<WorkerOutput> {
    const worker = this.workers.get(workerId);

    if (!worker) {
      throw new Error(`Worker not found: ${workerId}`);
    }

    // Validate input if validator exists
    if (worker.validate && !worker.validate(input)) {
      throw new Error(`Invalid input for worker: ${workerId}`);
    }

    // Health check if available
    if (worker.healthCheck) {
      const healthy = await worker.healthCheck();
      if (!healthy) {
        throw new Error(`Worker ${workerId} is not healthy`);
      }
    }

    try {
      const result = await worker.execute(input, context);
      this.logger.log(`Worker ${workerId} executed successfully`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Worker ${workerId} execution failed:`, error);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Find best worker for task
   */
  findBestWorker(capabilities: string[], preferredType?: string): Worker | undefined {
    // Get workers that have all required capabilities
    let candidates: Worker[] = [];

    if (capabilities.length === 0) {
      candidates = this.listWorkers();
    } else {
      // Start with workers that have the first capability
      const firstCapability = capabilities[0];
      if (!firstCapability) {
        return undefined;
      }
      candidates = this.getWorkersByCapability(firstCapability);

      // Filter to only workers that have all capabilities
      for (const capability of capabilities.slice(1)) {
        const capabilityWorkers = this.getWorkersByCapability(capability);
        candidates = candidates.filter((w) => capabilityWorkers.includes(w));
      }
    }

    if (candidates.length === 0) {
      return undefined;
    }

    // Prefer workers of specified type
    if (preferredType) {
      const typeWorkers = candidates.filter((w) => w.type === preferredType);
      if (typeWorkers.length > 0) {
        return typeWorkers[0];
      }
    }

    // Return first candidate
    return candidates[0];
  }

  /**
   * Health check all workers
   */
  async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [workerId, worker] of this.workers.entries()) {
      if (worker.healthCheck) {
        try {
          results[workerId] = await worker.healthCheck();
        } catch {
          results[workerId] = false;
        }
      } else {
        results[workerId] = true; // Assume healthy if no health check
      }
    }

    return results;
  }
}
