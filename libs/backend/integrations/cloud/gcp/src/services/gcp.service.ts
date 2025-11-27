import { Injectable, Logger } from '@nestjs/common';

import type {
  BigQueryResult,
  CloudFunctionInvocationResult,
  CloudStorageUploadResult,
  ComputeInstance,
  FunctionPayload,
  ProjectInfo,
} from '../types/gcp-api-types';
import {
  isBigQueryResult,
  isCloudFunctionInvocationResult,
  isCloudStorageUploadResult,
  isComputeInstance,
  isProjectInfo,
} from '../types/gcp-api-types';

@Injectable()
export class GCPService {
  private readonly logger = new Logger(GCPService.name);

  constructor() {
    this.logger.log('GCP Service initialized');
  }

  async uploadToCloudStorage(
    bucket: string,
    name: string,
    data: Buffer
  ): Promise<CloudStorageUploadResult> {
    this.logger.log(`Uploading to Cloud Storage: gs://${bucket}/${name}`);
    const result: CloudStorageUploadResult = {
      bucket,
      name,
      size: data.length,
      url: `gs://${bucket}/${name}`,
    };
    if (!isCloudStorageUploadResult(result)) {
      throw new Error('Invalid cloud storage upload result format');
    }
    return result;
  }

  async invokeCloudFunction(
    functionName: string,
    payload: FunctionPayload
  ): Promise<CloudFunctionInvocationResult> {
    this.logger.log(`Invoking Cloud Function: ${functionName}`);
    const result: CloudFunctionInvocationResult = {
      functionName,
      executedAt: new Date(),
      response: payload,
    };
    if (!isCloudFunctionInvocationResult(result)) {
      throw new Error('Invalid cloud function invocation result format');
    }
    return result;
  }

  async getComputeInstances(): Promise<ComputeInstance[]> {
    this.logger.log('Listing Compute Engine instances');
    const instances: ComputeInstance[] = [
      { name: 'instance-1', status: 'RUNNING', machineType: 'n1-standard-1' },
    ];
    return instances.filter((instance): instance is ComputeInstance => isComputeInstance(instance));
  }

  async queryBigQuery(query: string): Promise<BigQueryResult> {
    this.logger.log('Executing BigQuery');
    const result: BigQueryResult = { query, rows: 1000, executedAt: new Date() };
    if (!isBigQueryResult(result)) {
      throw new Error('Invalid BigQuery result format');
    }
    return result;
  }

  async getProjectInfo(): Promise<ProjectInfo> {
    this.logger.log('Getting GCP project info');
    const info: ProjectInfo = {
      projectId: 'workix-project',
      region: 'us-central1',
      services: ['storage', 'cloudfunctions', 'compute', 'bigquery'],
    };
    if (!isProjectInfo(info)) {
      throw new Error('Invalid project info format');
    }
    return info;
  }

  async listComputeInstances(): Promise<ComputeInstance[]> {
    this.logger.log('Listing Compute Engine instances');
    return await this.getComputeInstances();
  }
}
