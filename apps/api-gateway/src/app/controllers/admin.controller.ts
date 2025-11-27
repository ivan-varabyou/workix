import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';

/**
 * Admin Controller - API Gateway
 * Documents all admin endpoints for Swagger
 * All requests are proxied to Admin Service (port 7100)
 */
@ApiTags('👑 Admin')
@Controller('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private proxyService: ProxyService) {}

  /**
   * Admin authentication endpoints
   */
  @Post('auth/login')
  @ApiOperation({ summary: 'Admin login', description: 'Authenticate admin user' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Admin authenticated successfully' })
  async adminLogin(@Body() body: unknown, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, body, req.headers as Record<string, string>);
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Admin logout', description: 'Logout admin user' })
  @ApiResponse({ status: 200, description: 'Admin logged out successfully' })
  async adminLogout(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, undefined, req.headers as Record<string, string>);
  }

  @Get('auth/me')
  @ApiOperation({ summary: 'Get current admin', description: 'Get current authenticated admin user' })
  @ApiResponse({ status: 200, description: 'Current admin user' })
  async getCurrentAdmin(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, undefined, req.headers as Record<string, string>);
  }

  /**
   * Admin management endpoints
   */
  @Get('users')
  @ApiOperation({ summary: 'Get all admins', description: 'Get list of all admin users' })
  @ApiResponse({ status: 200, description: 'List of admin users' })
  async getAdmins(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, undefined, req.headers as Record<string, string>);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get admin by ID', description: 'Get admin user by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Admin user' })
  async getAdminById(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'GET', undefined, req.headers as Record<string, string>);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create admin', description: 'Create new admin user' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  async createAdmin(@Body() body: unknown, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, body, req.headers as Record<string, string>);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update admin', description: 'Update admin user' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  async updateAdmin(@Param('id') _id: string, @Body() body: unknown, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'PUT', body, req.headers as Record<string, string>);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete admin', description: 'Delete admin user' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  async deleteAdmin(@Param('id') _id: string, @Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method || 'DELETE', undefined, req.headers as Record<string, string>);
  }

  /**
   * Admin audit logs
   */
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs', description: 'Get admin audit logs' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  async getAuditLogs(@Req() req: Request): Promise<unknown> {
    return this.proxyService.routeRequest(req.path, req.method, undefined, req.headers as Record<string, string>);
  }
}
