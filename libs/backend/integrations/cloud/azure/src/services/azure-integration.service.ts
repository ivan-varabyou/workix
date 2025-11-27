import { Inject, Injectable, Logger } from '@nestjs/common';

import { AzureIntegration, AzurePrismaService } from '../interfaces/azure-prisma.interface';
import {
  BlobUploadResult,
  FunctionInvocationResult,
  FunctionPayload,
  InfrastructureStatus,
} from '../types/azure-api-types';
import { AzureService } from './azure.service';

@Injectable()
export class AzureIntegrationService {
  private readonly logger = new Logger(AzureIntegrationService.name);

  constructor(
    private readonly azureService: AzureService,
    @Inject('PrismaService') private prisma: AzurePrismaService
  ) {}

  async createIntegration(
    userId: string,
    subscriptionId: string
  ): Promise<AzureIntegration | { userId: string; subscriptionId: string; isActive: boolean }> {
    const integration = await this.prisma.azureIntegration?.create?.({
      data: { userId, subscriptionId, isActive: true },
    });
    this.logger.log(`Azure integration created for user ${userId}`);
    return integration || { userId, subscriptionId, isActive: true };
  }

  async getIntegration(userId: string): Promise<AzureIntegration | null> {
    const integration = await this.prisma.azureIntegration?.findFirst?.({
      where: { userId, isActive: true },
    });
    return integration || null;
  }

  async uploadFile(
    userId: string,
    container: string,
    blob: string,
    data: Buffer
  ): Promise<BlobUploadResult> {
    const integration = await this.getIntegration(userId);
    if (!integration) throw new Error('Azure integration not found');
    return await this.azureService.uploadToBlob(container, blob, data);
  }

  async executeFunction(
    userId: string,
    functionName: string,
    payload: FunctionPayload
  ): Promise<FunctionInvocationResult> {
    const integration = await this.getIntegration(userId);
    if (!integration) throw new Error('Azure integration not found');
    return await this.azureService.invokeFunction(functionName, payload);
  }

  async getInfrastructureStatus(userId: string): Promise<InfrastructureStatus | null> {
    try {
      const integration = await this.getIntegration(userId);
      if (!integration) {
        return null;
      }

      // Get infrastructure resources from Azure
      await this.azureService.listResourceGroups();
      const virtualMachines = await this.azureService.listVirtualMachines();

      return {
        resourceGroup: integration.subscriptionId,
        region: 'eastus', // Default region, should be from integration config
        services: ['compute', 'storage', 'functions'],
        virtualMachines: virtualMachines.length,
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
  ): Promise<AzureIntegration | null> {
    const integration = await this.prisma.azureIntegration?.update?.({
      where: { id: integrationId },
      data,
    });
    return integration || null;
  }
}
