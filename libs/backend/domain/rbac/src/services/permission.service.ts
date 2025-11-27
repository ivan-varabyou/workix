import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';

import { CreatePermissionDto } from '../dtos/create-permission.dto';
import {
  Permission,
  PermissionCreateData,
  RBACPrismaService,
  Role,
} from '../interfaces/rbac-prisma.interface';
import { RoleService } from './role.service';

/**
 * PermissionService
 * Manages permissions and role-permission assignments
 * Uses PrismaService injected from the service that uses this library
 */
@Injectable()
export class PermissionService {
  // private logger = new Logger(PermissionService.name);
  private prisma: RBACPrismaService;

  constructor(@Optional() @Inject('PrismaService') prisma?: RBACPrismaService) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Use RBACModule.forRoot(prismaService)');
    }
    this.prisma = prisma;
  }

  /**
   * Register a new permission
   */
  async register(dto: CreatePermissionDto): Promise<Permission> {
    if (!dto.name) {
      throw new Error('Permission name is required');
    }
    const existing = await this.prisma.permission.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Permission "${dto.name}" already exists`);
    }

    const permissionData: PermissionCreateData = {
      name: dto.name,
      isActive: true,
    };
    if (dto.description !== undefined) {
      permissionData.description = dto.description;
    }
    if (dto.resource !== undefined) {
      permissionData.resource = dto.resource;
    }
    if (dto.action !== undefined) {
      permissionData.action = dto.action;
    }
    const permission = await this.prisma.permission.create({
      data: permissionData,
    });
    return permission;
  }

  /**
   * Get all permissions
   */
  async findAll(includeInactive = false): Promise<Permission[]> {
    const where = includeInactive ? {} : { isActive: true };
    return await this.prisma.permission.findMany({
      where,
      orderBy: { resource: 'asc' },
    });
  }

  /**
   * Find permission by name
   */
  async findByName(name: string): Promise<Permission | null> {
    return await this.prisma.permission.findUnique({
      where: { name },
    });
  }

  /**
   * Get permissions for a resource
   */
  async getResourcePermissions(resource: string): Promise<Permission[]> {
    return await this.prisma.permission.findMany({
      where: { resource, isActive: true },
    });
  }

  /**
   * Grant permission to role
   */
  async grantToRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${permissionId}" not found`);
    }

    // Get role with permissions to check if already granted
    // Use findMany with include since findFirst doesn't support include in interface
    const rolesWithPermissions = await this.prisma.role.findMany({
      where: { id: roleId },
      include: { permissions: true },
      take: 1,
    });
    const roleWithPermissions = rolesWithPermissions[0];

    // Check if already granted
    if (roleWithPermissions?.permissions?.some((p: Permission) => p.id === permissionId)) {
      return;
    }

    await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: [{ id: permissionId }],
        },
      },
    });
  }

  /**
   * Revoke permission from role
   */
  async revokeFromRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    await this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          disconnect: [{ id: permissionId }],
        },
      },
    });
  }

  /**
   * Check if user has permission
   * Can check by permission name or resource:action
   */
  async hasPermission(
    userId: string,
    permissionName: string,
    roleService: RoleService
  ): Promise<boolean> {
    const roles: Role[] = await roleService.getUserRoles(userId);

    for (const role of roles) {
      if (role.permissions?.some((p: Permission) => p.name === permissionName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check resource:action permission
   */
  async hasResourceAction(
    userId: string,
    resource: string,
    action: string,
    roleService: RoleService
  ): Promise<boolean> {
    const roles: Role[] = await roleService.getUserRoles(userId);

    for (const role of roles) {
      if (
        role.permissions?.some((p: Permission) => p.resource === resource && p.action === action)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get user's all permissions (flattened from roles)
   */
  async getUserPermissions(userId: string, roleService: RoleService): Promise<Permission[]> {
    const roles: Role[] = await roleService.getUserRoles(userId);
    const permissions = new Set<Permission>();

    for (const role of roles) {
      role.permissions?.forEach((p: Permission) => permissions.add(p));
    }

    return Array.from(permissions);
  }

  /**
   * Find permission by ID
   */
  async findById(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    return permission;
  }

  /**
   * Update permission
   */
  async update(id: string, updates: Partial<CreatePermissionDto>): Promise<Permission> {
    await this.findById(id);

    return await this.prisma.permission.update({
      where: { id },
      data: updates,
    });
  }

  /**
   * Delete permission
   */
  async delete(id: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw new Error(`Permission with ID ${id} not found`);
    }
    await this.prisma.permission.delete({ where: { id } });
  }
}
