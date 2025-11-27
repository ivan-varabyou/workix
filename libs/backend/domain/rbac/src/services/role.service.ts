import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { I18nService } from '@workix/infrastructure/i18n';

import { AssignRoleDto } from '../dtos/assign-role.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import {
  RBACPrismaService,
  Role,
  RoleCreateData,
  UserRole,
  UserRoleCreateData,
} from '../interfaces/rbac-prisma.interface';

/**
 * RoleService
 * Manages roles and role assignments
 * Uses PrismaService injected from the service that uses this library
 */
@Injectable()
export class RoleService {
  // private logger = new Logger(RoleService.name);
  private prisma: RBACPrismaService;

  constructor(
    @Optional() @Inject('PrismaService') prisma?: RBACPrismaService,
    private i18n?: I18nService
  ) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Use RBACModule.forRoot(prismaService)');
    }
    this.prisma = prisma;
  }

  /**
   * Create a new role
   */
  async create(dto: CreateRoleDto): Promise<Role> {
    if (!dto.name) {
      throw new Error('Role name is required');
    }
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    const roleData: RoleCreateData = {
      name: dto.name,
      isActive: true,
      isSystem: false,
    };
    if (dto.description !== undefined) {
      roleData.description = dto.description;
    }
    if (dto.level !== undefined) {
      roleData.level = dto.level;
    }
    const role = await this.prisma.role.create({
      data: roleData,
    });
    return role;
  }

  /**
   * Get all roles
   */
  async findAll(includeInactive = false): Promise<Role[]> {
    const where = includeInactive ? {} : { isActive: true };
    return await this.prisma.role.findMany({
      where,
      orderBy: { level: 'desc' },
      include: { permissions: true },
    });
  }

  /**
   * Find role by name
   */
  async findByName(name: string): Promise<Role | null> {
    const roles = await this.prisma.role.findMany({
      where: { name },
      include: { permissions: true },
      take: 1,
    });
    return roles[0] || null;
  }

  /**
   * Find role by ID
   */
  async findById(id: string): Promise<Role> {
    const roles = await this.prisma.role.findMany({
      where: { id },
      include: { permissions: true },
      take: 1,
    });
    const role = roles[0];

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles: UserRole[] = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: true } } },
    });

    // Type guard for Role
    function isRole(value: unknown): value is Role {
      return typeof value === 'object' && value !== null && 'id' in value && 'name' in value;
    }

    const roles: Role[] = [];
    for (const ur of userRoles) {
      if (ur.role && isRole(ur.role)) {
        // Filter out expired roles
        if (ur.expiresAt && new Date(ur.expiresAt) < new Date()) {
          continue;
        }
        roles.push(ur.role);
      }
    }
    return roles;
  }

  /**
   * Get user's highest role level (for hierarchy)
   */
  async getUserMaxLevel(userId: string): Promise<number> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {}
        }
      },
      orderBy: { role: { level: 'desc' } },
      take: 1,
    });

    if (userRoles.length === 0) return 0;

    const userRole = userRoles[0];
    if (!userRole) {
      return 0;
    }

    if (userRole.expiresAt && new Date(userRole.expiresAt) < new Date()) {
      return 0;
    }

    return userRole.role?.level ?? 0;
  }

  /**
   * Assign role to user
   */
  async assignToUser(userId: string, dto: AssignRoleDto): Promise<UserRole> {
    if (!dto.roleId) {
      throw new Error('Role ID is required');
    }
    // Check role exists
    const role = await this.findById(dto.roleId);

    // Check if already assigned
    const existing = await this.prisma.userRole.findFirst({
      where: { userId, roleId: dto.roleId },
    });

    if (existing && !existing.expiresAt) {
      throw new ConflictException(`User already has role "${role.name}"`);
    }

    const userRoleData: UserRoleCreateData = {
      userId,
      roleId: dto.roleId,
    };
    if (dto.assignedBy !== undefined) {
      userRoleData.assignedBy = dto.assignedBy;
    }
    if (dto.expiresAt !== undefined) {
      userRoleData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    const userRole = await this.prisma.userRole.create({
      data: userRoleData,
      include: {
        role: {
          include: {}
        }
      },
    });

    return userRole;
  }

  /**
   * Remove role from user
   */
  async removeFromUser(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: { userId, roleId },
    });
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {}
        }
      },
    });

    return userRoles.some((ur: UserRole) => {
      // Check expiry
      if (ur.expiresAt && new Date(ur.expiresAt) < new Date()) {
        return false;
      }
      return ur.role?.name === roleName;
    });
  }

  /**
   * Check if user has any of the roles
   */
  async hasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    const userRoles: UserRole[] = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {}
        }
      },
    });

    return userRoles.some((ur: UserRole) => {
      // Check expiry
      if (ur.expiresAt && new Date(ur.expiresAt) < new Date()) {
        return false;
      }
      return roleNames.includes(ur.role?.name || '');
    });
  }

  /**
   * Update role
   */
  async update(id: string, updates: Partial<CreateRoleDto>): Promise<Role> {
    const role = await this.findById(id);

    if (role.isSystem && updates.level !== undefined) {
      throw new ConflictException(
        this.i18n?.translate('rbac.cannot_change_system_role_level') ||
          'Cannot change level of system role'
      );
    }

    return await this.prisma.role.update({
      where: { id },
      data: updates,
      include: { permissions: true },
    });
  }

  /**
   * Delete role (only if not system)
   */
  async delete(id: string): Promise<void> {
    const role = await this.findById(id);

    if (role.isSystem) {
      throw new ConflictException(
        this.i18n?.translate('rbac.cannot_delete_system_role') || 'Cannot delete system role'
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }
}
