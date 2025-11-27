import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CreateIntegrationDto,
  CreateRecordDto,
  ExecuteFlowDto,
  QueryRecordsDto,
  UpdateRecordDto,
} from '../dto/salesforce.dto';
import { SalesforceIntegration } from '../interfaces/salesforce-prisma.interface';
import {
  SalesforceCreateResponse,
  SalesforceDeleteResponse,
  SalesforceQueryResponse,
  SalesforceService,
  SalesforceUpdateResponse,
} from '../services/salesforce.service';
import { SalesforceIntegrationService } from '../services/salesforce-integration.service';
import type { SalesforceFlowResponse, SalesforceOrgInfo } from '../types/salesforce-api-types';

@ApiTags('salesforce-integration')
@Controller('salesforce')
export class SalesforceController {
  constructor(
    private readonly sfIntegrationService: SalesforceIntegrationService,
    private readonly sfService: SalesforceService
  ) {}

  @Post('integrate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Salesforce integration' })
  async createIntegration(@Body() dto: CreateIntegrationDto): Promise<SalesforceIntegration> {
    if (!dto.instanceUrl) {
      throw new Error('Instance URL is required');
    }
    return await this.sfIntegrationService.createIntegration('current-user-id', dto.instanceUrl);
  }

  @Get('integration')
  @ApiOperation({ summary: 'Get Salesforce integration' })
  async getIntegration(): Promise<SalesforceIntegration | null> {
    return await this.sfIntegrationService.getIntegration('current-user-id');
  }

  @Post('records/query')
  @HttpCode(200)
  @ApiOperation({ summary: 'Query Salesforce records' })
  async queryRecords(@Body() dto: QueryRecordsDto): Promise<SalesforceQueryResponse> {
    if (!dto.objectType) {
      throw new Error('Object type is required');
    }
    return await this.sfIntegrationService.queryRecords(
      'current-user-id',
      dto.objectType,
      dto.query
    );
  }

  @Post('records')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create Salesforce record' })
  async createRecord(@Body() dto: CreateRecordDto): Promise<SalesforceCreateResponse> {
    if (!dto.objectType || !dto.fields) {
      throw new Error('Object type and fields are required');
    }
    return await this.sfIntegrationService.createRecord(
      'current-user-id',
      dto.objectType,
      dto.fields
    );
  }

  @Put('records/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update Salesforce record' })
  async updateRecord(
    @Param('id') recordId: string,
    @Body() dto: UpdateRecordDto
  ): Promise<SalesforceUpdateResponse> {
    if (!dto.objectType || !dto.fields) {
      throw new Error('Object type and fields are required');
    }
    return await this.sfService.updateRecord(dto.objectType, recordId, dto.fields);
  }

  @Delete('records/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete Salesforce record' })
  async deleteRecord(
    @Param('id') recordId: string,
    @Body() dto: { objectType: string }
  ): Promise<SalesforceDeleteResponse> {
    return await this.sfService.deleteRecord(dto.objectType, recordId);
  }

  @Post('flows/execute')
  @HttpCode(200)
  @ApiOperation({ summary: 'Execute Salesforce Flow' })
  async executeFlow(@Body() dto: ExecuteFlowDto): Promise<SalesforceFlowResponse> {
    if (!dto.flowName) {
      throw new Error('Flow name is required');
    }
    // Method not implemented yet
    throw new Error('ExecuteFlow is not implemented');
  }

  @Get('org-info')
  @ApiOperation({ summary: 'Get Salesforce org information' })
  async getOrgInfo(): Promise<SalesforceOrgInfo> {
    // Method not implemented yet
    throw new Error('GetOrgStats is not implemented');
  }

  @Delete('integration/:integrationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate Salesforce integration' })
  async deactivateIntegration(
    @Param('integrationId') integrationId: string
  ): Promise<{ message: string }> {
    // Method not implemented yet - use updateIntegration instead
    const integration = await this.sfIntegrationService.getIntegration('current-user-id');
    if (integration) {
      // Update integration to inactive
      await this.sfIntegrationService.updateIntegration(integrationId, { isActive: false });
    }
    return { message: 'Integration deactivated successfully' };
  }
}
