import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CreateAzureIntegrationDto,
  ExecuteQueryDto,
  InvokeFunctionDto,
  UploadToStorageDto,
} from '../interfaces/azure-dto.interface';
import { AzureIntegration } from '../interfaces/azure-prisma.interface';
import { AzureService } from '../services/azure.service';
import { AzureIntegrationService } from '../services/azure-integration.service';
import type {
  BlobUploadResult,
  CosmosQueryResult,
  FunctionInvocationResult,
  InfrastructureStatus,
  VirtualMachine,
} from '../types/azure-api-types';

@ApiTags('azure-integration')
@Controller('azure')
export class AzureController {
  constructor(
    private readonly azureIntegrationService: AzureIntegrationService,
    private readonly azureService: AzureService
  ) {}

  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Azure integration' })
  async createIntegration(
    @Body() dto: CreateAzureIntegrationDto
  ): Promise<AzureIntegration | { userId: string; subscriptionId: string; isActive: boolean }> {
    return await this.azureIntegrationService.createIntegration(
      'current-user-id',
      dto.subscriptionId
    );
  }

  @Get('integration')
  @ApiOperation({ summary: 'Get Azure integration' })
  async getIntegration(): Promise<AzureIntegration | null> {
    return await this.azureIntegrationService.getIntegration('current-user-id');
  }

  @Post('storage/upload')
  @HttpCode(201)
  @ApiOperation({ summary: 'Upload to Azure Blob Storage' })
  async uploadToStorage(@Body() dto: UploadToStorageDto): Promise<BlobUploadResult> {
    return await this.azureIntegrationService.uploadFile(
      'current-user-id',
      dto.container,
      dto.blob,
      Buffer.from(dto.data || '')
    );
  }

  @Post('functions/invoke')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invoke Azure Function' })
  async invokeFunction(@Body() dto: InvokeFunctionDto): Promise<FunctionInvocationResult> {
    return await this.azureIntegrationService.executeFunction(
      'current-user-id',
      dto.functionName,
      dto.payload
    );
  }

  @Get('compute/vms')
  @ApiOperation({ summary: 'List Virtual Machines' })
  async getVMs(): Promise<VirtualMachine[]> {
    return await this.azureService.getVirtualMachines();
  }

  @Post('cosmosdb/query')
  @HttpCode(200)
  @ApiOperation({ summary: 'Execute Cosmos DB query' })
  async executeQuery(@Body() dto: ExecuteQueryDto): Promise<CosmosQueryResult> {
    return await this.azureService.executeCosmosQuery(dto.query);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Azure infrastructure status' })
  async getStatus(): Promise<InfrastructureStatus | null> {
    return await this.azureIntegrationService.getInfrastructureStatus('current-user-id');
  }

  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate Azure integration' })
  async deactivateIntegration(
    @Param('integrationId') integrationId: string
  ): Promise<{ message: string }> {
    await this.azureIntegrationService.updateIntegration(integrationId, { isActive: false });
    return { message: 'Integration deactivated successfully' };
  }
}
