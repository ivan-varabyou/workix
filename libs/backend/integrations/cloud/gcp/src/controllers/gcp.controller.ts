import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CreateGCPIntegrationDto,
  ExecuteQueryDto,
  InvokeFunctionDto,
  UploadToStorageDto,
} from '../interfaces/gcp-dto.interface';
import { GCPIntegration } from '../interfaces/gcp-prisma.interface';
import { GCPService } from '../services/gcp.service';
import { GCPIntegrationService } from '../services/gcp-integration.service';
import type {
  BigQueryResult,
  CloudFunctionInvocationResult,
  CloudStorageUploadResult,
  ComputeInstance,
  InfrastructureStatus,
} from '../types/gcp-api-types';

@ApiTags('gcp-integration')
@Controller('gcp')
export class GCPController {
  constructor(
    private readonly gcpIntegrationService: GCPIntegrationService,
    private readonly gcpService: GCPService
  ) {}

  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create GCP integration' })
  async createIntegration(
    @Body() dto: CreateGCPIntegrationDto
  ): Promise<GCPIntegration | { userId: string; projectId: string; isActive: boolean }> {
    return await this.gcpIntegrationService.createIntegration('current-user-id', dto.projectId);
  }

  @Get('integration')
  @ApiOperation({ summary: 'Get GCP integration' })
  async getIntegration(): Promise<GCPIntegration | null> {
    return await this.gcpIntegrationService.getIntegration('current-user-id');
  }

  @Post('storage/upload')
  @HttpCode(201)
  @ApiOperation({ summary: 'Upload to Cloud Storage' })
  async uploadToStorage(@Body() dto: UploadToStorageDto): Promise<CloudStorageUploadResult> {
    return await this.gcpIntegrationService.uploadFile(
      'current-user-id',
      dto.bucket,
      dto.name,
      Buffer.from(dto.data || '')
    );
  }

  @Post('cloudfunctions/invoke')
  @HttpCode(200)
  @ApiOperation({ summary: 'Invoke Cloud Function' })
  async invokeFunction(@Body() dto: InvokeFunctionDto): Promise<CloudFunctionInvocationResult> {
    return await this.gcpIntegrationService.executeFunction(
      'current-user-id',
      dto.functionName,
      dto.payload
    );
  }

  @Get('compute/instances')
  @ApiOperation({ summary: 'List Compute Engine instances' })
  async getInstances(): Promise<ComputeInstance[]> {
    return await this.gcpService.getComputeInstances();
  }

  @Post('bigquery/query')
  @HttpCode(200)
  @ApiOperation({ summary: 'Execute BigQuery' })
  async executeQuery(@Body() dto: ExecuteQueryDto): Promise<BigQueryResult> {
    return await this.gcpService.queryBigQuery(dto.query);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get GCP infrastructure status' })
  async getStatus(): Promise<InfrastructureStatus | null> {
    return await this.gcpIntegrationService.getInfrastructureStatus('current-user-id');
  }

  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate GCP integration' })
  async deactivateIntegration(
    @Param('integrationId') integrationId: string
  ): Promise<{ message: string }> {
    await this.gcpIntegrationService.updateIntegration(integrationId, { isActive: false });
    return { message: 'Integration deactivated successfully' };
  }
}
