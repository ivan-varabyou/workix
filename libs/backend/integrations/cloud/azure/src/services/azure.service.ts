import { Injectable, Logger } from '@nestjs/common';

import type {
  BlobUploadResult,
  CosmosQueryResult,
  FunctionInvocationResult,
  FunctionPayload,
  ResourceGroupInfo,
  VirtualMachine,
} from '../types/azure-api-types';
import {
  isBlobUploadResult,
  isCosmosQueryResult,
  isFunctionInvocationResult,
  isResourceGroupInfo,
  isVirtualMachine,
} from '../types/azure-api-types';

@Injectable()
export class AzureService {
  private readonly logger = new Logger(AzureService.name);

  async uploadToBlob(container: string, blob: string, data: Buffer): Promise<BlobUploadResult> {
    this.logger.log(`Uploading to Azure Blob: ${container}/${blob}`);
    const result: BlobUploadResult = {
      container,
      blob,
      size: data.length,
      url: `https://storage.azure.com/${container}/${blob}`,
    };
    if (!isBlobUploadResult(result)) {
      throw new Error('Invalid blob upload result format');
    }
    return result;
  }

  async invokeFunction(
    functionName: string,
    payload: FunctionPayload
  ): Promise<FunctionInvocationResult> {
    this.logger.log(`Invoking Azure Function: ${functionName}`);
    const result: FunctionInvocationResult = {
      functionName,
      executedAt: new Date(),
      response: payload,
    };
    if (!isFunctionInvocationResult(result)) {
      throw new Error('Invalid function invocation result format');
    }
    return result;
  }

  async getVirtualMachines(): Promise<VirtualMachine[]> {
    this.logger.log('Listing Azure Virtual Machines');
    const vms: VirtualMachine[] = [{ name: 'vm-1', status: 'Running', size: 'Standard_B1s' }];
    return vms.filter((vm): vm is VirtualMachine => isVirtualMachine(vm));
  }

  async executeCosmosQuery(query: string): Promise<CosmosQueryResult> {
    this.logger.log('Executing Cosmos DB query');
    const result: CosmosQueryResult = { query, items: 500, executedAt: new Date() };
    if (!isCosmosQueryResult(result)) {
      throw new Error('Invalid Cosmos query result format');
    }
    return result;
  }

  async getResourceGroupInfo(): Promise<ResourceGroupInfo> {
    this.logger.log('Getting Azure resource group info');
    const info: ResourceGroupInfo = {
      resourceGroup: 'workix-rg',
      region: 'eastus',
      services: ['storage', 'functions', 'compute', 'cosmosdb'],
    };
    if (!isResourceGroupInfo(info)) {
      throw new Error('Invalid resource group info format');
    }
    return info;
  }

  async listResourceGroups(): Promise<ResourceGroupInfo[]> {
    this.logger.log('Listing Azure resource groups');
    return [await this.getResourceGroupInfo()];
  }

  async listVirtualMachines(): Promise<VirtualMachine[]> {
    this.logger.log('Listing Azure Virtual Machines');
    return await this.getVirtualMachines();
  }
}
