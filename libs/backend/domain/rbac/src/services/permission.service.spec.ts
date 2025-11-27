import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PermissionService } from './permission.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RoleService } from './role.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let prisma: any;

  const mockPermission = {
    id: 'perm-1',
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'Read users',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole = {
    id: 'role-1',
    name: 'admin',
    description: 'Admin',
    level: 100,
    isSystem: true,
    isActive: true,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      permission: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      role: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new PermissionService(prisma);
  });

  describe('register', () => {
    it('should register new permission', async () => {
      const dto = { name: 'users:create', resource: 'users', action: 'create' };
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.permission.create).mockResolvedValue(mockPermission);

      const result = await service.register(dto);

      expect(result).toEqual(mockPermission);
      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          isActive: true,
        },
      });
    });

    it('should throw if permission already exists', async () => {
      const dto = { name: 'users:read', resource: 'users', action: 'read' };
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(mockPermission);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should find all active permissions', async () => {
      const permissions = [mockPermission];
      vi.mocked(prisma.permission.findMany).mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(result).toEqual(permissions);
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { resource: 'asc' },
      });
    });
  });

  describe('findByName', () => {
    it('should find permission by name', async () => {
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(mockPermission);

      const result = await service.findByName('users:read');

      expect(result).toEqual(mockPermission);
      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { name: 'users:read' },
      });
    });

    it('should return null if not found', async () => {
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(null);

      const result = await service.findByName('nonexistent:action');

      expect(result).toBeNull();
    });
  });

  describe('getResourcePermissions', () => {
    it('should get all permissions for a resource', async () => {
      const permissions = [mockPermission];
      vi.mocked(prisma.permission.findMany).mockResolvedValue(permissions);

      const result = await service.getResourcePermissions('users');

      expect(result).toEqual(permissions);
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        where: { resource: 'users', isActive: true },
      });
    });
  });

  describe('grantToRole', () => {
    it('should grant permission to role', async () => {
      const roleWithPerms = { ...mockRole, permissions: [] };
      vi.mocked(prisma.role.findUnique).mockResolvedValue(mockRole);
      vi.mocked(prisma.role.findMany).mockResolvedValue([roleWithPerms]);
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(mockPermission);
      vi.mocked(prisma.role.update).mockResolvedValue(roleWithPerms);

      await service.grantToRole('role-1', 'perm-1');

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        data: {
          permissions: {
            connect: [{ id: 'perm-1' }],
          },
        },
      });
    });

    it('should throw if role not found', async () => {
      vi.mocked(prisma.role.findUnique).mockResolvedValue(null);

      await expect(service.grantToRole('nonexistent', 'perm-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if permission not found', async () => {
      vi.mocked(prisma.role.findUnique).mockResolvedValue(mockRole);
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(null);

      await expect(service.grantToRole('role-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('revokeFromRole', () => {
    it('should revoke permission from role', async () => {
      const roleWithPerms = { ...mockRole, permissions: [mockPermission] };
      vi.mocked(prisma.role.findUnique).mockResolvedValue(roleWithPerms);
      vi.mocked(prisma.role.update).mockResolvedValue(roleWithPerms);

      await service.revokeFromRole('role-1', 'perm-1');

      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        data: {
          permissions: {
            disconnect: [{ id: 'perm-1' }],
          },
        },
      });
    });

    it('should throw if role not found', async () => {
      vi.mocked(prisma.role.findUnique).mockResolvedValue(null);

      await expect(service.revokeFromRole('nonexistent', 'perm-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const userRoles = [{ ...mockRole, permissions: [mockPermission] }];
      const roleService: RoleService = {
        getUserRoles: vi.fn().mockResolvedValue(userRoles),
      } as unknown as RoleService;

      const result = await service.hasPermission('user-1', 'users:read', roleService);

      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      const userRoles = [{ ...mockRole, permissions: [] }];
      const roleService: RoleService = {
        getUserRoles: vi.fn().mockResolvedValue(userRoles),
      } as unknown as RoleService;

      const result = await service.hasPermission('user-1', 'users:read', roleService);

      expect(result).toBe(false);
    });
  });

  describe('hasResourceAction', () => {
    it('should return true if user has resource:action permission', async () => {
      const userRoles = [{ ...mockRole, permissions: [mockPermission] }];
      const roleService: RoleService = {
        getUserRoles: vi.fn().mockResolvedValue(userRoles),
      } as unknown as RoleService;

      const result = await service.hasResourceAction('user-1', 'users', 'read', roleService);

      expect(result).toBe(true);
    });
  });

  describe('getUserPermissions', () => {
    it('should get all user permissions from all roles', async () => {
      const userRoles = [{ ...mockRole, permissions: [mockPermission] }];
      const roleService: RoleService = {
        getUserRoles: vi.fn().mockResolvedValue(userRoles),
      } as unknown as RoleService;

      const result = await service.getUserPermissions('user-1', roleService);

      expect(result.length).toBeGreaterThan(0);
      expect(result).toContainEqual(mockPermission);
    });
  });

  describe('update', () => {
    it('should update permission', async () => {
      const updates = { description: 'Updated' };
      const updated = { ...mockPermission, ...updates };

      vi.mocked(prisma.permission.findUnique).mockResolvedValue(mockPermission);
      vi.mocked(prisma.permission.update).mockResolvedValue(updated);

      const result = await service.update('perm-1', updates);

      expect(result.description).toBe('Updated');
      expect(prisma.permission.update).toHaveBeenCalledWith({
        where: { id: 'perm-1' },
        data: updates,
      });
    });
  });

  describe('delete', () => {
    it('should delete permission', async () => {
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(mockPermission);
      vi.mocked(prisma.permission.delete).mockResolvedValue(mockPermission);

      await service.delete('perm-1');

      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { id: 'perm-1' },
      });
    });

    it('should throw if permission not found', async () => {
      vi.mocked(prisma.permission.findUnique).mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow('Permission with ID nonexistent not found');
    });
  });
});
