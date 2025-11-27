import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailVerificationService } from '@workix/domain/auth';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let prisma: any;
  let mockI18nService: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      emailVerification: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    mockI18nService = {
      translate: vi.fn((key: string) => key),
    };

    service = new EmailVerificationService(prisma, mockI18nService);
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      const emailVerification = {
        id: 'ver-id',
        email: 'user@example.com',
        token: 'token-abc-123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userId: null,
        resendCount: 0,
        verifiedAt: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.emailVerification.create).mockResolvedValue(emailVerification);

      const result = await service.sendVerificationEmail('user@example.com');

      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(prisma.emailVerification.create).toHaveBeenCalled();
    });

    it('should throw error if email already verified', async () => {
      const user = {
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);

      await expect(service.sendVerificationEmail('user@example.com', 'user-id')).rejects.toThrow(
        'auth.email_verification.already_verified'
      );
    });

    it('should return existing token if not expired', async () => {
      const existing = {
        id: 'ver-id',
        email: 'user@example.com',
        token: 'existing-token',
        expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000), // Still valid
        userId: null,
        resendCount: 0,
        verifiedAt: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(existing);

      const result = await service.sendVerificationEmail('user@example.com');

      expect(result.token).toBe('existing-token');
      expect(prisma.emailVerification.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const longToken = 'a'.repeat(32);
      const emailVerification = {
        id: 'ver-id',
        email: 'user@example.com',
        token: longToken,
        expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
        userId: 'user-id',
        verifiedAt: null,
        resendCount: 0,
        createdAt: new Date(),
      };

      const user = {
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: false,
        name: 'Test User',
        phoneNumber: null,
        passwordHash: 'hash',
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(emailVerification);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...user,
        emailVerified: true,
      });
      vi.mocked(prisma.emailVerification.update).mockResolvedValue({
        ...emailVerification,
        verifiedAt: new Date(),
      });

      const result = await service.verifyEmail(longToken);

      expect(result.message).toBe('auth.email_verification.success');
      expect(result.user.email).toBe('user@example.com');
    });

    it('should throw error if token invalid', async () => {
      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(null);

      await expect(service.verifyEmail('a'.repeat(32))).rejects.toThrow(
        'auth.email_verification.token_used'
      );
    });

    it('should throw error if token expired', async () => {
      const longToken = 'a'.repeat(32);
      const emailVerification = {
        id: 'ver-id',
        email: 'user@example.com',
        token: longToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
        userId: null,
        resendCount: 0,
        verifiedAt: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(emailVerification);

      await expect(service.verifyEmail(longToken)).rejects.toThrow(
        'auth.email_verification.token_expired'
      );
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      const existing = {
        id: 'ver-id',
        email: 'user@example.com',
        token: 'token-abc-123',
        expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
        resendCount: 0,
        lastResendAt: null,
        userId: null,
        verifiedAt: null,
        createdAt: new Date(),
      };

      const updated = {
        ...existing,
        resendCount: 1,
        lastResendAt: new Date(),
      };

      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(existing);
      vi.mocked(prisma.emailVerification.update).mockResolvedValue(updated);

      const result = await service.resendVerificationEmail('user@example.com');

      expect(result.token).toBeDefined();
      expect(result.message).toBe('auth.email_verification.resend_success');
    });

    it('should throw error if max resends exceeded', async () => {
      const existing = {
        id: 'ver-id',
        email: 'user@example.com',
        resendCount: 5,
        maxResends: 5,
        lastResendAt: new Date(),
        userId: null,
        verifiedAt: null,
        token: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(existing);

      await expect(service.resendVerificationEmail('user@example.com')).rejects.toThrow(
        'auth.email_verification.max_resends_exceeded'
      );
    });

    it('should enforce resend cooldown', async () => {
      const existing = {
        id: 'ver-id',
        email: 'user@example.com',
        resendCount: 0,
        lastResendAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago (cooldown is 5)
        userId: null,
        verifiedAt: null,
        token: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(existing);

      await expect(service.resendVerificationEmail('user@example.com')).rejects.toThrow(
        'auth.email_verification.resend_cooldown'
      );
    });
  });

  describe('getVerificationStatus', () => {
    it('should return verified status', async () => {
      const user = {
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);

      const result = await service.getVerificationStatus('user@example.com');

      expect(result.verified).toBe(true);
    });

    it('should return pending status', async () => {
      const user = {
        id: 'user-id',
        email: 'user@example.com',
        emailVerified: false,
      };

      const verification = {
        expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
        resendCount: 1,
        lastResendAt: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(user);
      vi.mocked(prisma.emailVerification.findFirst).mockResolvedValue(verification);

      const result = await service.getVerificationStatus('user@example.com');

      expect(result.verified).toBe(false);
      expect(result.resendCount).toBe(1);
    });
  });
});
