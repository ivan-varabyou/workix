import { Inject, Injectable, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hasAuditLogModel } from '@workix/backend/shared/core';

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'createdAt' | 'userId' | 'action';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  actionTypes: string[];
  entityTypes: string[];
}

/**
 * Prisma Client with AuditLog model
 */
type PrismaClientWithAuditLog = PrismaClient & {
  auditLog: {
    findMany: (args: unknown) => Promise<unknown[]>;
    count: (args: { where: unknown }) => Promise<number>;
  };
};

/**
 * Audit Log Service
 * Manages audit logs for compliance and security
 */
@Injectable()
export class AuditLogService {
  private prisma: PrismaClientWithAuditLog;

  constructor(@Optional() @Inject('PrismaService') prisma?: PrismaClient) {
    if (!prisma) {
      throw new Error('PrismaService must be provided');
    }
    // Check if Prisma client has auditLog model using type guard
    if (!hasAuditLogModel(prisma)) {
      throw new Error('Prisma client does not have auditLog model. This service requires a Prisma schema with AuditLog model.');
    }
    // After type guard, TypeScript knows prisma has auditLog structure
    // We can safely assign it because hasAuditLogModel verified the structure
    this.prisma = prisma as PrismaClientWithAuditLog;
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogListResponse> {
    const page: number = filters.page || 1;
    const limit: number = filters.limit || 50;
    const skip: number = (page - 1) * limit;

    const where: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entity) {
      where.entityType = filters.entity;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const orderBy: {
      createdAt?: 'asc' | 'desc';
      userId?: 'asc' | 'desc';
      action?: 'asc' | 'desc';
    } = {};

    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }) as Promise<Array<{
        id: string;
        userId: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        changes: unknown;
        ipAddress: string | null;
        userAgent: string | null;
        metadata: unknown;
        createdAt: Date;
      }>>,
      this.prisma.auditLog.count({ where }),
    ]);

    // Get unique action types and entity types for filters
    const allLogs = await this.prisma.auditLog.findMany({
      select: {
        action: true,
        entityType: true,
      },
    }) as Array<{ action: string; entityType: string }>;

    const actionTypes: string[] = Array.from(new Set(allLogs.map((log) => log.action))).sort();
    const entityTypes: string[] = Array.from(new Set(allLogs.map((log) => log.entityType))).sort();

    return {
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId || null,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId || null,
        changes: log.changes as Record<string, unknown> | null,
        ipAddress: log.ipAddress || null,
        userAgent: log.userAgent || null,
        metadata: log.metadata as Record<string, unknown> | null,
        createdAt: log.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      actionTypes,
      entityTypes,
    };
  }
}
