import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@workix/backend/domain/auth';

import { type AuditLogFilters, type AuditLogListResponse, AuditService } from './audit.service';

@Controller('audit-logs')
@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs (admin only)' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'adminId', required: false, type: String, description: 'Filter by admin ID' })
  @ApiQuery({
    name: 'action',
    required: false,
    type: String,
    description: 'Filter by action type (create, update, delete, login)',
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    type: String,
    description: 'Filter by entity type (user, pipeline, role)',
  })
  @ApiQuery({
    name: 'entityId',
    required: false,
    type: String,
    description: 'Filter by specific entity ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter logs after date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter logs before date (ISO 8601)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'userId', 'action'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50)',
  })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires audit.read permission' })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: 'createdAt' | 'userId' | 'action',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<AuditLogListResponse> {
    const filters: AuditLogFilters = {};

    if (userId) {
      filters.userId = userId;
    }

    if (adminId) {
      filters.adminId = adminId;
    }

    if (action) {
      filters.action = action;
    }

    if (entityType) {
      filters.entityType = entityType;
    }

    if (entityId) {
      filters.entityId = entityId;
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    if (sortBy) {
      filters.sortBy = sortBy;
    }

    if (sortOrder) {
      filters.sortOrder = sortOrder;
    }

    if (page !== undefined) {
      filters.page = Number(page);
    }

    if (limit !== undefined) {
      filters.limit = Number(limit);
    }

    return await this.auditService.getAuditLogs(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async getAuditLogById(
    @Param('id') id: string
  ): Promise<AuditLog | { statusCode: number; message: string }> {
    const log: AuditLog | null = await this.auditService.getAuditLogById(id);
    if (!log) {
      return { statusCode: 404, message: 'Audit log not found' };
    }
    return log;
  }
}
