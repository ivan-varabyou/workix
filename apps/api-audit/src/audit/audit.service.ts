import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@workix/backend/infrastructure/prisma';
import { hasType, isObject, hasNestedProperty } from '@workix/backend/shared/core';

export interface AuditLog {
  id: string;
  userId: string | null;
  adminId: string | null;
  action: string;
  entityType: string;
  resourceType: string | null;
  resourceId: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface AuditLogFilters {
  userId?: string;
  adminId?: string;
  action?: string;
  entityType?: string;
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

export interface CreateAuditLogData {
  userId?: string;
  adminId?: string;
  action: string;
  entityType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Service
 * Manages audit logs for compliance and security
 */
@Injectable()
export class AuditService {
  private readonly logger: Logger = new Logger(AuditService.name);
  private readonly prisma: PrismaClient;

  constructor(prismaService: PrismaService) {
    const client: unknown = prismaService.getClient();
    
    // Type guard for PrismaClient using hasType
    if (hasType<PrismaClient>(client, PrismaClient)) {
      this.prisma = client;
    } else if (hasPrismaModel(client, 'auditLog')) {
      // Fallback: check if it has auditLog property structure
      // After type guard, we know client has auditLog with Prisma methods
      // We verify the structure matches PrismaClient before assignment
      if (isObject(client) && hasProperty(client, 'auditLog')) {
        // The type guard ensures the structure is correct
        // We assign it only after verification
        this.prisma = client as PrismaClient;
      } else {
        throw new Error('Invalid Prisma client: auditLog structure is invalid');
      }
    } else {
      throw new Error('Invalid Prisma client: not a PrismaClient instance or missing auditLog');
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(data: CreateAuditLogData): Promise<AuditLog> {
    try {
      const auditLog: {
        id: string;
        userId: string | null;
        adminId: string | null;
        action: string;
        entityType: string;
        resourceType: string | null;
        resourceId: string | null;
        entityId: string | null;
        details: unknown;
        changes: unknown;
        metadata: unknown;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
      } = await this.prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          adminId: data.adminId || null,
          action: data.action,
          entityType: data.entityType,
          resourceId: data.resourceId || null,
          details: data.details || null,
          changes: data.changes || null,
          metadata: data.metadata || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });

      return this.mapToAuditLog(auditLog);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create audit log: ${errorMessage}`);
      throw error;
    }
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
      adminId?: string;
      action?: string;
      entityType?: string;
      resourceId?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.adminId) {
      where.adminId = filters.adminId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.resourceId = filters.entityId;
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

    const [logs, total]: [
      Array<{
        id: string;
        userId: string | null;
        adminId: string | null;
        action: string;
        entityType: string;
        resourceType: string | null;
        resourceId: string | null;
        entityId: string | null;
        details: unknown;
        changes: unknown;
        metadata: unknown;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
      }>,
      number
    ] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    // Get unique action types and entity types for filters
    const allLogs: Array<{ action: string; entityType: string }> = await this.prisma.auditLog.findMany({
      select: {
        action: true,
        entityType: true,
      },
    });

    const actionTypes: string[] = Array.from(
      new Set(allLogs.map((log: { action: string; entityType: string }): string => log.action))
    ).sort();
    const entityTypes: string[] = Array.from(
      new Set(allLogs.map((log: { action: string; entityType: string }): string => log.entityType))
    ).sort();

    return {
      data: logs.map((log: {
        id: string;
        userId: string | null;
        adminId: string | null;
        action: string;
        entityType: string;
        resourceType: string | null;
        resourceId: string | null;
        entityId: string | null;
        details: unknown;
        changes: unknown;
        metadata: unknown;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
      }): AuditLog => {
        return this.mapToAuditLog(log);
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      actionTypes,
      entityTypes,
    };
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLog | null> {
    const log: {
      id: string;
      userId: string | null;
      adminId: string | null;
      action: string;
      entityType: string;
      resourceType: string | null;
      resourceId: string | null;
      entityId: string | null;
      details: unknown;
      changes: unknown;
      metadata: unknown;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
    } | null = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!log) {
      return null;
    }

    return this.mapToAuditLog(log);
  }

  /**
   * Map Prisma audit log to AuditLog interface
   */
  private mapToAuditLog(log: {
    id: string;
    userId: string | null;
    adminId: string | null;
    action: string;
    entityType: string;
    resourceType: string | null;
    resourceId: string | null;
    entityId: string | null;
    details: unknown;
    changes: unknown;
    metadata: unknown;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }): AuditLog {
    // Helper function to safely convert unknown to Record<string, unknown> | null
    const toRecordOrNull: (value: unknown) => Record<string, unknown> | null = (value: unknown): Record<string, unknown> | null => {
      if (value === null || value === undefined) {
        return null;
      }
      if (isObject(value)) {
        const result: Record<string, unknown> = {};
        // Use Object.keys to safely iterate
        const keys: string[] = Object.keys(value);
        for (const key of keys) {
          result[key] = value[key];
        }
        return result;
      }
      return null;
    };

    return {
      id: log.id,
      userId: log.userId || null,
      adminId: log.adminId || null,
      action: log.action,
      entityType: log.entityType,
      resourceType: log.resourceType || null,
      resourceId: log.resourceId || null,
      entityId: log.entityId || null,
      details: toRecordOrNull(log.details),
      changes: toRecordOrNull(log.changes),
      metadata: toRecordOrNull(log.metadata),
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      createdAt: log.createdAt,
    };
  }
}
