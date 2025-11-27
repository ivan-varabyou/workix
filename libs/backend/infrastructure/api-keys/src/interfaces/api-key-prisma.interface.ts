// Prisma service interfaces for API keys

export interface ApiKeyCreateArgs {
  data: {
    userId: string;
    name: string;
    key: string;
    secret: string;
    permissions: string[];
    rateLimit: number;
    expiresAt?: Date;
    active: boolean;
  };
}

export interface ApiKeyUpdateArgs {
  where: { id: string };
  data: {
    name?: string;
    permissions?: string[];
    rateLimit?: number;
    expiresAt?: Date;
    active?: boolean;
    lastUsedAt?: Date;
  };
}

export interface ApiKeyDeleteArgs {
  where: { id: string };
}

export interface ApiKeyFindUniqueArgs {
  where: { id: string } | { key: string };
}

export interface ApiKeyFindManyArgs {
  where?: {
    userId?: string;
    active?: boolean;
  };
  orderBy?: {
    createdAt?: 'asc' | 'desc';
  };
  take?: number;
}

export interface ApiKeyCountArgs {
  where?: {
    userId?: string;
    active?: boolean;
    expiresAt?: {
      gte?: Date;
      lte?: Date;
    };
  };
}

export interface ApiKeyUsageCreateArgs {
  data: {
    apiKeyId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    ipAddress: string;
    userAgent: string;
  };
}

export interface ApiKeyUsageFindManyArgs {
  where?: {
    apiKeyId?: string;
    timestamp?: {
      gte?: Date;
      lte?: Date;
    };
  };
  orderBy?: {
    timestamp?: 'asc' | 'desc';
  };
  take?: number;
}

export interface ApiKeyUsageCountArgs {
  where?: {
    apiKeyId?: string;
    timestamp?: {
      gte?: Date;
      lte?: Date;
    };
  };
}

export interface ApiKeyPrismaService {
  apiKey: {
    create: (args: ApiKeyCreateArgs) => Promise<ApiKey>;
    update: (args: ApiKeyUpdateArgs) => Promise<ApiKey>;
    delete: (args: ApiKeyDeleteArgs) => Promise<ApiKey>;
    findUnique: (args: ApiKeyFindUniqueArgs) => Promise<ApiKey | null>;
    findMany: (args?: ApiKeyFindManyArgs) => Promise<ApiKey[]>;
    count: (args?: ApiKeyCountArgs) => Promise<number>;
  };
  apiKeyUsage: {
    create: (args: ApiKeyUsageCreateArgs) => Promise<ApiKeyUsage>;
    findMany: (args?: ApiKeyUsageFindManyArgs) => Promise<ApiKeyUsage[]>;
    count: (args?: ApiKeyUsageCountArgs) => Promise<number>;
  };
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  rateLimit: number;
  expiresAt?: Date | null;
  lastUsedAt?: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
