import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@workix/domain/auth';
import {
  AssignRoleDto,
  CreatePermissionDto,
  CreateRoleDto,
  PermissionService,
  RoleService,
} from '@workix/domain/rbac';

@Controller('rbac')
@ApiTags('🔐 RBAC')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class RbacController {
  constructor(private roleService: RoleService, private permissionService: PermissionService) {}

  @Post('roles')
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.roleService.create(dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved' })
  async getAllRoles() {
    return await this.roleService.findAll();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role found' })
  async getRole(@Param('id') id: string) {
    return await this.roleService.findById(id);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  async updateRole(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) {
    return await this.roleService.update(id, dto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  async deleteRole(@Param('id') id: string) {
    await this.roleService.delete(id);
    return { message: 'Role deleted successfully' };
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Create new permission' })
  @ApiResponse({ status: 201, description: 'Permission created' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    return await this.permissionService.register(dto);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved' })
  async getAllPermissions() {
    return await this.permissionService.findAll();
  }

  @Get('permissions/:id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission found' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async getPermission(@Param('id') id: string) {
    try {
      return await this.permissionService.findById(id);
    } catch (error) {
      throw new NotFoundException('Permission not found');
    }
  }

  @Post('permissions/grant')
  @ApiOperation({ summary: 'Grant permission to role' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleId: { type: 'string', description: 'Role ID' },
        permissionId: { type: 'string', description: 'Permission ID' },
      },
      required: ['roleId', 'permissionId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Permission granted successfully' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 400, description: 'Permission already granted' })
  async grantPermission(@Body() body: { roleId: string; permissionId: string }) {
    const { roleId, permissionId } = body;
    if (!roleId || !permissionId) {
      throw new BadRequestException('roleId and permissionId are required');
    }
    await this.permissionService.grantToRole(roleId, permissionId);
    return { message: 'Permission granted successfully' };
  }

  @Delete('permissions/:roleId/:id')
  @ApiOperation({ summary: 'Revoke permission from role' })
  @ApiParam({ name: 'roleId', type: 'string', description: 'Role ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission revoked successfully' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  async revokePermission(@Param('roleId') roleId: string, @Param('id') permissionId: string) {
    await this.permissionService.revokeFromRole(roleId, permissionId);
    return { message: 'Permission revoked successfully' };
  }

  @Post('assign-role')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned' })
  async assignRole(@Body() dto: AssignRoleDto) {
    if (!dto.userId) {
      throw new BadRequestException('User ID is required');
    }
    return await this.roleService.assignToUser(dto.userId, dto);
  }

  @Delete('assign-role')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed' })
  async removeRole(@Body() dto: AssignRoleDto) {
    if (!dto.userId || !dto.roleId) {
      throw new BadRequestException('userId and roleId are required');
    }
    await this.roleService.removeFromUser(dto.userId, dto.roleId);
    return { message: 'Role removed successfully' };
  }
}
