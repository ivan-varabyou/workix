// Integration Event interfaces

import { BasePayload } from './integration-payload.interface';

export interface IntegrationEventData {
  providerId: string;
  type: string;
  status: 'SUCCESS' | 'FAILED';
  latencyMs?: number;
  cost?: number;
  metadata?: BasePayload;
}

export interface IntegrationEvent extends IntegrationEventData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationEventCreateArgs {
  data: IntegrationEventData;
}

export interface IntegrationEventFindManyArgs {
  where?: {
    providerId?: string;
    type?: string;
    status?: 'SUCCESS' | 'FAILED';
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
  };
  orderBy?: {
    createdAt?: 'asc' | 'desc';
  };
  take?: number;
  skip?: number;
}

export interface IntegrationEventCountArgs {
  where?: IntegrationEventFindManyArgs['where'];
}

export interface IntegrationEventPrismaService {
  integrationEvent: {
    create: (args: IntegrationEventCreateArgs) => Promise<IntegrationEvent>;
    findMany: (args?: IntegrationEventFindManyArgs) => Promise<IntegrationEvent[]>;
    count: (args?: IntegrationEventCountArgs) => Promise<number>;
  };
}
