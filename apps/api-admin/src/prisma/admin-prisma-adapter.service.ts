import { Injectable } from '@nestjs/common';
import type { GatewayPrismaServiceInterface } from '@workix/backend/domain/admin';

import { AdminPrismaService } from './admin-prisma.service';

/**
 * Type guards for Prisma data validation
 */
function isAdminCreateData(data: Record<string, unknown>): data is {
  email: string;
  passwordHash: string;
  role: string;
  name?: string;
} {
  return (
    typeof data.email === 'string' &&
    typeof data.passwordHash === 'string' &&
    typeof data.role === 'string' &&
    (data.name === undefined || typeof data.name === 'string')
  );
}

function isAdminUpdateData(data: Record<string, unknown>): data is {
  email?: string;
  passwordHash?: string;
  role?: string;
  name?: string;
  isActive?: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  ipWhitelistEnabled?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  twoFactorBackupCodes?: string[];
} {
  return (
    (data.email === undefined || typeof data.email === 'string') &&
    (data.passwordHash === undefined || typeof data.passwordHash === 'string') &&
    (data.role === undefined || typeof data.role === 'string') &&
    (data.name === undefined || data.name === null || typeof data.name === 'string') &&
    (data.isActive === undefined || typeof data.isActive === 'boolean') &&
    (data.failedLoginAttempts === undefined || typeof data.failedLoginAttempts === 'number') &&
    (data.lockedUntil === undefined || data.lockedUntil === null || data.lockedUntil instanceof Date) &&
    (data.lastLoginAt === undefined || data.lastLoginAt === null || data.lastLoginAt instanceof Date) &&
    (data.ipWhitelistEnabled === undefined || typeof data.ipWhitelistEnabled === 'boolean') &&
    (data.twoFactorEnabled === undefined || typeof data.twoFactorEnabled === 'boolean') &&
    (data.twoFactorSecret === undefined || data.twoFactorSecret === null || typeof data.twoFactorSecret === 'string') &&
    (data.twoFactorBackupCodes === undefined || Array.isArray(data.twoFactorBackupCodes))
  );
}

function isAdminIpWhitelistCreateData(data: Record<string, unknown>): data is {
  adminId: string;
  ipAddress: string;
  description?: string;
} {
  return (
    typeof data.adminId === 'string' &&
    typeof data.ipAddress === 'string' &&
    (data.description === undefined || data.description === null || typeof data.description === 'string')
  );
}

function isAdminSessionCreateData(data: Record<string, unknown>): data is {
  adminId: string;
  tokenHash: string;
  refreshTokenHash?: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
} {
  return (
    typeof data.adminId === 'string' &&
    typeof data.tokenHash === 'string' &&
    (data.refreshTokenHash === undefined || data.refreshTokenHash === null || typeof data.refreshTokenHash === 'string') &&
    data.expiresAt instanceof Date &&
    (data.ipAddress === undefined || data.ipAddress === null || typeof data.ipAddress === 'string') &&
    (data.userAgent === undefined || data.userAgent === null || typeof data.userAgent === 'string')
  );
}

function isAuditLogCreateData(data: Record<string, unknown>): data is {
  adminId?: string;
  action: string;
  entityType: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
} {
  return (
    (data.adminId === undefined || data.adminId === null || typeof data.adminId === 'string') &&
    typeof data.action === 'string' &&
    typeof data.entityType === 'string' &&
    (data.resourceType === undefined || data.resourceType === null || typeof data.resourceType === 'string') &&
    (data.resourceId === undefined || data.resourceId === null || typeof data.resourceId === 'string') &&
    (data.details === undefined || data.details === null || (typeof data.details === 'object' && !Array.isArray(data.details))) &&
    (data.changes === undefined || data.changes === null || (typeof data.changes === 'object' && !Array.isArray(data.changes))) &&
    (data.metadata === undefined || data.metadata === null || (typeof data.metadata === 'object' && !Array.isArray(data.metadata))) &&
    (data.ipAddress === undefined || data.ipAddress === null || typeof data.ipAddress === 'string') &&
    (data.userAgent === undefined || data.userAgent === null || typeof data.userAgent === 'string')
  );
}

function isPasswordResetCreateData(data: Record<string, unknown>): data is {
  adminId: string;
  userId?: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date | null;
  ipAddress?: string;
  userAgent?: string;
} {
  return (
    typeof data.adminId === 'string' &&
    (data.userId === undefined || data.userId === null || typeof data.userId === 'string') &&
    typeof data.token === 'string' &&
    data.expiresAt instanceof Date &&
    (data.usedAt === undefined || data.usedAt === null || data.usedAt instanceof Date) &&
    (data.ipAddress === undefined || data.ipAddress === null || typeof data.ipAddress === 'string') &&
    (data.userAgent === undefined || data.userAgent === null || typeof data.userAgent === 'string')
  );
}

function isPasswordResetUpdateData(data: Record<string, unknown>): data is {
  usedAt?: Date | null;
  ipAddress?: string;
  userAgent?: string;
} {
  return (
    (data.usedAt === undefined || data.usedAt === null || data.usedAt instanceof Date) &&
    (data.ipAddress === undefined || data.ipAddress === null || typeof data.ipAddress === 'string') &&
    (data.userAgent === undefined || data.userAgent === null || typeof data.userAgent === 'string')
  );
}

/**
 * Admin Prisma Adapter
 * Adapts AdminPrismaService to GatewayPrismaServiceInterface
 * Maps admin models to gatewayAdmin models for library compatibility
 * Also provides direct access to models for backward compatibility
 */
@Injectable()
export class AdminPrismaAdapterService implements GatewayPrismaServiceInterface {
  constructor(private readonly prisma: AdminPrismaService) {}

  // Direct access to models for backward compatibility
  get admin() {
    return this.prisma.admin;
  }

  get adminSession() {
    return this.prisma.adminSession;
  }

  get adminIpWhitelist() {
    return this.prisma.adminIpWhitelist;
  }

  get auditLog() {
    return this.prisma.auditLog;
  }

  get passwordReset() {
    return this.prisma.passwordReset;
  }

  // Prisma client methods
  get $queryRaw() {
    return this.prisma.$queryRaw;
  }

  get $transaction() {
    return this.prisma.$transaction;
  }

  get gatewayAdmin() {
    return {
      findUnique: async (args: { where: { id: string } | { email: string }; select?: Record<string, unknown> }) => {
        return this.prisma.admin.findUnique(args);
      },
      findFirst: async (args: { where: Record<string, unknown> }) => {
        return this.prisma.admin.findFirst(args);
      },
      create: async (args: { data: Record<string, unknown> }) => {
        if (!isAdminCreateData(args.data)) {
          throw new Error('Invalid admin create data structure');
        }
        const createData: {
          email: string;
          passwordHash: string;
          role: string;
          name?: string;
        } = {
          email: args.data.email,
          passwordHash: args.data.passwordHash,
          role: args.data.role,
        };
        if (args.data.name !== undefined) {
          createData.name = args.data.name;
        }
        return this.prisma.admin.create({
          data: createData,
        });
      },
      update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        if (!isAdminUpdateData(args.data)) {
          throw new Error('Invalid admin update data structure');
        }
        return this.prisma.admin.update({
          where: args.where,
          data: args.data,
        });
      },
      updateMany: async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        if (!isAdminUpdateData(args.data)) {
          throw new Error('Invalid admin update data structure');
        }
        return this.prisma.admin.updateMany({
          where: args.where,
          data: args.data,
        });
      },
      delete: async (args: { where: { id: string } }) => {
        return this.prisma.admin.delete(args);
      },
      deleteMany: async (args: { where: Record<string, unknown> }) => {
        return this.prisma.admin.deleteMany(args);
      },
    };
  }

  get gatewayAdminIpWhitelist() {
    return {
      findFirst: async (args: { where: Record<string, unknown> }) => {
        return this.prisma.adminIpWhitelist.findFirst(args);
      },
      findMany: async (args: {
        where: Record<string, unknown>;
        select?: Record<string, unknown>;
        orderBy?: Record<string, string>;
      }) => {
        return this.prisma.adminIpWhitelist.findMany(args);
      },
      create: async (args: { data: Record<string, unknown> }) => {
        if (!isAdminIpWhitelistCreateData(args.data)) {
          throw new Error('Invalid admin IP whitelist create data structure');
        }
        const createData: {
          adminId: string;
          ipAddress: string;
          description?: string;
        } = {
          adminId: args.data.adminId,
          ipAddress: args.data.ipAddress,
        };
        if (args.data.description !== undefined) {
          createData.description = args.data.description;
        }
        return this.prisma.adminIpWhitelist.create({
          data: createData,
        });
      },
      delete: async (args: { where: { id: string } }) => {
        return this.prisma.adminIpWhitelist.delete(args);
      },
    };
  }

  get gatewayAdminSession() {
    return {
      findMany: async (args: {
        where: Record<string, unknown>;
        select?: Record<string, unknown>;
        orderBy?: Record<string, string>;
      }) => {
        return this.prisma.adminSession.findMany(args);
      },
      findFirst: async (args: { where: Record<string, unknown> }) => {
        return this.prisma.adminSession.findFirst(args);
      },
      create: async (args: { data: Record<string, unknown> }) => {
        if (!isAdminSessionCreateData(args.data)) {
          throw new Error('Invalid admin session create data structure');
        }
        const createData: {
          adminId: string;
          tokenHash: string;
          refreshTokenHash?: string;
          expiresAt: Date;
          ipAddress?: string;
          userAgent?: string;
        } = {
          adminId: args.data.adminId,
          tokenHash: args.data.tokenHash,
          expiresAt: args.data.expiresAt,
        };
        if (args.data.refreshTokenHash !== undefined) {
          createData.refreshTokenHash = args.data.refreshTokenHash;
        }
        if (args.data.ipAddress !== undefined) {
          createData.ipAddress = args.data.ipAddress;
        }
        if (args.data.userAgent !== undefined) {
          createData.userAgent = args.data.userAgent;
        }
        return this.prisma.adminSession.create({
          data: createData,
        });
      },
      delete: async (args: { where: { id: string } }) => {
        return this.prisma.adminSession.delete(args);
      },
      deleteMany: async (args: { where: Record<string, unknown> }) => {
        return this.prisma.adminSession.deleteMany(args);
      },
    };
  }

  get gatewayAuditLog() {
    return {
      create: async (args: { data: Record<string, unknown> }) => {
        if (!isAuditLogCreateData(args.data)) {
          throw new Error('Invalid audit log create data structure');
        }
        // Build data object with only defined fields
        const createData: {
          action: string;
          entityType: string;
          adminId?: string | undefined;
          resourceType?: string | undefined;
          resourceId?: string | undefined;
          details?: Record<string, unknown> | null | undefined;
          changes?: Record<string, unknown> | null | undefined;
          metadata?: Record<string, unknown> | null | undefined;
          ipAddress?: string | null | undefined;
          userAgent?: string | null | undefined;
        } = {
          action: args.data.action,
          entityType: args.data.entityType,
        };
        if (args.data.adminId !== undefined && args.data.adminId !== null) {
          createData.adminId = args.data.adminId;
        }
        if (args.data.resourceType !== undefined && args.data.resourceType !== null) {
          createData.resourceType = args.data.resourceType;
        }
        if (args.data.resourceId !== undefined && args.data.resourceId !== null) {
          createData.resourceId = args.data.resourceId;
        }
        if (args.data.details !== undefined && args.data.details !== null) {
          createData.details = args.data.details;
        }
        if (args.data.changes !== undefined && args.data.changes !== null) {
          createData.changes = args.data.changes;
        }
        if (args.data.metadata !== undefined && args.data.metadata !== null) {
          createData.metadata = args.data.metadata;
        }
        if (args.data.ipAddress !== undefined && args.data.ipAddress !== null) {
          createData.ipAddress = args.data.ipAddress;
        }
        if (args.data.userAgent !== undefined && args.data.userAgent !== null) {
          createData.userAgent = args.data.userAgent;
        }
        // Filter out undefined values for exactOptionalPropertyTypes
        const filteredData: Record<string, unknown> = {};
        Object.entries(createData).forEach(([key, value]) => {
          if (value !== undefined) {
            filteredData[key] = value;
          }
        });
        return this.prisma.auditLog.create({
          data: filteredData as Parameters<typeof this.prisma.auditLog.create>[0]['data'],
        });
      },
      findMany: async (args: {
        where: Record<string, unknown>;
        select?: Record<string, unknown>;
        orderBy?: Record<string, string>;
        skip?: number;
        take?: number;
      }) => {
        return this.prisma.auditLog.findMany(args);
      },
      count: async (args: { where: Record<string, unknown> }) => {
        return this.prisma.auditLog.count(args);
      },
    };
  }

  get gatewayPasswordReset() {
    return {
      findUnique: async (args: { where: { token: string }; include?: { admin: boolean } }) => {
        return this.prisma.passwordReset.findUnique(args);
      },
      findFirst: async (args: { where: Record<string, unknown> }) => {
        return this.prisma.passwordReset.findFirst(args);
      },
      create: async (args: { data: Record<string, unknown> }) => {
        if (!isPasswordResetCreateData(args.data)) {
          throw new Error('Invalid password reset create data structure');
        }
        const createData: {
          adminId: string;
          userId?: string;
          token: string;
          expiresAt: Date;
          usedAt?: Date | null;
          ipAddress?: string;
          userAgent?: string;
        } = {
          adminId: args.data.adminId,
          token: args.data.token,
          expiresAt: args.data.expiresAt,
        };
        if (args.data.userId !== undefined) {
          createData.userId = args.data.userId;
        }
        if (args.data.usedAt !== undefined) {
          createData.usedAt = args.data.usedAt;
        }
        if (args.data.ipAddress !== undefined) {
          createData.ipAddress = args.data.ipAddress;
        }
        if (args.data.userAgent !== undefined) {
          createData.userAgent = args.data.userAgent;
        }
        return this.prisma.passwordReset.create({
          data: createData,
        });
      },
      update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        if (!isPasswordResetUpdateData(args.data)) {
          throw new Error('Invalid password reset update data structure');
        }
        return this.prisma.passwordReset.update({
          where: args.where,
          data: args.data,
        });
      },
      updateMany: async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        if (!isPasswordResetUpdateData(args.data)) {
          throw new Error('Invalid password reset update data structure');
        }
        return this.prisma.passwordReset.updateMany({
          where: args.where,
          data: args.data,
        });
      },
    };
  }
}
