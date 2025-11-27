import { Inject, Injectable, Logger } from '@nestjs/common';

import { LambdaConfig, S3Config } from '../interfaces/aws-config.interface';
import type {
  AWSAccountInfo,
  CloudWatchMetric,
  EC2Instance,
  LambdaFunction,
  LambdaInvocationResult,
  LambdaPayload,
  S3Object,
  S3UploadResult,
} from '../types/aws-api-types';
import {
  isAWSAccountInfo,
  isCloudWatchMetric,
  isEC2Instance,
  isLambdaFunction,
  isLambdaInvocationResult,
  isS3Object,
  isS3UploadResult,
} from '../types/aws-api-types';

@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);

  constructor(
    @Inject('AWS_S3_CONFIG') private s3Config?: S3Config,
    @Inject('AWS_LAMBDA_CONFIG') private lambdaConfig?: LambdaConfig
  ) {
    this.initializeClients();
  }

  private initializeClients(): void {
    try {
      // Note: In production, use aws-sdk v3
      // import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
      this.logger.log('AWS clients initialized (mock mode)');
    } catch (error) {
      this.logger.warn('AWS SDK not available, running in mock mode');
    }
  }

  /**
   * Upload file to S3
   */
  async uploadToS3(
    key: string,
    _body: Buffer | string,
    _contentType?: string
  ): Promise<S3UploadResult> {
    try {
      this.logger.log(`Uploading to S3: s3://${this.s3Config?.bucket}/${key}`);

      // Mock implementation - in production use actual S3 API
      const result: S3UploadResult = {
        key,
        eTag: `"mock-etag-${Date.now()}"`,
        location: `${this.s3Config?.baseUrl}/${key}`,
      };
      if (this.s3Config?.bucket !== undefined) {
        result.bucket = this.s3Config.bucket;
      }

      if (!isS3UploadResult(result)) {
        throw new Error('Invalid S3 upload result format');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to upload to S3: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Download file from S3
   */
  async downloadFromS3(key: string): Promise<Buffer> {
    try {
      this.logger.log(`Downloading from S3: s3://${this.s3Config?.bucket}/${key}`);

      // Mock implementation
      return Buffer.from('mock-file-content');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to download from S3: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * List S3 objects
   */
  async listS3Objects(_prefix?: string): Promise<S3Object[]> {
    try {
      this.logger.log(`Listing S3 objects in ${this.s3Config?.bucket}`);

      // Mock implementation
      const objects: S3Object[] = [
        {
          key: 'file1.txt',
          size: 1024,
          lastModified: new Date(),
          eTag: '"abc123"',
        },
        {
          key: 'file2.pdf',
          size: 2048,
          lastModified: new Date(),
          eTag: '"def456"',
        },
      ];

      return objects.filter((obj): obj is S3Object => isS3Object(obj));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list S3 objects: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Delete S3 object
   */
  async deleteFromS3(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting from S3: s3://${this.s3Config?.bucket}/${key}`);

      // Mock implementation
      this.logger.log(`Deleted: ${key}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete from S3: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Invoke Lambda function
   */
  async invokeLambda(
    functionName: string,
    payload: LambdaPayload,
    invocationType: 'RequestResponse' | 'Event' | 'DryRun' = 'RequestResponse'
  ): Promise<LambdaInvocationResult> {
    try {
      this.logger.log(`Invoking Lambda function: ${functionName} (${invocationType})`);

      // Mock implementation
      const result: LambdaInvocationResult = {
        statusCode: 200,
        body: {
          message: `Lambda function ${functionName} executed successfully`,
          input: payload,
        },
        executedAt: new Date(),
      };

      if (!isLambdaInvocationResult(result)) {
        throw new Error('Invalid Lambda invocation result format');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to invoke Lambda: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * List Lambda functions
   */
  async listLambdaFunctions(): Promise<LambdaFunction[]> {
    try {
      this.logger.log('Listing Lambda functions');

      // Mock implementation
      const functions: LambdaFunction[] = [
        {
          functionName: 'process-pipeline',
          functionArn: 'arn:aws:lambda:us-east-1:123456789:function:process-pipeline',
          runtime: 'nodejs18.x',
          handler: 'index.handler',
          codeSize: 5242880,
          timeout: 60,
          memorySize: 256,
          lastModified: new Date(),
          state: 'Active',
        },
      ];

      return functions.filter((fn): fn is LambdaFunction => isLambdaFunction(fn));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list Lambda functions: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get Lambda function details
   */
  async getLambdaFunction(functionName: string): Promise<LambdaFunction> {
    try {
      this.logger.log(`Getting Lambda function details: ${functionName}`);

      // Mock implementation
      const functionData: LambdaFunction = {
        functionName,
        functionArn: `arn:aws:lambda:${this.lambdaConfig?.region}:123456789:function:${functionName}`,
        runtime: 'nodejs18.x',
        handler: 'index.handler',
        codeSize: 5242880,
        timeout: 60,
        memorySize: 256,
        lastModified: new Date(),
        state: 'Active',
      };

      if (!isLambdaFunction(functionData)) {
        throw new Error('Invalid Lambda function format');
      }

      return functionData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get Lambda function details: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * List EC2 instances
   */
  async listEC2Instances(): Promise<EC2Instance[]> {
    try {
      this.logger.log('Listing EC2 instances');

      // Mock implementation
      const instances: EC2Instance[] = [
        {
          instanceId: 'i-1234567890abcdef0',
          state: 'running',
          imageId: 'ami-0c55b159cbfafe1f0',
          instanceType: 't2.micro',
          publicIpAddress: '54.123.45.67',
          privateIpAddress: '10.0.1.100',
          launchTime: new Date(),
          tags: [{ key: 'Name', value: 'web-server' }],
        },
      ];

      return instances.filter((instance): instance is EC2Instance => isEC2Instance(instance));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list EC2 instances: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Start EC2 instance
   */
  async startEC2Instance(instanceId: string): Promise<void> {
    try {
      this.logger.log(`Starting EC2 instance: ${instanceId}`);

      // Mock implementation
      this.logger.log(`EC2 instance started: ${instanceId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to start EC2 instance: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Stop EC2 instance
   */
  async stopEC2Instance(instanceId: string): Promise<void> {
    try {
      this.logger.log(`Stopping EC2 instance: ${instanceId}`);

      // Mock implementation
      this.logger.log(`EC2 instance stopped: ${instanceId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to stop EC2 instance: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get CloudWatch metrics
   */
  async getCloudWatchMetrics(namespace: string, metricName: string): Promise<CloudWatchMetric> {
    try {
      this.logger.log(`Getting CloudWatch metrics: ${namespace}/${metricName}`);

      // Mock implementation
      const metric: CloudWatchMetric = {
        namespace,
        metricName,
        datapoints: [
          { timestamp: new Date(), value: 45.5 },
          { timestamp: new Date(), value: 52.3 },
        ],
      };

      if (!isCloudWatchMetric(metric)) {
        throw new Error('Invalid CloudWatch metric format');
      }

      return metric;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get CloudWatch metrics: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get AWS account info
   */
  async getAccountInfo(): Promise<AWSAccountInfo> {
    try {
      this.logger.log('Getting AWS account info');

      // Mock implementation
      const accountInfo: AWSAccountInfo = {
        services: ['s3', 'lambda', 'ec2', 'cloudwatch'],
        isActive: true,
      };
      if (this.s3Config?.region !== undefined) {
        accountInfo.region = this.s3Config.region;
      }

      if (!isAWSAccountInfo(accountInfo)) {
        throw new Error('Invalid AWS account info format');
      }

      return accountInfo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get account info: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
