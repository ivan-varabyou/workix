// Azure DTO interfaces

import type { FunctionPayload } from '../types/azure-api-types';

export interface CreateAzureIntegrationDto {
  subscriptionId: string;
}

export interface UploadToStorageDto {
  container: string;
  blob: string;
  data?: string;
}

export interface InvokeFunctionDto {
  functionName: string;
  payload: FunctionPayload;
}

export interface ExecuteQueryDto {
  query: string;
}
