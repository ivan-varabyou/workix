/**
 * Batch Processing Interfaces
 * All interfaces for batch processing module
 */

/**
 * Batch Item Data
 * Generic data structure for batch items
 */
export type BatchItemData = Record<string, unknown>;

/**
 * Batch Item Result
 * Generic result structure for processed batch items
 */
export type BatchItemResult = Record<string, unknown>;

/**
 * Prisma Batch Job Create Args
 */
export interface BatchJobCreateArgs {
  data: {
    userId: string;
    name: string;
    processor: string;
    totalItems: number;
    processedItems: number;
    failedItems: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    priority: number;
    retryCount: number;
  };
}

/**
 * Prisma Batch Job Update Args
 */
export interface BatchJobUpdateArgs {
  where: { id: string };
  data: {
    status?: 'queued' | 'processing' | 'completed' | 'failed';
    processedItems?: number;
    failedItems?: number;
    completedAt?: Date;
  };
}

/**
 * Prisma Batch Job Find Unique Args
 */
export interface BatchJobFindUniqueArgs {
  where: { id: string };
}

/**
 * Prisma Batch Job Find Many Args
 */
export interface BatchJobFindManyArgs {
  where?: { userId?: string };
  orderBy?: { createdAt: 'asc' | 'desc' };
}

/**
 * Prisma Batch Item Create Args
 */
export interface BatchItemCreateArgs {
  data: {
    jobId: string;
    data: BatchItemData;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    retries: number;
  };
}

/**
 * Prisma Batch Item Update Args
 */
export interface BatchItemUpdateArgs {
  where: { id: string };
  data: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    result?: BatchItemResult;
    error?: string | null;
    retries?: number;
  };
}

/**
 * Prisma Batch Item Update Many Args
 */
export interface BatchItemUpdateManyArgs {
  where: { jobId: string; status?: 'pending' | 'processing' | 'completed' | 'failed' };
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
  };
}

/**
 * Prisma Batch Item Find Many Args
 */
export interface BatchItemFindManyArgs {
  where: { jobId: string; status?: 'pending' | 'processing' | 'completed' | 'failed' };
  orderBy?: { createdAt: 'asc' | 'desc' };
}

/**
 * Prisma Service interface for batch processing
 */
export interface BatchProcessingPrismaService {
  batchJob: {
    create: (args: BatchJobCreateArgs) => Promise<BatchJobEntity>;
    update: (args: BatchJobUpdateArgs) => Promise<BatchJobEntity>;
    findUnique: (args: BatchJobFindUniqueArgs) => Promise<BatchJobEntity | null>;
    findMany: (args?: BatchJobFindManyArgs) => Promise<BatchJobEntity[]>;
  };
  batchItem: {
    create: (args: BatchItemCreateArgs) => Promise<BatchItemEntity>;
    update: (args: BatchItemUpdateArgs) => Promise<BatchItemEntity>;
    updateMany: (args: BatchItemUpdateManyArgs) => Promise<{ count: number }>;
    findMany: (args: BatchItemFindManyArgs) => Promise<BatchItemEntity[]>;
  };
}

/**
 * Batch Job Entity (from database)
 */
export interface BatchJobEntity {
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
  completedAt?: Date | null;
}

/**
 * Batch Item Entity (from database)
 */
export interface BatchItemEntity {
  id: string;
  jobId: string;
  data: BatchItemData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: BatchItemResult | null;
  error?: string | null;
  retries: number;
  createdAt?: Date;
}

/**
 * User interface for batch processing
 */
export interface BatchUser {
  userId: string;
}
