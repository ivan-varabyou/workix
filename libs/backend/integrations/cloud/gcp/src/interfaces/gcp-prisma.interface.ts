// Prisma service interfaces for GCP integration

import { PrismaClient } from '@prisma/client';

export interface GCPPrismaService extends PrismaClient {
  gcpIntegration?: {
    create?: (args: { data: GCPIntegrationCreateData }) => Promise<GCPIntegration>;
    findFirst?: (args: {
      where: { userId: string; isActive?: boolean };
    }) => Promise<GCPIntegration | null>;
    update?: (args: {
      where: { id: string };
      data: { isActive: boolean };
    }) => Promise<GCPIntegration>;
  };
}

export interface GCPIntegration {
  id: string;
  userId: string;
  projectId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GCPIntegrationCreateData {
  userId: string;
  projectId: string;
  isActive: boolean;
}
