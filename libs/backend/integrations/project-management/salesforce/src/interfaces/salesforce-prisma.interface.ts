// Prisma service interfaces for Salesforce integration

export interface SalesforceIntegration {
  id: string;
  userId: string;
  instanceUrl: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesforceIntegrationCreateData {
  userId: string;
  instanceUrl: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  isActive: boolean;
}

export interface SalesforceIntegrationWhereInput {
  userId?: string;
  isActive?: boolean;
}

export interface SalesforcePrismaService {
  salesforceIntegration?: {
    create: (args: { data: SalesforceIntegrationCreateData }) => Promise<SalesforceIntegration>;
    findFirst: (args?: {
      where?: SalesforceIntegrationWhereInput;
    }) => Promise<SalesforceIntegration | null>;
    update: (args: {
      where: { id: string };
      data: { isActive: boolean };
    }) => Promise<SalesforceIntegration>;
  };
}
