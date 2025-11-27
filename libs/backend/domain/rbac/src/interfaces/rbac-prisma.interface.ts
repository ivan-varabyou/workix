// Prisma service interfaces for RBAC module

import { PrismaClient } from '@prisma/client';

export type RBACPrismaService = PrismaClient & {
  role: {
    findUnique: (args: { where: { id?: string; name?: string } }) => Promise<Role | null>;
    findFirst: (args: { where: { name?: string; id?: string } }) => Promise<Role | null>;
    findMany: (args?: {
      where?: {
        name?: string;
        id?: string;
        isActive?: boolean;
      };
      orderBy?: {
        level?: 'asc' | 'desc';
        name?: 'asc' | 'desc';
      };
      include?: {
        permissions?: boolean;
      };
      take?: number;
    }) => Promise<Role[]>;
    create: (args: { data: RoleCreateData; include?: { permissions?: boolean } }) => Promise<Role>;
    update: (args: {
      where: { id: string };
      data: RoleUpdateData;
      include?: { permissions?: boolean };
    }) => Promise<Role>;
    delete: (args: { where: { id: string } }) => Promise<Role>;
    count: (args?: { where?: { name?: string; id?: string } }) => Promise<number>;
  };
  permission: {
    findUnique: (args: { where: { id?: string; name?: string } }) => Promise<Permission | null>;
    findFirst: (args: { where: { name?: string; id?: string } }) => Promise<Permission | null>;
    findMany: (args?: {
      where?: {
        name?: string;
        id?: string;
        resource?: string;
        isActive?: boolean;
      };
      orderBy?: {
        resource?: 'asc' | 'desc';
        name?: 'asc' | 'desc';
      };
      take?: number;
    }) => Promise<Permission[]>;
    create: (args: { data: PermissionCreateData }) => Promise<Permission>;
    update: (args: { where: { id: string }; data: PermissionUpdateData }) => Promise<Permission>;
    delete: (args: { where: { id: string } }) => Promise<Permission>;
    count: (args?: { where?: { name?: string; resource?: string } }) => Promise<number>;
  };
  user: {
    findUnique: (args: {
      where: { id: string };
      include?: {
        roles?: {
          include?: {
            permissions?: boolean;
          };
        };
      };
    }) => Promise<UserWithRoles | null>;
    update: (args: {
      where: { id: string };
      data: { roles?: { connect?: Array<{ id: string }> } };
    }) => Promise<UserWithRoles>;
  };
  userRole: {
    findUnique: (args: { where: { id: string } }) => Promise<UserRole | null>;
    findFirst: (args: { where: { userId?: string; roleId?: string } }) => Promise<UserRole | null>;
    findMany: (args?: {
      where?: {
        userId?: string;
        roleId?: string;
      };
      include?: {
        role?: {
          include?: {
            permissions?: boolean;
          };
        };
      };
      orderBy?: {
        role?: {
          level?: 'asc' | 'desc';
        };
      };
      take?: number;
    }) => Promise<UserRole[]>;
    create: (args: {
      data: UserRoleCreateData;
      include?: {
        role?: {
          include?: {
            permissions?: boolean;
          };
        };
      };
    }) => Promise<UserRole>;
    update: (args: {
      where: { id: string };
      data: UserRoleUpdateData;
      include?: {
        role?: {
          include?: {
            permissions?: boolean;
          };
        };
      };
    }) => Promise<UserRole>;
    delete: (args: { where: { id: string } }) => Promise<UserRole>;
    deleteMany: (args: {
      where: { userId?: string; roleId?: string };
    }) => Promise<{ count: number }>;
    count: (args?: { where?: { userId?: string; roleId?: string } }) => Promise<number>;
  };
};

export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  resource?: string | null;
  action?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionCreateData {
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

export interface PermissionUpdateData {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  level?: number | null;
  isActive: boolean;
  isSystem: boolean;
  permissions?: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleCreateData {
  name: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  isSystem?: boolean;
  permissions?: {
    connect?: Array<{ id: string }>;
  };
}

export interface RoleUpdateData {
  name?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
  isSystem?: boolean;
  permissions?: {
    connect?: Array<{ id: string }>;
    disconnect?: Array<{ id: string }>;
  };
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  assignedBy?: string | null;
  expiresAt?: Date | null;
  role?: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleCreateData {
  userId: string;
  roleId: string;
  assignedBy?: string;
  expiresAt?: Date | null;
}

export interface UserRoleUpdateData {
  userId?: string;
  roleId?: string;
  assignedBy?: string;
  expiresAt?: Date | null;
}

export interface UserWithRoles {
  id: string;
  email: string;
  name: string | null;
  roles?: Array<{
    id: string;
    name: string;
    permissions?: Permission[];
  }>;
}
