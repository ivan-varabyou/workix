import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SalesforceIntegrationService } from './salesforce-integration.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SalesforceService } from './salesforce.service';

describe('SalesforceIntegrationService', () => {
  let service: SalesforceIntegrationService;
  let mockSalesforceService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockSalesforceService = {
      query: vi.fn(),
      createRecord: vi.fn(),
    };
    mockPrisma = {
      salesforceIntegration: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new SalesforceIntegrationService(mockSalesforceService, mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
