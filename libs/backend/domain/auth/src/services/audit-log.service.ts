import { Inject, Injectable, Logger, Optional } from '@nestjs/common';

import { AuditLog, AuditLogDetails } from '../interfaces/device.interface';
import { AuthPrismaService } from '../interfaces/prisma-auth.interface';

/**
 * Audit Logging Service
 * Logs all authentication events
 */
@Injectable()
export class AuditLogService {
  private readonly logger: Logger = new Logger(AuditLogService.name);
  private prisma: AuthPrismaService;

  constructor(@Optional() @Inject('PrismaService') prisma: AuthPrismaService) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.');
    }
    this.prisma = prisma;
  }

  /**
   * Log authentication event
   */
  async logAuthEvent(
    userId: string,
    eventType: string,
    details: AuditLogDetails = {}
  ): Promise<void> {
    try {
      const createData: {
        userId: string;
        eventType: string;
        details: string;
        ipAddress?: string | null;
        userAgent?: string | null;
      } = {
        userId,
        eventType,
        details: JSON.stringify(details),
      };
      if (details.ipAddress !== undefined) {
        createData.ipAddress = details.ipAddress;
      }
      if (details.userAgent !== undefined) {
        createData.userAgent = details.userAgent;
      }
      await this.prisma.auditLog.create({
        data: createData,
      });

      this.logger.log(`Audit event: ${eventType} for user: ${userId}`);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to log audit event: ${errorMessage}`);
    }
  }

  /**
   * Get user audit logs
   */
  async getUserLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const logs: unknown[] = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Transform Prisma data to AuditLog interface
    return logs.map((log: unknown): AuditLog => {
      // Type guard for log data
      // eslint-disable-next-line @typescript-eslint/typedef -- Type guard function with explicit return type annotation
      const isLogData = (data: unknown): data is { userId?: string | null; action?: string; changes?: unknown; ipAddress?: string | null; userAgent?: string | null; id?: string; createdAt?: Date } => {
        return typeof data === 'object' && data !== null;
      };

      const logData: { userId?: string | null; action?: string; changes?: unknown; ipAddress?: string | null; userAgent?: string | null; id?: string; createdAt?: Date } = isLogData(log) ? log : {};
      const logUserId: string = logData.userId ?? '';
      const eventType: string = typeof logData.action === 'string' ? logData.action : '';
      const details: string = typeof logData.changes === 'string'
        ? logData.changes
        : JSON.stringify(logData.changes);

      const auditLog: AuditLog = {
        id: logData.id ?? '',
        userId: logUserId,
        eventType,
        details,
        ipAddress: logData.ipAddress ?? null,
        userAgent: logData.userAgent ?? null,
        createdAt: logData.createdAt ?? new Date(),
        updatedAt: logData.createdAt ?? new Date(),
      };
      return auditLog;
    });
  }
}
