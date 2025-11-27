/**
 * GCP API Types
 *
 * Полное покрытие типов для Google Cloud Platform API
 * TODO: После установки @google-cloud/storage, @google-cloud/functions, @google-cloud/compute заменить на импорты из библиотек
 */

/**
 * Cloud Storage Types
 */
export interface CloudStorageUploadResult {
  bucket: string;
  name: string;
  size: number;
  url: string;
  etag?: string;
  generation?: string;
  contentType?: string;
  timeCreated?: Date;
  updated?: Date;
  [key: string]: unknown;
}

export interface CloudStorageObject {
  name: string;
  size: number;
  timeCreated: Date;
  updated: Date;
  etag: string;
  contentType?: string;
  bucket?: string;
  [key: string]: unknown;
}

export interface CloudStorageBucket {
  name: string;
  location: string;
  storageClass: string;
  timeCreated: Date;
  updated: Date;
  [key: string]: unknown;
}

/**
 * Cloud Functions Types
 */
export interface CloudFunctionInvocationResult {
  functionName: string;
  executedAt: Date;
  response: FunctionPayload;
  statusCode?: number;
  executionId?: string;
  [key: string]: unknown;
}

export interface CloudFunction {
  name: string;
  runtime: string;
  entryPoint: string;
  status: string;
  updateTime?: Date;
  availableMemoryMb?: number;
  timeout?: string;
  environmentVariables?: Record<string, string>;
  [key: string]: unknown;
}

export type FunctionPayload = Record<string, unknown>;

/**
 * Compute Engine Types
 */
export interface ComputeInstance {
  name: string;
  status: string;
  machineType: string;
  zone?: string;
  region?: string;
  networkInterfaces?: Array<{
    networkIP?: string;
    accessConfigs?: Array<{
      natIP?: string;
    }>;
  }>;
  tags?: {
    items?: string[];
  };
  labels?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * BigQuery Types
 */
export interface BigQueryResult {
  query: string;
  rows: number;
  executedAt: Date;
  results?: unknown[];
  schema?: Array<{
    name: string;
    type: string;
    mode?: string;
  }>;
  totalBytesProcessed?: number;
  jobComplete?: boolean;
  [key: string]: unknown;
}

export interface BigQueryDataset {
  id: string;
  datasetId: string;
  projectId: string;
  location?: string;
  creationTime?: Date;
  [key: string]: unknown;
}

export interface BigQueryTable {
  id: string;
  tableId: string;
  datasetId: string;
  projectId: string;
  creationTime?: Date;
  numRows?: string;
  numBytes?: string;
  [key: string]: unknown;
}

/**
 * GCP Project Types
 */
export interface ProjectInfo {
  projectId: string;
  region: string;
  services: string[];
  projectNumber?: string;
  name?: string;
  labels?: Record<string, string>;
  [key: string]: unknown;
}

export interface GCPAccountInfo {
  projectId?: string;
  projectNumber?: string;
  services: string[];
  isActive: boolean;
  [key: string]: unknown;
}

export interface InfrastructureStatus {
  projectId: string;
  region: string;
  services: string[];
  computeInstances: number;
  [key: string]: unknown;
}

/**
 * Type guards for GCP API responses
 */
export function isCloudStorageUploadResult(data: unknown): data is CloudStorageUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.bucket === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.size === 'number' &&
    typeof obj.url === 'string'
  );
}

export function isCloudStorageObject(data: unknown): data is CloudStorageObject {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.size === 'number' &&
    obj.timeCreated instanceof Date &&
    obj.updated instanceof Date &&
    typeof obj.etag === 'string'
  );
}

export function isCloudFunctionInvocationResult(
  data: unknown
): data is CloudFunctionInvocationResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.functionName === 'string' &&
    obj.executedAt instanceof Date &&
    typeof obj.response === 'object' &&
    obj.response !== null
  );
}

export function isCloudFunction(data: unknown): data is CloudFunction {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.runtime === 'string' &&
    typeof obj.entryPoint === 'string' &&
    typeof obj.status === 'string'
  );
}

export function isComputeInstance(data: unknown): data is ComputeInstance {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.machineType === 'string'
  );
}

export function isBigQueryResult(data: unknown): data is BigQueryResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.query === 'string' && typeof obj.rows === 'number' && obj.executedAt instanceof Date
  );
}

export function isProjectInfo(data: unknown): data is ProjectInfo {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.projectId === 'string' &&
    typeof obj.region === 'string' &&
    Array.isArray(obj.services)
  );
}

export function isGCPAccountInfo(data: unknown): data is GCPAccountInfo {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return Array.isArray(obj.services) && typeof obj.isActive === 'boolean';
}
