// Provider Registry interfaces

export interface ProviderCredential {
  id: string;
  providerId: string;
  clientId?: string;
  clientSecretEnc?: string;
  refreshTokenEnc?: string;
  accessTokenEnc?: string;
  extra?: Record<string, unknown>;
}

export interface ProviderConfig {
  id: string;
  providerId: string;
  defaults?: Record<string, unknown>;
  weights?: { quality?: number; speed?: number; cost?: number };
  isActive: boolean;
}

export interface IntegrationProviderData {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  credentials: Record<string, unknown>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Array<Record<string, unknown>>;
  take?: number;
  skip?: number;
}

export interface PrismaFindUniqueArgs {
  where: { id: string } | Record<string, unknown>;
  select?: Record<string, boolean>;
}

/**
 * Type guard to check if value is Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return true;
}

export interface PrismaUpsertArgs {
  where: { id: string };
  create: Record<string, unknown>;
  update: Record<string, unknown>;
}

export interface PrismaUpdateArgs {
  where: { id: string };
  data: Record<string, unknown>;
}

export interface PrismaCreateArgs {
  data: Record<string, unknown>;
}

export interface PrismaFindFirstArgs {
  where?: Record<string, unknown>;
  select?: Record<string, boolean>;
}

export interface ProviderRegistryPrismaService {
  integrationProvider: {
    findMany: (args?: PrismaFindManyArgs) => Promise<IntegrationProviderData[]>;
    findUnique: (args: PrismaFindUniqueArgs) => Promise<IntegrationProviderData | null>;
    upsert: (args: PrismaUpsertArgs) => Promise<IntegrationProviderData>;
    update: (args: PrismaUpdateArgs) => Promise<IntegrationProviderData>;
  };
  integrationCredential?: {
    findFirst: (args?: PrismaFindFirstArgs) => Promise<Record<string, unknown> | null>;
    create: (args: PrismaCreateArgs) => Promise<Record<string, unknown>>;
    update: (args: PrismaUpdateArgs) => Promise<Record<string, unknown>>;
  };
  integrationConfig?: {
    findFirst: (args?: PrismaFindFirstArgs) => Promise<Record<string, unknown> | null>;
    create: (args: PrismaCreateArgs) => Promise<Record<string, unknown>>;
    update: (args: PrismaUpdateArgs) => Promise<Record<string, unknown>>;
  };
  integrationEvent?: {
    aggregate: (args: {
      where: {
        providerId: string;
        timestamp: { gte: Date };
      };
      _count: { id: boolean };
      _avg: { latencyMs: boolean };
      _sum: { success: boolean };
    }) => Promise<{
      _count: { id: number };
      _avg: { latencyMs: number | null };
      _sum: { success: number | null };
    }>;
    count: (args: {
      where: {
        providerId: string;
        timestamp: { gte: Date };
        success?: boolean;
      };
    }) => Promise<number>;
  };
}
