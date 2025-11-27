import { Injectable, Logger } from '@nestjs/common';

import { SALESFORCE_DEFAULT_VALUES } from '../constants/salesforce.constants';
import type {
  SalesforceApiResponse,
  SalesforceFlowInput,
  SalesforceFlowResponse,
  SalesforceOrgInfo,
  SalesforceQueryResult,
  SalesforceRecord,
} from '../types/salesforce-api-types';

// Re-export types for backward compatibility
export type SalesforceQueryResponse = SalesforceQueryResult<SalesforceRecord>;
export type SalesforceCreateResponse = SalesforceApiResponse<{ id: string }>;
export type SalesforceUpdateResponse = SalesforceApiResponse<{ id: string }>;
export type SalesforceDeleteResponse = SalesforceApiResponse<{ id: string }>;

@Injectable()
export class SalesforceService {
  private readonly logger = new Logger(SalesforceService.name);

  async getRecords(objectType: string, _query?: string): Promise<SalesforceQueryResponse> {
    this.logger.log(`Querying Salesforce: ${objectType}`);
    return { records: [], totalSize: 0, done: true };
  }

  async createRecord(
    objectType: string,
    _fields: Record<string, string | number | boolean | null | undefined>
  ): Promise<SalesforceCreateResponse> {
    this.logger.log(`Creating Salesforce record: ${objectType}`);
    return { id: 'sf-' + Date.now(), success: true };
  }

  async updateRecord(
    objectType: string,
    recordId: string,
    _fields: Record<string, string | number | boolean | null | undefined>
  ): Promise<SalesforceUpdateResponse> {
    this.logger.log(`Updating Salesforce record: ${objectType}/${recordId}`);
    return { id: recordId, success: true };
  }

  async deleteRecord(objectType: string, recordId: string): Promise<SalesforceDeleteResponse> {
    this.logger.log(`Deleting Salesforce record: ${objectType}/${recordId}`);
    return { id: recordId, success: true };
  }

  async executeFlow(flowName: string, input: SalesforceFlowInput): Promise<SalesforceFlowResponse> {
    this.logger.log(`Executing Salesforce Flow: ${flowName}`);
    return { flowName, status: 'Finished Successfully', output: input };
  }

  async getOrgInfo(): Promise<SalesforceOrgInfo> {
    this.logger.log('Getting Salesforce org info');
    return {
      orgName: SALESFORCE_DEFAULT_VALUES.ORG_NAME,
      edition: SALESFORCE_DEFAULT_VALUES.EDITION,
      apiVersion: SALESFORCE_DEFAULT_VALUES.API_VERSION,
    };
  }
}
