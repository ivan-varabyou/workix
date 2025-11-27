import { Inject, Injectable, Logger } from '@nestjs/common';

import { GCPIntegration, GCPPrismaService } from '../interfaces/gcp-prisma.interface';
import {
  CloudFunctionInvocationResult,
  CloudStorageUploadResult,
  FunctionPayload,
  InfrastructureStatus,
} from '../types/gcp-api-types';
import { GCPService } from './gcp.service';

@Injectable()
export class GCPIntegrationService {
  private readonly logger = new Logger(GCPIntegrationService.name);

  constructor(
    private readonly gcpService: GCPService,
    @Inject('PrismaService') private prisma: GCPPrismaService
  ) {}

  async createIntegration(
    userId: string,
    projectId: string
  ): Promise<GCPIntegration | { userId: string; projectId: string; isActive: boolean }> {
    const integration = await this.prisma.gcpIntegration?.create?.({
      data: { userId, projectId, isActive: true },
    });
    this.logger.log(`GCP integration created for user ${userId}`);
    return integration || { userId, projectId, isActive: true };
  }

  async getIntegration(userId: string): Promise<GCPIntegration | null> {
    return (
      (await this.prisma.gcpIntegration?.findFirst?.({
        where: { userId, isActive: true },
      })) || null
    );
  }

  async uploadFile(
    userId: string,
    bucket: string,
    name: string,
    data: Buffer
  ): Promise<CloudStorageUploadResult> {
    const integration = await this.getIntegration(userId);
    if (!integration) throw new Error('GCP integration not found');
    return await this.gcpService.uploadToCloudStorage(bucket, name, data);
  }

  async executeFunction(
    userId: string,
    functionName: string,
    payload: FunctionPayload
  ): Promise<CloudFunctionInvocationResult> {
    const integration = await this.getIntegration(userId);
    if (!integration) throw new Error('GCP integration not found');
    return await this.gcpService.invokeCloudFunction(functionName, payload);
  }

  async getInfrastructureStatus(userId: string): Promise<InfrastructureStatus | null> {
    try {
      const integration = await this.getIntegration(userId);
      if (!integration) {
        return null;
      }

      // Get infrastructure resources from GCP
      const computeInstances = await this.gcpService.listComputeInstances();

      return {
        projectId: integration.projectId,
        region: 'us-central1', // Default region, should be from integration config
        services: ['compute', 'storage', 'functions'],
        computeInstances: computeInstances.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get infrastructure status: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return null;
    }
  }

  async updateIntegration(
    integrationId: string,
    data: { isActive: boolean }
  ): Promise<GCPIntegration | null> {
    const integration = await this.prisma.gcpIntegration?.update?.({
      where: { id: integrationId },
      data,
    });
    return integration || null;
  }
}
