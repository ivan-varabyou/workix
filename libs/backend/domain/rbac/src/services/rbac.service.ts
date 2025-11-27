import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';

import {
  Permission,
  PermissionCreateData,
  RBACPrismaService,
  Role,
  RoleCreateData,
} from '../interfaces/rbac-prisma.interface';

/**
 * RBAC Service
 * Role-Based Access Control implementation
 */
@Injectable()
export class RBACService {
  private readonly logger = new Logger(RBACService.name);
  private prisma: RBACPrismaService;

  constructor(@Inject('PrismaService') prisma: RBACPrismaService, private i18n: I18nService) {
    this.prisma = prisma;
  }

  private get prismaClient(): RBACPrismaService {
    return this.prisma;
  }

  /**
   * Create role
   */
  async createRole(data: RoleCreateData): Promise<Role> {
    const existing = await this.prismaClient.role.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException(this.i18n.translate('rbac.role_already_exists'));
    }

    const permissionsConnect = data.permissions?.connect || [];
    const createData: {
      name: string;
      permissions: { connect: Array<{ id: string }> };
      description?: string;
    } = {
      name: data.name,
      permissions: {
        connect: permissionsConnect,
      },
    };
    if (data.description !== undefined) {
      createData.description = data.description;
    }
    const role = await this.prismaClient.role.create({
      data: createData,
      include: { permissions: true },
    });

    this.logger.log(`Role created: ${role.id}`);
    return role;
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<{ message: string }> {
    const [user, role] = await Promise.all([
      this.prismaClient.user.findUnique({ where: { id: userId } }),
      this.prismaClient.role.findUnique({ where: { id: roleId } }),
    ]);

    if (!user || !role) {
      throw new NotFoundException(this.i18n.translate('rbac.user_or_role_not_found'));
    }

    await this.prismaClient.user.update({
      where: { id: userId },
      data: { roles: { connect: [{ id: roleId }] } },
    });

    this.logger.log(`Role ${roleId} assigned to user ${userId}`);
    return { message: 'Role assigned successfully' };
  }

  /**
   * Check permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    if (!user.roles) {
      return false;
    }

    return user.roles.some((role) => {
      if (!role.permissions) {
        return false;
      }
      return role.permissions.some((p) => p.name === permissionName);
    });
  }

  /**
   * Check access with permission
   */
  async checkAccess(userId: string, requiredPermissions: string[]): Promise<boolean> {
    for (const permission of requiredPermissions) {
      const has = await this.hasPermission(userId, permission);
      if (!has) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verify access (throws if denied)
   */
  async verifyAccess(userId: string, requiredPermissions: string[]): Promise<void> {
    const hasAccess = await this.checkAccess(userId, requiredPermissions);
    if (!hasAccess) {
      throw new ForbiddenException(this.i18n.translate('errors.forbidden'));
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    if (!user.roles) {
      return [];
    }

    const permissions = new Set<string>();
    user.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((p) => permissions.add(p.name));
      }
    });

    return Array.from(permissions);
  }

  /**
   * Create permission
   */
  async createPermission(data: PermissionCreateData): Promise<Permission> {
    const existing = await this.prismaClient.permission.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException(this.i18n.translate('rbac.permission_already_exists'));
    }

    const createData: { name: string; description?: string } = {
      name: data.name,
    };
    if (data.description !== undefined) {
      createData.description = data.description;
    }
    return await this.prismaClient.permission.create({
      data: createData,
    });
  }

  /**
   * Add permission to role
   */
  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
    return await this.prismaClient.role.update({
      where: { id: roleId },
      data: {
        permissions: { connect: [{ id: permissionId }] },
      },
      include: { permissions: true },
    });
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    return await this.prismaClient.role.update({
      where: { id: roleId },
      data: {
        permissions: { disconnect: [{ id: permissionId }] },
      },
      include: { permissions: true },
    });
  }

  /**
   * List all roles
   */
  async listRoles(): Promise<Role[]> {
    return await this.prismaClient.role.findMany({
      include: { permissions: true },
    });
  }

  /**
   * Get role details
   */
  async getRole(roleId: string): Promise<Role | null> {
    const roles = await this.prismaClient.role.findMany({
      where: { id: roleId },
      include: { permissions: true },
      take: 1,
    });
    return roles[0] || null;
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string): Promise<void> {
    await this.prismaClient.role.delete({
      where: { id: roleId },
    });

    this.logger.log(`Role deleted: ${roleId}`);
  }

  /**
   * Bulk assign roles
   */
  async bulkAssignRoles(userIds: string[], roleIds: string[]): Promise<{ message: string }> {
    const updates = userIds.map((userId) =>
      this.prismaClient.user.update({
        where: { id: userId },
        data: {
          roles: { connect: roleIds.map((id) => ({ id })) },
        },
      })
    );

    await Promise.all(updates);
    this.logger.log(`Roles assigned to ${userIds.length} users`);

    return { message: `Roles assigned to ${userIds.length} users` };
  }
}
