/**
 * Database Model Operations Interface
 */

export interface PrismaWhereInput {
  id?: string;
  email?: string;
  userId?: string;
  active?: boolean;
  status?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  [key: string]: string | number | boolean | Date | { gte?: Date; lte?: Date } | undefined;
}

export interface PrismaOrderByInput {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  [key: string]: 'asc' | 'desc' | undefined;
}

export interface PrismaModelData {
  id?: string;
  email?: string;
  name?: string;
  userId?: string;
  url?: string;
  events?: string[];
  active?: boolean;
  secret?: string;
  timeout?: number;
  status?: string;
  webhookId?: string;
  event?: string;
  payload?: Record<string, string | number | boolean | null | Date | string[]>;
  statusCode?: number;
  error?: string;
  attempt?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | string[]
    | Record<string, string | number | boolean | null | Date | string[]>
    | null
    | undefined;
}

export interface IDatabaseModelOperations {
  findUnique?: (args: { where: PrismaWhereInput }) => Promise<PrismaModelData | null>;
  findFirst?: (args: { where: PrismaWhereInput }) => Promise<PrismaModelData | null>;
  findMany?: (args?: { where?: PrismaWhereInput }) => Promise<PrismaModelData[]>;
  create?: (args: { data: PrismaModelData }) => Promise<PrismaModelData>;
  update?: (args: { where: PrismaWhereInput; data: PrismaModelData }) => Promise<PrismaModelData>;
  updateMany?: (args: {
    where: PrismaWhereInput;
    data: PrismaModelData;
  }) => Promise<PrismaModelData>;
  delete?: (args: { where: PrismaWhereInput }) => Promise<PrismaModelData>;
  deleteMany?: (args: { where: PrismaWhereInput }) => Promise<PrismaModelData>;
  count?: (args?: { where?: PrismaWhereInput }) => Promise<number>;
}

/**
 * Database Adapter Interface
 */
export interface IDatabaseAdapter {
  user: IDatabaseModelOperations & {
    findUnique: (args: {
      where: { id?: string; email?: string };
    }) => Promise<PrismaModelData | null>;
    findMany: (args?: {
      where?: PrismaWhereInput;
      orderBy?: PrismaOrderByInput;
      take?: number;
      skip?: number;
    }) => Promise<PrismaModelData[]>;
    create: (args: { data: PrismaModelData }) => Promise<PrismaModelData>;
    update: (args: { where: { id: string }; data: PrismaModelData }) => Promise<PrismaModelData>;
    delete: (args: { where: { id: string } }) => Promise<PrismaModelData>;
    count: (args?: { where?: PrismaWhereInput }) => Promise<number>;
  };

  socialAccount: IDatabaseModelOperations;
  phoneOtp: IDatabaseModelOperations;
  emailVerification: IDatabaseModelOperations;
  userProfile: IDatabaseModelOperations;
  pipeline: IDatabaseModelOperations;
  execution: IDatabaseModelOperations;
  role: IDatabaseModelOperations;
  permission: IDatabaseModelOperations;
  userRole: IDatabaseModelOperations;
  webhook: IDatabaseModelOperations;
  webhookEvent: IDatabaseModelOperations;
  integrationProvider: IDatabaseModelOperations;
  integrationEvent: IDatabaseModelOperations;

  [key: string]: IDatabaseModelOperations;
}
