import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserProfileService } from './user-profile.service';
import { I18nService } from '@workix/infrastructure/i18n';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let mockPrisma: any;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Developer',
    avatarUrl: 'https://example.com/avatar.jpg',
    phoneNumber: '+1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    twoFactorEnabled: false,
    lastLoginAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };

    const mockI18nService = {
      translate: vi.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: 'PrismaService',
          useValue: mockPrisma,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    // Ensure i18n is injected
    (service as any).i18n = mockI18nService;
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.any(Object),
      });
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const updated = { ...mockUser, firstName: 'Jane' };
      mockPrisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile(mockUser.id, { firstName: 'Jane' });

      expect(result.firstName).toBe('Jane');
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should reject duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'other-user' });

      await expect(
        service.updateProfile(mockUser.id, { email: 'other@example.com' })
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile('invalid-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      const result = await service.deleteProfile(mockUser.id);

      expect(result.message).toContain('deleted');
      expect(mockPrisma.user.delete).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      const users = [mockUser];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.listUsers(0, 10);

      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('searchUsers', () => {
    it('should search users by name', async () => {
      const users = [mockUser];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await service.searchUsers('John');

      expect(result).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics', async () => {
      mockPrisma.user.count.mockResolvedValueOnce(100);
      mockPrisma.user.count.mockResolvedValueOnce(80);
      mockPrisma.user.count.mockResolvedValueOnce(20);

      const result = await service.getUserStats();

      expect(result.total).toBe(100);
      expect(result.active).toBe(80);
      expect(result.inactive).toBe(20);
    });
  });
});
