import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { ProxyService } from '../services/proxy.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';

/**
 * RBAC Controller - API Gateway
 * Documents all RBAC endpoints for Swagger
 * All requests are proxied to Auth Service (port 7102) - RBAC moved to api-auth
 */
@ApiTags('🛡️ RBAC')
@Controller('rbac')
@ApiBearerAuth()
export class RbacController {
  constructor(private proxyService: ProxyService) {}

  // ========== ROLES ==========

  /**
   * Create role
   */
  @Post('roles')
  @ApiOperation({
    summary: 'Create new role',
    description: 'Creates a new role in the system',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'role_123' },
        name: { type: 'string', example: 'admin' },
        description: { type: 'string', example: 'Administrator role' },
        level: { type: 'number', example: 100 },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createRole(@Body() dto: CreateRoleDto, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/rbac/roles', 'POST', dto, headers);
  }

  /**
   * Get all roles
   */
  @Get('roles')
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieves all roles in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          level: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllRoles(@Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/rbac/roles', 'GET', null, headers);
  }

  /**
   * Get role by ID
   */
  @Get('roles/:id')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Retrieves a specific role by ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Role ID (UUID)',
    example: 'role_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Role found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        level: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRole(@Param('id') id: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/v1/rbac/roles/${id}`, 'GET', null, headers);
  }

  /**
   * Update role
   */
  @Put('roles/:id')
  @ApiOperation({
    summary: 'Update role',
    description: 'Updates an existing role',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Role ID (UUID)',
    example: 'role_123',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role updated',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        level: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateRole(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/v1/rbac/roles/${id}`, 'PUT', dto, headers);
  }

  /**
   * Delete role
   */
  @Delete('roles/:id')
  @ApiOperation({
    summary: 'Delete role',
    description: 'Deletes a role from the system',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Role ID (UUID)',
    example: 'role_123',
  })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteRole(@Param('id') id: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(`/api/v1/rbac/roles/${id}`, 'DELETE', null, headers);
  }

  /**
   * Assign role to user
   */
  @Post('assign-role')
  @ApiOperation({
    summary: 'Assign role to user',
    description: 'Assigns a role to a user',
  })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        roleId: { type: 'string' },
        assignedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignRole(@Body() dto: AssignRoleDto, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/rbac/assign-role', 'POST', dto, headers);
  }

  /**
   * Remove role from user
   */
  @Delete('assign-role')
  @ApiOperation({
    summary: 'Remove role from user',
    description: 'Removes a role from a user',
  })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeRole(@Body() dto: AssignRoleDto, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/rbac/assign-role', 'DELETE', dto, headers);
  }

  // ========== PERMISSIONS ==========

  /**
   * Create permission
   */
  @Post('permissions')
  @ApiOperation({
    summary: 'Create new permission',
    description: 'Creates a new permission in the system',
  })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permission created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'permission_123' },
        name: { type: 'string', example: 'pipelines:create' },
        resource: { type: 'string', example: 'pipelines' },
        action: { type: 'string', example: 'create' },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Permission already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPermission(@Body() dto: CreatePermissionDto, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/rbac/permissions', 'POST', dto, headers);
  }

  /**
   * Get all permissions
   */
  @Get('permissions')
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Retrieves all permissions in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          resource: { type: 'string' },
          action: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllPermissions(@Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest('/api/v1/rbac/permissions', 'GET', null, headers);
  }

  /**
   * Get permission by ID
   */
  @Get('permissions/:id')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Retrieves a specific permission by ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Permission ID (UUID)',
    example: 'permission_123',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        resource: { type: 'string' },
        action: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPermission(@Param('id') id: string, @Req() req: Request): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(
      `/api/v1/rbac/permissions/${id}`,
      'GET',
      null,
      headers
    );
  }

  /**
   * Grant permission to role
   */
  @Post('permissions/grant')
  @ApiOperation({
    summary: 'Grant permission to role',
    description: 'Grants a permission to a role',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleId: { type: 'string', example: 'role_123' },
        permissionId: { type: 'string', example: 'permission_123' },
      },
      required: ['roleId', 'permissionId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permission granted successfully',
    schema: {
      type: 'object',
      properties: {
        roleId: { type: 'string' },
        permissionId: { type: 'string' },
        grantedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async grantPermission(
    @Body() body: { roleId: string; permissionId: string },
    @Req() req: Request
  ): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(
      '/api/v1/rbac/permissions/grant',
      'POST',
      body,
      headers
    );
  }

  /**
   * Revoke permission from role
   */
  @Delete('permissions/:roleId/:permissionId')
  @ApiOperation({
    summary: 'Revoke permission from role',
    description: 'Revokes a permission from a role',
  })
  @ApiParam({
    name: 'roleId',
    type: 'string',
    description: 'Role ID (UUID)',
    example: 'role_123',
  })
  @ApiParam({
    name: 'permissionId',
    type: 'string',
    description: 'Permission ID (UUID)',
    example: 'permission_123',
  })
  @ApiResponse({ status: 200, description: 'Permission revoked successfully' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
    @Req() req: Request
  ): Promise<unknown> {
    const auth: string | undefined = req.headers.authorization;
    const headers: Record<string, string> = auth ? { authorization: auth } : {};
    return await this.proxyService.routeRequest(
      `/api/v1/rbac/permissions/${roleId}/${permissionId}`,
      'DELETE',
      null,
      headers
    );
  }
}
