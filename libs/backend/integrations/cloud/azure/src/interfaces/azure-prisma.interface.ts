// Prisma service interfaces for Azure integration

import { PrismaClient } from '@prisma/client';

export interface AzurePrismaService extends PrismaClient {
  azureIntegration?: {
    create?: (args: { data: AzureIntegrationCreateData }) => Promise<AzureIntegration>;
    findFirst?: (args: {
      where: { userId: string; isActive?: boolean };
    }) => Promise<AzureIntegration | null>;
    update?: (args: {
      where: { id: string };
      data: { isActive: boolean };
    }) => Promise<AzureIntegration>;
  };
}

export interface AzureIntegration {
  id: string;
  userId: string;
  subscriptionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AzureIntegrationCreateData {
  userId: string;
  subscriptionId: string;
  isActive: boolean;
}
