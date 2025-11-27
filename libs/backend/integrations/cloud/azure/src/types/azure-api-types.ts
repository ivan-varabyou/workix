/**
 * Azure API Types
 *
 * Полное покрытие типов для Azure API
 * TODO: После установки @azure/storage-blob, @azure/functions, @azure/compute заменить на импорты из библиотек
 */

/**
 * Azure Blob Storage Types
 */
export interface BlobUploadResult {
  container: string;
  blob: string;
  size: number;
  url: string;
  etag?: string;
  lastModified?: Date;
  contentType?: string;
  [key: string]: unknown;
}

export interface BlobObject {
  name: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType?: string;
  url?: string;
  [key: string]: unknown;
}

export interface BlobContainer {
  name: string;
  lastModified: Date;
  etag: string;
  publicAccess?: string;
  [key: string]: unknown;
}

/**
 * Azure Functions Types
 */
export interface FunctionInvocationResult {
  functionName: string;
  executedAt: Date;
  response: FunctionPayload;
  statusCode?: number;
  requestId?: string;
  [key: string]: unknown;
}

export interface AzureFunction {
  name: string;
  functionAppName: string;
  runtime: string;
  language: string;
  status: string;
  lastModified?: Date;
  [key: string]: unknown;
}

export type FunctionPayload = Record<string, unknown>;

/**
 * Azure Virtual Machine Types
 */
export interface VirtualMachine {
  name: string;
  status: string;
  size: string;
  resourceGroup?: string;
  location?: string;
  osType?: string;
  vmId?: string;
  provisioningState?: string;
  powerState?: string;
  tags?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Azure Cosmos DB Types
 */
export interface CosmosQueryResult {
  query: string;
  items: number;
  executedAt: Date;
  results?: unknown[];
  continuationToken?: string;
  requestCharge?: number;
  [key: string]: unknown;
}

export interface CosmosDatabase {
  id: string;
  _rid?: string;
  _self?: string;
  _etag?: string;
  _ts?: number;
  [key: string]: unknown;
}

export interface CosmosContainer {
  id: string;
  partitionKey?: {
    paths: string[];
    kind: string;
  };
  _rid?: string;
  _self?: string;
  _etag?: string;
  _ts?: number;
  [key: string]: unknown;
}

/**
 * Azure Resource Group Types
 */
export interface ResourceGroupInfo {
  resourceGroup: string;
  region: string;
  services: string[];
  subscriptionId?: string;
  tags?: Record<string, string>;
  [key: string]: unknown;
}

export interface AzureAccountInfo {
  subscriptionId?: string;
  tenantId?: string;
  services: string[];
  isActive: boolean;
  [key: string]: unknown;
}

export interface InfrastructureStatus {
  resourceGroup: string;
  region: string;
  services: string[];
  virtualMachines: number;
  [key: string]: unknown;
}

/**
 * Type guards for Azure API responses
 */
export function isBlobUploadResult(data: unknown): data is BlobUploadResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.container === 'string' &&
    typeof obj.blob === 'string' &&
    typeof obj.size === 'number' &&
    typeof obj.url === 'string'
  );
}

export function isBlobObject(data: unknown): data is BlobObject {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.size === 'number' &&
    obj.lastModified instanceof Date &&
    typeof obj.etag === 'string'
  );
}

export function isFunctionInvocationResult(data: unknown): data is FunctionInvocationResult {
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

export function isAzureFunction(data: unknown): data is AzureFunction {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.functionAppName === 'string' &&
    typeof obj.runtime === 'string' &&
    typeof obj.status === 'string'
  );
}

export function isVirtualMachine(data: unknown): data is VirtualMachine {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' && typeof obj.status === 'string' && typeof obj.size === 'string'
  );
}

export function isCosmosQueryResult(data: unknown): data is CosmosQueryResult {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.query === 'string' && typeof obj.items === 'number' && obj.executedAt instanceof Date
  );
}

export function isResourceGroupInfo(data: unknown): data is ResourceGroupInfo {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.resourceGroup === 'string' &&
    typeof obj.region === 'string' &&
    Array.isArray(obj.services)
  );
}

export function isAzureAccountInfo(data: unknown): data is AzureAccountInfo {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return Array.isArray(obj.services) && typeof obj.isActive === 'boolean';
}
