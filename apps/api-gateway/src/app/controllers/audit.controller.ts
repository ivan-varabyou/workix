import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Audit Controller - API Gateway
 * Documents all audit log endpoints for Swagger
 * All requests are proxied to Audit Service (port 7109)
 */
@ApiTags('📋 Audit')
@Controller('audit-logs')
@ApiBearerAuth()
export class AuditController {
  constructor(private proxyService: ProxyService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs', description: 'Get audit logs with filtering' })
  @ApiQuery({ name: 'userId', required: false, type: 'string' })
  @ApiQuery({ name: 'action', required: false, type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  async getAuditLogs(@Query() _query: Record<string, unknown>, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID', description: 'Get audit log by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Audit log details' })
  async getAuditLogById(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }
}
