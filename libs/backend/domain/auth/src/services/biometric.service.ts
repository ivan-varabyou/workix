import { BadRequestException, Inject, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import * as crypto from 'crypto';

import { BiometricData, BiometricTemplate } from '../interfaces/device.interface';
import { AuthPrismaService } from '../interfaces/prisma-auth.interface';

/**
 * Biometric Authentication Service
 * Supports fingerprint and face ID authentication
 */
@Injectable()
export class BiometricService {
  private readonly logger: Logger = new Logger(BiometricService.name);

  private prisma: AuthPrismaService;

  constructor(@Optional() @Inject('PrismaService') prisma: AuthPrismaService) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.');
    }
    this.prisma = prisma;
  }

  private get prismaClient(): AuthPrismaService {
    return this.prisma;
  }

  /**
   * Register biometric data
   */
  async registerBiometric(
    userId: string,
    biometricData: BiometricData
  ): Promise<{
    biometricId: string;
    message: string;
  }> {
    // Validate biometric type
    if (!['fingerprint', 'face'].includes(biometricData.type)) {
      throw new BadRequestException('Invalid biometric type. Use: fingerprint, face');
    }

    // Hash biometric template (never store raw data)
    const biometricHash: string = this.hashBiometricTemplate(biometricData.template);

    // Check if already registered
    const existing: {
      id: string;
    } | null = await this.prismaClient.biometric.findFirst({
      where: {
        userId,
        type: biometricData.type,
        templateHash: biometricHash,
      },
    });

    if (existing) {
      throw new BadRequestException('This biometric is already registered');
    }

    // Store biometric record
    const createData: {
      userId: string;
      type: 'fingerprint' | 'face';
      templateHash: string;
      deviceId?: string | null;
      deviceName?: string | null;
    } = {
      userId,
      type: biometricData.type,
      templateHash: biometricHash,
    };
    if (biometricData.deviceId !== undefined) {
      createData.deviceId = biometricData.deviceId;
    }
    const deviceName: string = biometricData.deviceName || 'Unknown Device';
    if (deviceName) {
      createData.deviceName = deviceName;
    }
    const biometric: {
      id: string;
    } = await this.prismaClient.biometric.create({
      data: createData,
    });

    this.logger.log(`Biometric registered for user: ${userId}, type: ${biometricData.type}`);

    return {
      biometricId: biometric.id,
      message: `${biometricData.type} biometric registered successfully`,
    };
  }

  /**
   * Verify biometric data
   */
  async verifyBiometric(
    userId: string,
    biometricData: BiometricData
  ): Promise<{
    verified: boolean;
    biometricId: string;
    matchScore: number;
  }> {
    // Get registered biometrics for user
    const registeredBiometrics: BiometricTemplate[] = await this.prismaClient.biometric.findMany({
      where: { userId, type: biometricData.type },
    });

    if (registeredBiometrics.length === 0) {
      throw new BadRequestException('No biometric data registered for this user');
    }

    // Calculate match score (simulated - in production use actual biometric SDK)
    const incomingHash: string = this.hashBiometricTemplate(biometricData.template);
    const matchScore: number = this.calculateMatchScore(incomingHash, registeredBiometrics);

    // Verify with threshold (usually 95%+)
    const threshold: number = 0.95;
    if (matchScore < threshold) {
      throw new BadRequestException('Biometric verification failed');
    }

    // Find matched biometric
    const matchedBiometric: BiometricTemplate | undefined = registeredBiometrics.find(
      (b: BiometricTemplate): boolean => this.calculateScore(incomingHash, b.templateHash) >= threshold
    );

    if (!matchedBiometric) {
      throw new Error('Biometric verification failed: no match found');
    }

    // Update last used
    await this.prismaClient.biometric.update({
      where: { id: matchedBiometric.id },
      data: { lastUsedAt: new Date() },
    });

    this.logger.log(`Biometric verified for user: ${userId}`);

    return {
      verified: true,
      biometricId: matchedBiometric.id,
      matchScore,
    };
  }

  /**
   * Get user biometrics
   */
  async getUserBiometrics(userId: string): Promise<BiometricTemplate[]> {
    return await this.prismaClient.biometric.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        deviceName: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Remove biometric
   */
  async removeBiometric(userId: string, biometricId: string): Promise<{ message: string }> {
    const biometric: BiometricTemplate | null = await this.prismaClient.biometric.findFirst({
      where: { id: biometricId, userId },
    });

    if (!biometric) {
      throw new NotFoundException('Biometric not found');
    }

    await this.prismaClient.biometric.delete({
      where: { id: biometricId },
    });

    this.logger.log(`Biometric removed for user: ${userId}, id: ${biometricId}`);

    return {
      message: 'Biometric removed successfully',
    };
  }

  /**
   * Check if user has biometric enabled
   */
  async hasBiometricEnabled(userId: string, type?: 'fingerprint' | 'face'): Promise<boolean> {
    const where: { userId: string; type?: 'fingerprint' | 'face' } = { userId };
    if (type) {
      where.type = type;
    }

    const count: number = await this.prismaClient.biometric.count({ where });
    return count > 0;
  }

  /**
   * Get biometric statistics
   */
  async getBiometricStats(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
  }> {
    const biometrics: BiometricTemplate[] = await this.prismaClient.biometric.findMany({
      where: { userId },
    });

    const byType: Record<string, number> = {
      fingerprint: 0,
      face: 0,
    };

    biometrics.forEach((b: BiometricTemplate): void => {
      if (b.type && (b.type === 'fingerprint' || b.type === 'face')) {
        const count: number | undefined = byType[b.type];
        if (count !== undefined) {
          byType[b.type] = count + 1;
        }
      }
    });

    return {
      total: biometrics.length,
      byType,
    };
  }

  /**
   * Cleanup old biometric attempts (security)
   */
  async cleanupOldFailedAttempts(): Promise<number> {
    const thirtyDaysAgo: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result: { count: number } = await this.prismaClient.biometricAttempt.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old biometric attempts`);

    return result.count;
  }

  /**
   * Record failed verification attempt
   */
  async recordFailedAttempt(userId: string, type: 'fingerprint' | 'face'): Promise<void> {
    // Check if user has too many failed attempts
    const oneHourAgo: Date = new Date(Date.now() - 60 * 60 * 1000);
    const recentFailed: number = await this.prismaClient.biometricAttempt.count({
      where: {
        userId,
        type,
        success: false,
        createdAt: { gt: oneHourAgo },
      },
    });

    if (recentFailed >= 5) {
      throw new BadRequestException('Too many failed biometric attempts. Try again in 1 hour.');
    }

    await this.prismaClient.biometricAttempt.create({
      data: {
        userId,
        type,
        success: false,
      },
    });
  }

  /**
   * Hash biometric template using SHA-256
   */
  private hashBiometricTemplate(template: string): string {
    return crypto.createHash('sha256').update(template).digest('hex');
  }

  /**
   * Calculate match score between two hashes (simplified)
   */
  private calculateScore(hash1: string, hash2: string): number {
    if (hash1 === hash2) {
      return 1.0;
    }

    // Hamming distance-like calculation for similarity
    let matches: number = 0;
    for (let i: number = 0; i < Math.min(hash1.length, hash2.length); i++) {
      if (hash1[i] === hash2[i]) matches++;
    }

    return matches / Math.max(hash1.length, hash2.length);
  }

  /**
   * Calculate overall match score
   */
  private calculateMatchScore(
    incomingHash: string,
    registeredBiometrics: BiometricTemplate[]
  ): number {
    const scores: number[] = registeredBiometrics.map((b: BiometricTemplate): number =>
      this.calculateScore(incomingHash, b.templateHash)
    );
    const maxScore: number = Math.max(...scores, 0);
    return maxScore;
  }
}
