import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhoneOtpService } from '@workix/domain/auth';

describe('PhoneOtpService', () => {
  let service: PhoneOtpService;
  let prisma: any;
  let mockJwtService: any;
  let mockPasswordService: any;
  let mockI18nService: any;

  beforeEach(() => {
    prisma = {
      phoneOtp: {
        count: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    mockJwtService = {
      generateTokens: vi.fn(),
    };

    mockPasswordService = {
      hashPassword: vi.fn(),
    };

    mockI18nService = {
      translate: vi.fn((key: string) => key),
    };

    service = new PhoneOtpService(prisma, mockJwtService, mockPasswordService, mockI18nService);
  });

  describe('sendOtp', () => {
    it('should generate and send OTP successfully', async () => {
      const phoneOtp = {
        id: 'otp-id',
        phoneNumber: '+1234567890',
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
        attempts: 0,
        maxAttempts: 5,
        lockedUntil: null,
        verifiedAt: null,
      };

      vi.mocked(prisma.phoneOtp.count).mockResolvedValue(0);
      vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.phoneOtp.create).mockResolvedValue(phoneOtp);

      const result = await service.sendOtp('+1234567890');

      expect(result.message).toBe('auth.phone_otp.sent_success');
      expect(result.expiresAt).toBeDefined();
      expect(prisma.phoneOtp.create).toHaveBeenCalled();
    });

    it('should throw error if too many OTP requests', async () => {
      vi.mocked(prisma.phoneOtp.count).mockResolvedValue(3); // 3 requests already sent

      await expect(service.sendOtp('+1234567890')).rejects.toThrow(
        'auth.phone_otp.too_many_requests'
      );
    });

    it('should regenerate OTP if active OTP exists', async () => {
      const existingOtp = {
        id: 'existing-otp',
        code: '000000',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        lockedUntil: null,
        verifiedAt: null,
        phoneNumber: '+1234567890',
        createdAt: new Date(),
      };

      const updatedOtp = {
        ...existingOtp,
        code: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
      };

      vi.mocked(prisma.phoneOtp.count).mockResolvedValue(1);
      vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(existingOtp);
      vi.mocked(prisma.phoneOtp.update).mockResolvedValue(updatedOtp);

      const result = await service.sendOtp('+1234567890');

      expect(result.message).toBe('auth.phone_otp.sent_success');
      expect(prisma.phoneOtp.update).toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and create new user', async () => {
      const phoneOtp = {
        id: 'otp-id',
        phoneNumber: '+1234567890',
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        lockedUntil: null,
        verifiedAt: null,
      };

      const newUser = {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Test User',
        phoneNumber: '+1234567890',
        emailVerified: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(phoneOtp);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPasswordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(prisma.user.create).mockResolvedValue(newUser);
      vi.mocked(prisma.phoneOtp.update).mockResolvedValue({
        ...phoneOtp,
        verifiedAt: new Date(),
      });
      vi.mocked(mockJwtService.generateTokens).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });

      const result = await service.verifyOtp(
        '+1234567890',
        '123456',
        'user@example.com',
        'Test User'
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.user.id).toBe('user-id');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if OTP expired', async () => {
      const phoneOtp = {
        id: 'otp-id',
        expiresAt: new Date(Date.now() - 1000), // Expired
        attempts: 0,
        maxAttempts: 5,
        lockedUntil: null,
        verifiedAt: null,
        phoneNumber: '+1234567890',
        code: '123456',
        createdAt: new Date(),
      };

      vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(phoneOtp);

      await expect(service.verifyOtp('+1234567890', '123456')).rejects.toThrow(
        'auth.phone_otp.expired'
      );
    });

    it('should throw error if OTP code incorrect', async () => {
      const phoneOtp = {
        id: 'otp-id',
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        lockedUntil: null,
        verifiedAt: null,
        phoneNumber: '+1234567890',
        createdAt: new Date(),
      };

      vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(phoneOtp);
      vi.mocked(prisma.phoneOtp.update).mockResolvedValue({
        ...phoneOtp,
        attempts: 1,
      });

      await expect(service.verifyOtp('+1234567890', '000000')).rejects.toThrow('Invalid OTP');
    });

    it('should lock out after max attempts', async () => {
      const phoneOtp = {
        id: 'otp-id',
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 4, // One more attempt left
        maxAttempts: 5,
        lockedUntil: null,
        verifiedAt: null,
        phoneNumber: '+1234567890',
        createdAt: new Date(),
      };

      const lockedOtp = {
        ...phoneOtp,
        attempts: 5,
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      };

      vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(phoneOtp);
      vi.mocked(prisma.phoneOtp.update).mockResolvedValue(lockedOtp);

      await expect(service.verifyOtp('+1234567890', '000000')).rejects.toThrow(
        'auth.phone_otp.too_many_failed_attempts'
      );
    });

    it('should link to existing user if email matches', async () => {
      const phoneOtp = {
        id: 'otp-id',
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
        maxAttempts: 5,
        lockedUntil: null,
        verifiedAt: null,
        phoneNumber: '+1234567890',
        createdAt: new Date(),
      };

      const existingUser = {
        id: 'existing-user',
        email: 'user@example.com',
        name: 'Existing User',
        phoneNumber: '+1234567890',
        emailVerified: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(phoneOtp);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
      vi.mocked(prisma.phoneOtp.update).mockResolvedValue({
        ...phoneOtp,
        verifiedAt: new Date(),
      });
      vi.mocked(mockJwtService.generateTokens).mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      });

      const result = await service.verifyOtp('+1234567890', '123456', 'user@example.com');

      expect(result.user.id).toBe('existing-user');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });
});
