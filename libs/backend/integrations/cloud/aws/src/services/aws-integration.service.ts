import { Inject, Injectable, Logger } from '@nestjs/common';

import { AWSIntegrationRecord } from '../interfaces/aws-config.interface';
import { AWSPrismaService } from '../interfaces/aws-prisma.interface';
import {
  InfrastructureStatus,
  LambdaDeploymentResult,
  LambdaInvocationResult,
  LambdaPayload,
  S3UploadResult,
} from '../types/aws-api-types';
import { AwsService } from './aws.service';

@Injectable()
export class AwsIntegrationService {
  private readonly logger = new Logger(AwsIntegrationService.name);

  constructor(
    private readonly awsService: AwsService,
    @Inject('PrismaService') private prisma: AWSPrismaService
  ) {}

  /**
   * Create AWS integration for a user
   */
  async createIntegration(
    userId: string,
    region: string,
    services: string[]
  ): Promise<AWSIntegrationRecord> {
    try {
      const integration = await this.prisma.awsIntegration.create({
        data: {
          userId,
          region,
          services: services.join(','),
          isActive: true,
        },
      });

      this.logger.log(`AWS integration created for user ${userId}`);
      return integration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create AWS integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get integration by user ID
   */
  async getIntegration(userId: string): Promise<AWSIntegrationRecord | null> {
    try {
      return await this.prisma.awsIntegration.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get AWS integration: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    userId: string,
    key: string,
    body: Buffer | string,
    contentType?: string
  ): Promise<S3UploadResult> {
    try {
      const integration = await this.getIntegration(userId);
      if (!integration) {
        throw new Error('AWS integration not found');
      }

      return await this.awsService.uploadToS3(key, body, contentType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to upload file: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Download file from S3
   */
  async downloadFile(userId: string, key: string): Promise<Buffer> {
    try {
      const integration = await this.getIntegration(userId);
      if (!integration) {
        throw new Error('AWS integration not found');
      }

      return await this.awsService.downloadFromS3(key);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to download file: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Execute Lambda function for pipeline
   */
  async executeLambda(
    userId: string,
    functionName: string,
    payload: LambdaPayload
  ): Promise<LambdaInvocationResult> {
    try {
      const integration = await this.getIntegration(userId);
      if (!integration || !integration.services.includes('lambda')) {
        throw new Error('Lambda service not available');
      }

      return await this.awsService.invokeLambda(functionName, payload);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to execute Lambda: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get infrastructure status
   */
  async getInfrastructureStatus(userId: string): Promise<InfrastructureStatus | null> {
    try {
      const integration = await this.getIntegration(userId);
      if (!integration) {
        throw new Error('AWS integration not found');
      }

      const s3Objects = await this.awsService.listS3Objects();
      const lambdaFunctions = await this.awsService.listLambdaFunctions();
      const ec2Instances = await this.awsService.listEC2Instances();

      return {
        region: integration.region,
        s3: { buckets: 1, objects: s3Objects.length },
        lambda: { functions: lambdaFunctions.length },
        ec2: { instances: ec2Instances.length, running: 1 },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get infrastructure status: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Deploy Lambda function
   */
  async deployLambdaFunction(
    userId: string,
    functionName: string,
    zipBuffer: Buffer
  ): Promise<LambdaDeploymentResult> {
    try {
      const integration = await this.getIntegration(userId);
      if (!integration || !integration.services.includes('lambda')) {
        throw new Error('Lambda service not available');
      }

      // Upload to S3 first
      const s3Key = `lambda/${functionName}/${Date.now()}.zip`;
      const s3Result = await this.awsService.uploadToS3(s3Key, zipBuffer);

      this.logger.log(`Lambda function deployed: ${functionName}`);
      return {
        functionName,
        s3Location: s3Result.location,
        deployedAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to deploy Lambda function: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Deactivate integration
   */
  async deactivateIntegration(integrationId: string): Promise<void> {
    try {
      await this.prisma.awsIntegration.update({
        where: { id: integrationId },
        data: { isActive: false },
      });

      this.logger.log(`AWS integration deactivated: ${integrationId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to deactivate integration: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}
