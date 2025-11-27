// GCP DTO interfaces

import type { FunctionPayload } from '../types/gcp-api-types';

export interface CreateGCPIntegrationDto {
  projectId: string;
}

export interface UploadToStorageDto {
  bucket: string;
  name: string;
  data?: string;
}

export interface InvokeFunctionDto {
  functionName: string;
  payload: FunctionPayload;
}

export interface ExecuteQueryDto {
  query: string;
}
