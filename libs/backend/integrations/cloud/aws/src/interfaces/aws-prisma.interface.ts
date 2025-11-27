// Prisma service interfaces for AWS integration

import { PrismaClient } from '@prisma/client';

import { AWSIntegrationRecord } from '../interfaces/aws-config.interface';

export interface AWSPrismaService extends PrismaClient {
  awsIntegration: {
    create: (args: { data: AWSIntegrationCreateData }) => Promise<AWSIntegrationRecord>;
    update: (args: {
      where: { id: string };
      data: AWSIntegrationUpdateData;
    }) => Promise<AWSIntegrationRecord>;
    findFirst: (args?: {
      where?: { userId?: string; isActive?: boolean };
    }) => Promise<AWSIntegrationRecord | null>;
  };
}

export interface AWSIntegrationCreateData {
  userId: string;
  region: string;
  services: string;
  isActive?: boolean;
}

export interface AWSIntegrationUpdateData {
  isActive?: boolean;
  region?: string;
  services?: string;
}
