import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AvatarService } from './avatar.service';
import { I18nService } from '@workix/infrastructure/i18n';

describe('AvatarService', () => {
  let service: AvatarService;
  let mockPrisma: any;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    avatarUrl: '/uploads/avatars/user-123.jpg',
  };

  const mockFile = {
    buffer: Buffer.from('test'),
    size: 1000,
    mimetype: 'image/jpeg',
    originalname: 'avatar.jpg',
  } as any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const mockI18nService = {
      translate: vi.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
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

    service = module.get<AvatarService>(AvatarService);
    // Ensure i18n is injected
    (service as any).i18n = mockI18nService;
  });

  describe('uploadAvatar', () => {
    it('should upload avatar', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        avatarUrl: '/uploads/avatars/user-123-new.jpg',
      });

      const result = await service.uploadAvatar(mockUser.id, mockFile);

      expect(result.avatarUrl).toBeDefined();
      expect(result.message).toContain('successfully');
    });

    it('should reject if no file provided', async () => {
      await expect(service.uploadAvatar(mockUser.id, null as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject if file too large', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 };

      await expect(service.uploadAvatar(mockUser.id, largeFile)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject invalid file type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/pdf' };

      await expect(service.uploadAvatar(mockUser.id, invalidFile)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.uploadAvatar('invalid-id', mockFile)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, avatarUrl: null });

      const result = await service.deleteAvatar(mockUser.id);

      expect(result.message).toContain('deleted');
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAvatar('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvatarUrl', () => {
    it('should get avatar URL', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        avatarUrl: '/uploads/avatars/user-123.jpg',
      });

      const result = await service.getAvatarUrl(mockUser.id);

      expect(result.avatarUrl).toBeDefined();
    });

    it('should return undefined if no avatar', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ avatarUrl: null });

      const result = await service.getAvatarUrl(mockUser.id);

      expect(result.avatarUrl).toBeUndefined();
    });
  });

  describe('generateThumbnails', () => {
    it('should generate thumbnail URLs', async () => {
      const result = await service.generateThumbnails('/uploads/avatars/user-123.jpg');

      expect(result.small).toContain('size=50');
      expect(result.medium).toContain('size=150');
      expect(result.large).toContain('size=300');
    });
  });
});
