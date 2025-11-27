import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TwoFactorService } from './two-factor.service';

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let mockPrisma: any;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    twoFactorEnabled: false,
  };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      twoFactorAuth: {
        create: vi.fn(),
        findFirst: vi.fn(),
        deleteMany: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorService,
        {
          provide: 'PrismaService',
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TwoFactorService>(TwoFactorService);
  });

  describe('generateSecret', () => {
    it('should generate a valid 2FA secret', async () => {
      const result = await service.generateSecret(mockUser.id, mockUser.email);

      expect(result.secret).toBeDefined();
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.qrCode).toContain('data:image/png;base64');
      expect(result.manualEntryKey).toBe(result.secret);
    });

    it('should generate different secrets for different users', async () => {
      const result1 = await service.generateSecret('user-1', 'user1@example.com');
      const result2 = await service.generateSecret('user-2', 'user2@example.com');

      expect(result1.secret).not.toBe(result2.secret);
    });
  });

  describe('enable2FA', () => {
    it('should enable 2FA with valid TOTP code', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.twoFactorAuth.create.mockResolvedValue({
        id: 'totp-123',
        enabled: true,
      });
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, twoFactorEnabled: true });

      // Generate a valid secret and code for testing
      const { secret } = await service.generateSecret(mockUser.id, mockUser.email);

      // Mock the TOTP verification (we'll assume the service validates correctly)
      vi.spyOn(service as any, 'verifyTotp').mockReturnValue(true);

      const result = await service.enable2FA(mockUser.id, secret, '123456');

      expect(result.message).toContain('enabled');
      expect(result.backupCodes).toHaveLength(10);
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should reject invalid TOTP code', async () => {
      const { secret } = await service.generateSecret(mockUser.id, mockUser.email);

      await expect(service.enable2FA(mockUser.id, secret, '000000')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should generate 10 backup codes', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.twoFactorAuth.create.mockResolvedValue({
        id: 'totp-123',
        enabled: true,
      });
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, twoFactorEnabled: true });

      const { secret } = await service.generateSecret(mockUser.id, mockUser.email);

      // Using a mock code for testing (in real scenario, speakeasy would validate)
      // We need to spy on the private method or mock it
      vi.spyOn(service as any, 'verifyTotp').mockReturnValue(true);

      const result = await service.enable2FA(mockUser.id, secret, '123456');

      expect(result.backupCodes).toHaveLength(10);
      result.backupCodes.forEach((code) => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
      });
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA for user', async () => {
      mockPrisma.twoFactorAuth.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, twoFactorEnabled: false });

      const result = await service.disable2FA(mockUser.id);

      expect(result.message).toContain('disabled');
      expect(mockPrisma.twoFactorAuth.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });

  describe('verifyLoginTotp', () => {
    it('should verify valid TOTP code', async () => {
      const twoFactorRecord = {
        id: 'totp-123',
        userId: mockUser.id,
        secret: 'test-secret',
        backupCodes: [],
        enabled: true,
      };

      mockPrisma.twoFactorAuth.findFirst.mockResolvedValue(twoFactorRecord);

      // Mock the private TOTP verification
      vi.spyOn(service as any, 'verifyTotp').mockReturnValue(true);

      const result = await service.verifyLoginTotp(mockUser.id, '123456');

      expect(result.verified).toBe(true);
      expect(result.message).toContain('verified');
    });

    it('should verify valid backup code', async () => {
      const backupCodeHash = 'hashed-code';
      const twoFactorRecord = {
        id: 'totp-123',
        userId: mockUser.id,
        secret: 'test-secret',
        backupCodes: [backupCodeHash],
        enabled: true,
      };

      mockPrisma.twoFactorAuth.findFirst.mockResolvedValue(twoFactorRecord);
      mockPrisma.twoFactorAuth.update.mockResolvedValue(twoFactorRecord);

      // Mock verifications
      vi.spyOn(service as any, 'verifyTotp').mockReturnValue(false);
      vi.spyOn(service as any, 'verifyBackupCode').mockReturnValue(true);

      const result = await service.verifyLoginTotp(mockUser.id, 'backup-code');

      expect(result.verified).toBe(true);
      expect(result.message).toContain('Backup code');
    });

    it('should reject invalid code', async () => {
      mockPrisma.twoFactorAuth.findFirst.mockResolvedValue(null);

      await expect(service.verifyLoginTotp(mockUser.id, '000000')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('is2FAEnabled', () => {
    it('should return true if 2FA is enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        twoFactorEnabled: true,
      });

      const result = await service.is2FAEnabled(mockUser.id);

      expect(result).toBe(true);
    });

    it('should return false if 2FA is disabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.is2FAEnabled(mockUser.id);

      expect(result).toBe(false);
    });
  });

  describe('get2FAStatus', () => {
    it('should return 2FA status with backup codes count', async () => {
      const backupCodes = ['code1', 'code2', 'code3'];
      mockPrisma.twoFactorAuth.findFirst.mockResolvedValue({
        id: 'totp-123',
        enabled: true,
        backupCodes,
      });

      const result = await service.get2FAStatus(mockUser.id);

      expect(result.enabled).toBe(true);
      expect(result.backupCodesRemaining).toBe(3);
    });

    it('should return disabled status if 2FA not set up', async () => {
      mockPrisma.twoFactorAuth.findFirst.mockResolvedValue(null);

      const result = await service.get2FAStatus(mockUser.id);

      expect(result.enabled).toBe(false);
      expect(result.backupCodesRemaining).toBe(0);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should generate new backup codes', async () => {
      const twoFactorRecord = {
        id: 'totp-123',
        userId: mockUser.id,
        backupCodes: [],
        enabled: true,
      };

      mockPrisma.twoFactorAuth.findFirst.mockResolvedValue(twoFactorRecord);
      mockPrisma.twoFactorAuth.update.mockResolvedValue({
        ...twoFactorRecord,
        backupCodes: ['code1', 'code2'],
      });

      const result = await service.regenerateBackupCodes(mockUser.id);

      expect(result.message).toContain('regenerated');
      expect(result.backupCodes).toHaveLength(10);
    });

    it('should reject if 2FA not enabled', async () => {
      mockPrisma.twoFactorAuth.findFirst.mockResolvedValue(null);

      await expect(service.regenerateBackupCodes(mockUser.id)).rejects.toThrow(BadRequestException);
    });
  });
});
