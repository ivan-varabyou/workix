import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  SalesforceIntegration,
  SalesforcePrismaService,
} from '../interfaces/salesforce-prisma.interface';
import { SalesforceCreateResponse, SalesforceQueryResponse } from '../services/salesforce.service';
import { SalesforceService } from './salesforce.service';

@Injectable()
export class SalesforceIntegrationService {
  private readonly logger = new Logger(SalesforceIntegrationService.name);

  constructor(
    private readonly sfService: SalesforceService,
    @Inject('PrismaService') private prisma: SalesforcePrismaService
  ) {}

  async createIntegration(userId: string, instanceUrl: string): Promise<SalesforceIntegration> {
    const integration = await this.prisma.salesforceIntegration?.create?.({
      data: { userId, instanceUrl, isActive: true },
    });
    this.logger.log(`Salesforce integration created for user ${userId}`);
    if (!integration) {
      throw new Error('Failed to create Salesforce integration');
    }
    return integration;
  }

  async getIntegration(userId: string): Promise<SalesforceIntegration | null> {
    const integration = await this.prisma.salesforceIntegration?.findFirst?.({
      where: { userId, isActive: true },
    });
    return integration || null;
  }

  async queryRecords(
    userId: string,
    objectType: string,
    query?: string
  ): Promise<SalesforceQueryResponse> {
    const integration = await this.getIntegration(userId);
    if (!integration) throw new Error('Salesforce integration not found');
    return await this.sfService.getRecords(objectType, query);
  }

  async createRecord(
    userId: string,
    objectType: string,
    fields: Record<string, string | number | boolean | null | undefined>
  ): Promise<SalesforceCreateResponse> {
    const integration = await this.getIntegration(userId);
    if (!integration) throw new Error('Salesforce integration not found');
    return await this.sfService.createRecord(objectType, fields);
  }

  async updateIntegration(
    integrationId: string,
    data: { isActive: boolean }
  ): Promise<SalesforceIntegration | null> {
    const integration = await this.prisma.salesforceIntegration?.update?.({
      where: { id: integrationId },
      data,
    });
    return integration || null;
  }
}
