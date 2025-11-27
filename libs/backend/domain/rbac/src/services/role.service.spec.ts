import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoleService } from './role.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;
  let prisma: any;

  const mockRole = {
    id: 'role-1',
    name: 'admin',
    description: 'Administrator',
    level: 100,
    isSystem: true,
    isActive: true,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRole = {
    id: 'ur-1',
    userId: 'user-1',
    roleId: 'role-1',
    role: mockRole,
    expiresAt: null,
    assignedBy: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      role: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      userRole: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    service = new RoleService(prisma);
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const dto = { name: 'user', description: 'User', level: 10 };
      vi.mocked(prisma.role.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.role.create).mockResolvedValue(mockRole);

      const result = await service.create(dto);

      expect(result).toEqual(mockRole);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          isActive: true,
          isSystem: false,
        },
      });
    });

    it('should throw if role name already exists', async () => {
      const dto = { name: 'admin', description: 'Admin', level: 100 };
      vi.mocked(prisma.role.findUnique).mockResolvedValue(mockRole);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all active roles', async () => {
      const roles = [mockRole];
      vi.mocked(prisma.role.findMany).mockResolvedValue(roles);

      const result = await service.findAll();

      expect(result).toEqual(roles);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { level: 'desc' },
        include: { permissions: true },
      });
    });
  });

  describe('findByName', () => {
    it('should find role by name with permissions', async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole]);

      const result = await service.findByName('admin');

      expect(result).toEqual(mockRole);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        where: { name: 'admin' },
        include: { permissions: true },
        take: 1,
      });
    });

    it('should return null if role not found', async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([]);

      const result = await service.findByName('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find role by ID', async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole]);

      const result = await service.findById('role-1');

      expect(result).toEqual(mockRole);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        include: { permissions: true },
        take: 1,
      });
    });

    it('should throw NotFoundException if role not found', async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([]);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserRoles', () => {
    it('should get user roles', async () => {
      const userRoles = [mockUserRole];
      vi.mocked(prisma.userRole.findMany).mockResolvedValue(userRoles);

      const result = await service.getUserRoles('user-1');

      expect(result).toEqual([mockRole]);
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { role: { include: { permissions: true } } },
      });
    });
  });

  describe('assignToUser', () => {
    it('should assign role to user', async () => {
      const dto = { roleId: 'role-1', userId: 'user-1' };
      const userRole = { ...mockUserRole, userId: 'user-1', roleId: 'role-1' };

      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole]);
      vi.mocked(prisma.userRole.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.userRole.create).mockResolvedValue(userRole);

      const result = await service.assignToUser('user-1', dto);

      expect(result).toEqual(userRole);
      expect(prisma.userRole.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          roleId: 'role-1',
        },
        include: { role: true },
      });
    });

    it('should throw if role not found', async () => {
      const dto = { roleId: 'nonexistent', userId: 'user-1' };
      vi.mocked(prisma.role.findMany).mockResolvedValue([]);

      await expect(service.assignToUser('user-1', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', async () => {
      const userRoles = [{ ...mockUserRole, role: { ...mockRole, name: 'admin' } }];
      vi.mocked(prisma.userRole.findMany).mockResolvedValue(userRoles);

      const result = await service.hasRole('user-1', 'admin');

      expect(result).toBe(true);
    });

    it('should return false if user does not have role', async () => {
      vi.mocked(prisma.userRole.findMany).mockResolvedValue([]);

      const result = await service.hasRole('user-1', 'admin');

      expect(result).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true if user has any of the roles', async () => {
      const userRoles = [{ ...mockUserRole, role: { ...mockRole, name: 'admin' } }];
      vi.mocked(prisma.userRole.findMany).mockResolvedValue(userRoles);

      const result = await service.hasAnyRole('user-1', ['admin', 'moderator']);

      expect(result).toBe(true);
    });

    it('should return false if user has none of the roles', async () => {
      const userRoles = [{ ...mockUserRole, role: { ...mockRole, name: 'user' } }];
      vi.mocked(prisma.userRole.findMany).mockResolvedValue(userRoles);

      const result = await service.hasAnyRole('user-1', ['admin', 'moderator']);

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update role', async () => {
      const updates = { description: 'Updated Admin' };
      const updated = { ...mockRole, ...updates };

      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole]);
      vi.mocked(prisma.role.update).mockResolvedValue(updated);

      const result = await service.update('role-1', updates);

      expect(result.description).toBe('Updated Admin');
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        data: updates,
        include: { permissions: true },
      });
    });

    it('should not allow level change for system roles', async () => {
      const updates = { level: 50 };
      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole]);

      await expect(service.update('role-1', updates)).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete role', async () => {
      const nonSystemRole = { ...mockRole, isSystem: false };
      vi.mocked(prisma.role.findMany).mockResolvedValue([nonSystemRole]);
      vi.mocked(prisma.role.delete).mockResolvedValue(nonSystemRole);

      await service.delete('role-1');

      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: 'role-1' },
      });
    });

    it('should not allow deletion of system roles', async () => {
      vi.mocked(prisma.role.findMany).mockResolvedValue([mockRole]);

      await expect(service.delete('role-1')).rejects.toThrow(ConflictException);
    });
  });
});
