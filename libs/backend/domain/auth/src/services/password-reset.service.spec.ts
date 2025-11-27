import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PasswordResetService } from './password-reset.service';
import { PasswordService } from './password.service';
import { I18nService } from '@workix/infrastructure/i18n';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let mockPrisma: any;
  let mockPasswordService: any;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    passwordHash: 'hashed_password',
    failedLoginAttempts: 0,
    lockedUntil: null,
  };

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      passwordReset: {
        create: vi.fn(),
        findFirst: vi.fn(),
        deleteMany: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    mockPasswordService = {
      hashPassword: vi.fn().mockResolvedValue('new_hashed_password'),
      validatePasswordStrength: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    };

    const mockI18nService = {
      translate: vi.fn((key: string) => key),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: 'PrismaService',
          useValue: mockPrisma,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    // Ensure passwordService is injected
    (service as any).passwordService = mockPasswordService;
    // Ensure i18n is injected
    (service as any).i18n = mockI18nService;
  });

  describe('requestPasswordReset', () => {
    it('should create a password reset token for valid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.count.mockResolvedValue(0);
      mockPrisma.passwordReset.create.mockResolvedValue({
        id: 'reset-123',
        token: 'token-hash',
        expiresAt: new Date(),
      });

      const result = await service.requestPasswordReset('user@example.com');

      expect(result.message).toBeDefined();
      expect(result.resetTokenId).toBe('reset-123');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(mockPrisma.passwordReset.create).toHaveBeenCalled();
    });

    it('should not reveal if email exists (security)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.requestPasswordReset('nonexistent@example.com');

      expect(result.message).toBe('auth.password_reset.email_sent');
      expect(result.resetTokenId).toBeDefined();
      expect(mockPrisma.passwordReset.create).not.toHaveBeenCalled();
    });

    it('should rate limit password reset requests', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.count.mockResolvedValue(3); // Max attempts reached

      await expect(service.requestPasswordReset('user@example.com')).rejects.toThrow(
        BadRequestException
      );
      expect(mockPrisma.passwordReset.create).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.count.mockResolvedValue(0);
      mockPrisma.passwordReset.create.mockResolvedValue({
        id: 'reset-123',
        token: 'token-hash',
        expiresAt: new Date(),
      });

      await service.requestPasswordReset('USER@EXAMPLE.COM');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });

    it('should trim email whitespace', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.count.mockResolvedValue(0);
      mockPrisma.passwordReset.create.mockResolvedValue({
        id: 'reset-123',
        token: 'token-hash',
        expiresAt: new Date(),
      });

      await service.requestPasswordReset('  user@example.com  ');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });
  });

  describe('verifyResetToken', () => {
    it('should verify valid reset token', async () => {
      const token = 'a'.repeat(64); // 32 bytes = 64 hex chars
      const resetRecord = {
        id: 'reset-123',
        token,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst.mockResolvedValue(resetRecord);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.verifyResetToken(token);

      expect(result.userId).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw error for invalid token format', async () => {
      const shortToken = 'short';

      await expect(service.verifyResetToken(shortToken)).rejects.toThrow(BadRequestException);
      expect(mockPrisma.passwordReset.findFirst).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent token', async () => {
      const token = 'a'.repeat(64);
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(service.verifyResetToken(token)).rejects.toThrow(NotFoundException);
    });

    it('should throw error for expired token', async () => {
      const token = 'a'.repeat(64);
      const expiredRecord = {
        id: 'reset-123',
        token,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst.mockResolvedValue(expiredRecord);

      await expect(service.verifyResetToken(token)).rejects.toThrow(BadRequestException);
    });

    it('should throw error for already used token', async () => {
      const token = 'a'.repeat(64);
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null); // Token already used

      await expect(service.verifyResetToken(token)).rejects.toThrow(NotFoundException);
    });

    it('should throw error if user not found', async () => {
      const token = 'a'.repeat(64);
      const resetRecord = {
        id: 'reset-123',
        token,
        userId: 'non-existent-user',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst.mockResolvedValue(resetRecord);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyResetToken(token)).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token and new password', async () => {
      const token = 'a'.repeat(64);
      const newPassword = 'NewP@ss1234';
      const resetRecord = {
        id: 'reset-123',
        token,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst
        .mockResolvedValueOnce(resetRecord) // For verifyResetToken
        .mockResolvedValueOnce(resetRecord); // For resetPassword

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPasswordService.validatePasswordStrength.mockReturnValue({
        valid: true,
        errors: [],
      });
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, passwordHash: 'new_hash' });
      mockPrisma.passwordReset.update.mockResolvedValue({ ...resetRecord, usedAt: new Date() });
      mockPrisma.passwordReset.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.resetPassword(token, newPassword);

      expect(result.message).toBe('auth.password_reset.success');
      expect(mockPasswordService.validatePasswordStrength).toHaveBeenCalledWith(newPassword);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            passwordHash: 'new_hashed_password',
            failedLoginAttempts: 0,
            lockedUntil: null,
          }),
        })
      );
      expect(mockPrisma.passwordReset.update).toHaveBeenCalled();
      expect(mockPrisma.passwordReset.updateMany).toHaveBeenCalled();
    });

    it('should reject weak password', async () => {
      const token = 'a'.repeat(64);
      const weakPassword = 'weak';

      const resetRecord = {
        id: 'reset-123',
        token,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst.mockResolvedValue(resetRecord);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPasswordService.validatePasswordStrength.mockReturnValue({
        valid: false,
        errors: ['Password must be at least 12 characters'],
      });

      await expect(service.resetPassword(token, weakPassword)).rejects.toThrow(BadRequestException);
      expect(mockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should reset failed login attempts', async () => {
      const token = 'a'.repeat(64);
      const newPassword = 'NewP@ss1234';
      const lockedUser = { ...mockUser, failedLoginAttempts: 5, lockedUntil: new Date() };
      const resetRecord = {
        id: 'reset-123',
        token,
        userId: lockedUser.id,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst
        .mockResolvedValueOnce(resetRecord)
        .mockResolvedValueOnce(resetRecord);

      mockPrisma.user.findUnique.mockResolvedValue(lockedUser);
      mockPasswordService.validatePasswordStrength.mockReturnValue({ valid: true, errors: [] });
      mockPrisma.user.update.mockResolvedValue({ ...lockedUser, failedLoginAttempts: 0 });
      mockPrisma.passwordReset.update.mockResolvedValue({ ...resetRecord, usedAt: new Date() });
      mockPrisma.passwordReset.updateMany.mockResolvedValue({ count: 0 });

      await service.resetPassword(token, newPassword);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 0,
            lockedUntil: null,
          }),
        })
      );
    });

    it('should invalidate all other reset tokens for user', async () => {
      const token = 'a'.repeat(64);
      const newPassword = 'NewP@ss1234';
      const resetRecord = {
        id: 'reset-123',
        token,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst
        .mockResolvedValueOnce(resetRecord)
        .mockResolvedValueOnce(resetRecord);

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPasswordService.validatePasswordStrength.mockReturnValue({ valid: true, errors: [] });
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.update.mockResolvedValue({ ...resetRecord, usedAt: new Date() });
      mockPrisma.passwordReset.updateMany.mockResolvedValue({ count: 2 });

      await service.resetPassword(token, newPassword);

      expect(mockPrisma.passwordReset.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          id: { not: resetRecord.id },
          usedAt: null,
        },
        data: { usedAt: expect.any(Date) },
      });
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      mockPrisma.passwordReset.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(5);
      expect(mockPrisma.passwordReset.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
          usedAt: null,
        },
      });
    });

    it('should return 0 if no expired tokens', async () => {
      mockPrisma.passwordReset.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(0);
    });
  });

  describe('getResetStatus', () => {
    it('should return false if no pending reset', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      const result = await service.getResetStatus('user-123');

      expect(result.hasPendingReset).toBe(false);
      expect(result.expiresAt).toBeUndefined();
    });

    it('should return true with expiry date if pending reset exists', async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const pendingReset = {
        id: 'reset-123',
        userId: 'user-123',
        expiresAt,
        usedAt: null,
      };

      mockPrisma.passwordReset.findFirst.mockResolvedValue(pendingReset);

      const result = await service.getResetStatus('user-123');

      expect(result.hasPendingReset).toBe(true);
      expect(result.expiresAt).toEqual(expiresAt);
    });

    it('should not return expired resets', async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null); // No valid pending reset

      const result = await service.getResetStatus('user-123');

      expect(result.hasPendingReset).toBe(false);
      expect(mockPrisma.passwordReset.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          usedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
      });
    });
  });
});
