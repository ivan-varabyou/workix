import { Injectable } from '@nestjs/common';

import {
  BatchItemData,
  BatchItemEntity,
  BatchItemResult,
  BatchJobEntity,
  BatchProcessingPrismaService,
} from '../interfaces/batch-processing.interface';

export interface BatchJob {
  id: string;
  userId: string;
  name: string;
  processor: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  retryCount: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface BatchItem {
  id: string;
  jobId: string;
  data: BatchItemData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: BatchItemResult;
  error?: string;
  retries: number;
}

export interface BatchProcessor {
  name: string;
  handler: (item: BatchItemData) => Promise<BatchItemResult>;
  batchSize: number;
  maxRetries: number;
}

@Injectable()
export class BatchService {
  // Logger reserved for future use
  // private _logger = new Logger(BatchService.name);
  private jobs: BatchJob[] = [];
  private queue: BatchJob[] = [];
  private isProcessing = false;
  private processors = new Map<string, BatchProcessor>();

  constructor(private readonly prisma: BatchProcessingPrismaService) {}

  /**
   * Convert BatchJobEntity to BatchJob
   */
  private entityToJob(entity: BatchJobEntity): BatchJob {
    const job: BatchJob = {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      processor: entity.processor,
      totalItems: entity.totalItems,
      processedItems: entity.processedItems,
      failedItems: entity.failedItems,
      status: entity.status,
      priority: entity.priority,
      retryCount: entity.retryCount,
      createdAt: entity.createdAt,
    };
    if (entity.completedAt !== undefined && entity.completedAt !== null) {
      job.completedAt = entity.completedAt;
    }
    return job;
  }

  /**
   * Convert BatchItemEntity to BatchItem
   */
  private entityToItem(entity: BatchItemEntity): BatchItem {
    const item: BatchItem = {
      id: entity.id,
      jobId: entity.jobId,
      data: entity.data,
      status: entity.status,
      retries: entity.retries,
    };
    if (entity.result !== undefined && entity.result !== null) {
      item.result = entity.result;
    }
    if (entity.error !== undefined && entity.error !== null) {
      item.error = entity.error;
    }
    return item;
  }

  // Getters
  get activeJobs(): BatchJob[] {
    return this.jobs.filter((j) => j.status === 'processing');
  }

  get completedJobs(): BatchJob[] {
    return this.jobs.filter((j) => j.status === 'completed');
  }

  get failedJobs(): BatchJob[] {
    return this.jobs.filter((j) => j.status === 'failed');
  }

  get successRate(): number {
    if (this.jobs.length === 0) return 100;

    const successful = this.jobs.filter((j) => j.status === 'completed').length;
    return Math.round((successful / this.jobs.length) * 100);
  }

  /**
   * Register batch processor
   */
  registerProcessor(processor: BatchProcessor): void {
    this.processors.set(processor.name, processor);
  }

  /**
   * Create batch job
   */
  async createBatchJob(
    userId: string,
    name: string,
    processor: string,
    items: BatchItemData[],
    priority = 0
  ): Promise<BatchJob> {
    if (!this.processors.has(processor)) {
      throw new Error(`Processor '${processor}' not found`);
    }

    const job = await this.prisma.batchJob.create({
      data: {
        userId,
        name,
        processor,
        totalItems: items.length,
        processedItems: 0,
        failedItems: 0,
        status: 'queued',
        priority,
        retryCount: 0,
      },
    });

    // Create batch items
    await Promise.all(
      items.map((item) =>
        this.prisma.batchItem.create({
          data: {
            jobId: job.id,
            data: item,
            status: 'pending',
            retries: 0,
          },
        })
      )
    );

    const batchJob = this.entityToJob(job);
    this.jobs.push(batchJob);
    this.queue.push(batchJob);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }

    return batchJob;
  }

  /**
   * Get user batch jobs
   */
  async getUserBatchJobs(userId: string): Promise<BatchJob[]> {
    const entities = await this.prisma.batchJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const jobs = entities.map((entity) => this.entityToJob(entity));
    this.jobs = jobs;
    return jobs;
  }

  /**
   * Get batch items
   */
  async getBatchItems(jobId: string): Promise<BatchItem[]> {
    const entities = await this.prisma.batchItem.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
    return entities.map((entity) => this.entityToItem(entity));
  }

  /**
   * Start batch processing
   */
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const nextJob = this.queue[0];

        if (nextJob) {
          await this.processBatchJob(nextJob);
        }

        // Remove from queue
        this.queue = this.queue.slice(1);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process batch job
   */
  private async processBatchJob(job: BatchJob): Promise<void> {
    const processor = this.processors.get(job.processor);
    if (!processor) return;

    // Update job status
    await this.updateJobStatus(job.id, 'processing');

    const items = await this.prisma.batchItem.findMany({
      where: { jobId: job.id, status: 'pending' },
    });

    let processedCount = 0;
    let failedCount = 0;

    // Process in batches
    for (let i = 0; i < items.length; i += processor.batchSize) {
      const batch = items.slice(i, i + processor.batchSize);

      const results = await Promise.allSettled(
        batch.map((item) => this.processItem(item, processor))
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          processedCount++;
        } else {
          failedCount++;
        }
      });

      // Update job progress
      await this.prisma.batchJob.update({
        where: { id: job.id },
        data: {
          processedItems: processedCount,
          failedItems: failedCount,
        },
      });
    }

    // Mark job as completed
    await this.updateJobStatus(job.id, failedCount === 0 ? 'completed' : 'failed');

    // Update job in array
    this.jobs = this.jobs.map((jb) =>
      jb.id === job.id
        ? {
            ...jb,
            status: failedCount === 0 ? 'completed' : 'failed',
            completedAt: new Date(),
          }
        : jb
    );
  }

  /**
   * Process individual item
   */
  private async processItem(itemEntity: BatchItemEntity, processor: BatchProcessor): Promise<void> {
    const item = this.entityToItem(itemEntity);
    try {
      // Mark as processing
      await this.prisma.batchItem.update({
        where: { id: item.id },
        data: { status: 'processing' },
      });

      // Execute processor
      const result = await processor.handler(item.data);

      // Mark as completed
      await this.prisma.batchItem.update({
        where: { id: item.id },
        data: {
          status: 'completed',
          result,
        },
      });
    } catch (error: unknown) {
      const retries: number = item.retries + 1;
      const errorMessage: string = error instanceof Error ? error.message : String(error);

      if (retries < processor.maxRetries) {
        // Retry
        await this.prisma.batchItem.update({
          where: { id: item.id },
          data: {
            status: 'pending',
            retries,
            error: errorMessage,
          },
        });
      } else {
        // Mark as failed
        await this.prisma.batchItem.update({
          where: { id: item.id },
          data: {
            status: 'failed',
            retries,
            error: errorMessage,
          },
        });
      }
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string,
    status: 'queued' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    const updateData: {
      status: 'queued' | 'processing' | 'completed' | 'failed';
      completedAt?: Date;
    } = {
      status,
    };
    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
    }
    await this.prisma.batchJob.update({
      where: { id: jobId },
      data: updateData,
    });
  }

  /**
   * Get batch job statistics
   */
  async getBatchStatistics(jobId: string): Promise<{
    totalItems: number;
    processedItems: number;
    failedItems: number;
    successRate: number;
    averageProcessingTime: number;
  }> {
    const job = await this.prisma.batchJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Batch job not found');
    }

    const successRate =
      job.totalItems === 0
        ? 0
        : Math.round(((job.totalItems - job.failedItems) / job.totalItems) * 100);

    return {
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      failedItems: job.failedItems,
      successRate,
      averageProcessingTime: 0,
    };
  }

  /**
   * Cancel batch job
   */
  async cancelBatchJob(jobId: string): Promise<void> {
    await this.updateJobStatus(jobId, 'failed');

    // Mark remaining items as failed
    await this.prisma.batchItem.updateMany({
      where: { jobId, status: 'pending' },
      data: {
        status: 'failed',
        error: 'Job cancelled',
      },
    });
  }

  /**
   * Retry failed items
   */
  async retryFailedItems(jobId: string): Promise<void> {
    const failedItems = await this.prisma.batchItem.findMany({
      where: { jobId, status: 'failed' },
    });

    await Promise.all(
      failedItems.map((item) =>
        this.prisma.batchItem.update({
          where: { id: item.id },
          data: { status: 'pending', retries: 0, error: null },
        })
      )
    );

    // Requeue job
    const jobEntity = await this.prisma.batchJob.findUnique({
      where: { id: jobId },
    });

    if (jobEntity) {
      const job = this.entityToJob(jobEntity);
      this.queue.push(job);
      this.queue.sort((a, b) => b.priority - a.priority);

      if (!this.isProcessing) {
        this.startProcessing();
      }
    }
  }
}
