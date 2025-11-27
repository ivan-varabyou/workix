import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { BiometricService } from './biometric.service';

describe('BiometricService', () => {
  let service: BiometricService;
  let mockPrisma: any;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
  };

  const mockBiometricData = {
    type: 'fingerprint' as const,
    template: 'test-template-data',
    deviceId: 'device-123',
    deviceName: 'My Device',
  };

  beforeEach(async () => {
    mockPrisma = {
      biometric: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      biometricAttempt: {
        count: vi.fn(),
        create: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiometricService,
        {
          provide: 'PrismaService',
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BiometricService>(BiometricService);
  });

  describe('registerBiometric', () => {
    it('should register fingerprint biometric', async () => {
      mockPrisma.biometric.findFirst.mockResolvedValue(null);
      mockPrisma.biometric.create.mockResolvedValue({
        id: 'bio-123',
        ...mockBiometricData,
      });

      const result = await service.registerBiometric(mockUser.id, mockBiometricData);

      expect(result.biometricId).toBe('bio-123');
      expect(result.message).toContain('registered');
      expect(mockPrisma.biometric.create).toHaveBeenCalled();
    });

    it('should reject duplicate biometric', async () => {
      mockPrisma.biometric.findFirst.mockResolvedValue({
        id: 'bio-existing',
      });

      await expect(service.registerBiometric(mockUser.id, mockBiometricData)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject invalid biometric type', async () => {
      const invalidData = { ...mockBiometricData, type: 'iris' as 'fingerprint' };

      await expect(
        service.registerBiometric(mockUser.id, invalidData as unknown as typeof mockBiometricData)
      ).rejects.toThrow(BadRequestException);
    });

    it('should register face biometric', async () => {
      const faceData = { ...mockBiometricData, type: 'face' as const };
      mockPrisma.biometric.findFirst.mockResolvedValue(null);
      mockPrisma.biometric.create.mockResolvedValue({
        id: 'bio-face-123',
        ...faceData,
      });

      const result = await service.registerBiometric(mockUser.id, faceData);

      expect(result.message).toContain('face');
    });
  });

  describe('verifyBiometric', () => {
    it('should verify matching biometric', async () => {
      const registeredBiometric = {
        id: 'bio-123',
        templateHash: 'hash-value',
        userId: mockUser.id,
        type: mockBiometricData.type,
      };

      mockPrisma.biometric.findMany.mockResolvedValue([registeredBiometric]);
      mockPrisma.biometric.update.mockResolvedValue(registeredBiometric);

      // Mock hash calculation to return high match score
      vi.spyOn(service as any, 'calculateMatchScore').mockReturnValue(0.99);
      vi.spyOn(service as any, 'calculateScore').mockReturnValue(0.99);

      const result = await service.verifyBiometric(mockUser.id, mockBiometricData);

      expect(result.verified).toBe(true);
      expect(result.matchScore).toBeGreaterThanOrEqual(0.95);
      expect(mockPrisma.biometric.update).toHaveBeenCalled();
    });

    it('should reject non-matching biometric', async () => {
      const registeredBiometric = {
        id: 'bio-123',
        templateHash: 'hash-value',
      };

      mockPrisma.biometric.findMany.mockResolvedValue([registeredBiometric]);

      // Mock low match score
      vi.spyOn(service as any, 'calculateMatchScore').mockReturnValue(0.5);

      await expect(service.verifyBiometric(mockUser.id, mockBiometricData)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject if no biometric registered', async () => {
      mockPrisma.biometric.findMany.mockResolvedValue([]);

      await expect(service.verifyBiometric(mockUser.id, mockBiometricData)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getUserBiometrics', () => {
    it('should get all user biometrics', async () => {
      const biometrics = [
        { id: 'bio-1', type: 'fingerprint', deviceName: 'Device 1' },
        { id: 'bio-2', type: 'face', deviceName: 'Device 2' },
      ];

      mockPrisma.biometric.findMany.mockResolvedValue(biometrics);

      const result = await service.getUserBiometrics(mockUser.id);

      expect(result).toHaveLength(2);
      expect(mockPrisma.biometric.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        select: expect.any(Object),
      });
    });

    it('should return empty array if no biometrics', async () => {
      mockPrisma.biometric.findMany.mockResolvedValue([]);

      const result = await service.getUserBiometrics(mockUser.id);

      expect(result).toHaveLength(0);
    });
  });

  describe('removeBiometric', () => {
    it('should remove biometric', async () => {
      mockPrisma.biometric.findFirst.mockResolvedValue({
        id: 'bio-123',
        userId: mockUser.id,
      });
      mockPrisma.biometric.delete.mockResolvedValue({});

      const result = await service.removeBiometric(mockUser.id, 'bio-123');

      expect(result.message).toContain('removed');
      expect(mockPrisma.biometric.delete).toHaveBeenCalled();
    });

    it('should reject if biometric not found', async () => {
      mockPrisma.biometric.findFirst.mockResolvedValue(null);

      await expect(service.removeBiometric(mockUser.id, 'bio-999')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('hasBiometricEnabled', () => {
    it('should return true if biometric enabled', async () => {
      mockPrisma.biometric.count.mockResolvedValue(1);

      const result = await service.hasBiometricEnabled(mockUser.id);

      expect(result).toBe(true);
    });

    it('should return false if no biometric', async () => {
      mockPrisma.biometric.count.mockResolvedValue(0);

      const result = await service.hasBiometricEnabled(mockUser.id);

      expect(result).toBe(false);
    });

    it('should filter by type', async () => {
      mockPrisma.biometric.count.mockResolvedValue(1);

      await service.hasBiometricEnabled(mockUser.id, 'fingerprint');

      expect(mockPrisma.biometric.count).toHaveBeenCalledWith({
        where: { userId: mockUser.id, type: 'fingerprint' },
      });
    });
  });

  describe('getBiometricStats', () => {
    it('should return biometric statistics', async () => {
      const biometrics = [{ type: 'fingerprint' }, { type: 'fingerprint' }, { type: 'face' }];

      mockPrisma.biometric.findMany.mockResolvedValue(biometrics);

      const result = await service.getBiometricStats(mockUser.id);

      expect(result.total).toBe(3);
      expect(result.byType.fingerprint).toBe(2);
      expect(result.byType.face).toBe(1);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should record failed biometric attempt', async () => {
      mockPrisma.biometricAttempt.count.mockResolvedValue(0);
      mockPrisma.biometricAttempt.create.mockResolvedValue({});

      await service.recordFailedAttempt(mockUser.id, 'fingerprint');

      expect(mockPrisma.biometricAttempt.create).toHaveBeenCalled();
    });

    it('should reject after 5 failed attempts', async () => {
      mockPrisma.biometricAttempt.count.mockResolvedValue(5);

      await expect(service.recordFailedAttempt(mockUser.id, 'fingerprint')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('cleanupOldFailedAttempts', () => {
    it('should delete old biometric attempts', async () => {
      mockPrisma.biometricAttempt.deleteMany.mockResolvedValue({ count: 10 });

      const result = await service.cleanupOldFailedAttempts();

      expect(result).toBe(10);
      expect(mockPrisma.biometricAttempt.deleteMany).toHaveBeenCalled();
    });
  });
});
