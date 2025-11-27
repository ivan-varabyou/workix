import { Injectable } from '@nestjs/common';
// NOTE: AuditService uses TypeORM which is deprecated - using Prisma instead
// This service is kept for backward compatibility but is not used
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { AuditLog } from '../entities/audit-log.entity';

/**
 * AuditService
 * Logs all user actions for auditing and compliance
 * NOTE: This service is deprecated - use Prisma-based audit logging instead
 */
@Injectable()
export class AuditService {
  constructor() {} // private auditRepository: Repository<AuditLog>, // @InjectRepository(AuditLog)

  /**
   * Log an action
   */
  async log(
    userId: string | null,
    action: string,
    resource: string,
    resourceId: string | null,
    changes: Record<string, unknown> = {},
    status = 'success',
    statusCode: number | null = null,
    metadata: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>> {
    // NOTE: This method is deprecated - use Prisma-based audit logging instead
    console.warn('AuditService.log is deprecated - use Prisma-based audit logging');
    return {
      userId,
      action,
      resource,
      resourceId,
      changes,
      status,
      statusCode,
      metadata,
      createdAt: new Date(),
    };
  }

  /**
   * Get user's audit logs
   */
  async getUserLogs(_userId: string, _limit = 100, _offset = 0): Promise<[unknown[], number]> {
    // NOTE: This method is deprecated - use Prisma-based audit logging instead
    console.warn('AuditService.getUserLogs is deprecated - use Prisma-based audit logging');
    return [[], 0];
  }

  /**
   * Get resource audit trail
   */
  async getResourceLogs(_resource: string, _resourceId: string, _limit = 100): Promise<unknown[]> {
    // NOTE: This method is deprecated - use Prisma-based audit logging instead
    console.warn('AuditService.getResourceLogs is deprecated - use Prisma-based audit logging');
    return [];
  }
}
