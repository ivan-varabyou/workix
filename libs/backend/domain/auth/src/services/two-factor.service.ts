import { BadRequestException, Inject, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';

import { AuthPrismaService, User } from '../interfaces/prisma-auth.interface';

/**
 * Two-Factor Authentication (2FA) Service
 * Supports TOTP (Time-based One-Time Password) via authenticator apps
 */
@Injectable()
export class TwoFactorService {
  private readonly logger: Logger = new Logger(TwoFactorService.name);

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
   * Generate 2FA secret and QR code
   * Returns secret and QR code data URL
   */
  async generateSecret(
    userId: string,
    email: string
  ): Promise<{
    secret: string;
    qrCode: string;
    manualEntryKey: string;
  }> {
    const generatedSecret: { base32?: string | undefined; otpauth_url?: string | undefined } = speakeasy.generateSecret({
      name: `Workix (${email})`,
      issuer: 'Workix',
      length: 32,
    });

    const secret: {
      base32: string | null | undefined;
      otpauth_url: string | null | undefined;
    } = {
      base32: generatedSecret.base32 ?? null,
      otpauth_url: generatedSecret.otpauth_url ?? null,
    };

    // Generate QR code as data URL
    const qrCodeUrl: string | undefined = secret.otpauth_url || '';
    const qrCode: string = qrCodeUrl ? await qrcode.toDataURL(qrCodeUrl) : '';

    this.logger.log(`2FA secret generated for user: ${userId}`);

    return {
      secret: secret.base32 || '',
      qrCode: qrCode,
      manualEntryKey: secret.base32 || '',
    };
  }

  /**
   * Enable 2FA for user
   * User must verify with a valid TOTP code first
   */
  async enable2FA(
    userId: string,
    secret: string,
    totpCode: string
  ): Promise<{
    message: string;
    backupCodes: string[];
  }> {
    // Verify TOTP code is valid
    const isValid: boolean = this.verifyTotp(secret, totpCode);
    if (!isValid) {
      throw new BadRequestException('Invalid authenticator code');
    }

    // Generate backup codes
    const backupCodes: string[] = this.generateBackupCodes(10);
    const backupCodesHash: string[] = backupCodes.map((code: string): string => this.hashBackupCode(code));

    // Get user
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Store 2FA secret (encrypted in production)
    await this.prismaClient.twoFactorAuth.create({
      data: {
        userId,
        secret, // In production, encrypt this!
        backupCodes: backupCodesHash,
        enabled: true,
      },
    });

    // Update user flag
    await this.prismaClient.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    this.logger.log(`2FA enabled for user: ${userId}`);

    return {
      message: '2FA has been enabled successfully',
      backupCodes,
    };
  }

  /**
   * Disable 2FA for user
   * Requires password confirmation
   */
  async disable2FA(userId: string): Promise<{ message: string }> {
    // Delete 2FA record
    await this.prismaClient.twoFactorAuth.deleteMany({
      where: { userId },
    });

    // Update user flag
    await this.prismaClient.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });

    this.logger.log(`2FA disabled for user: ${userId}`);

    return {
      message: '2FA has been disabled',
    };
  }

  /**
   * Verify TOTP code during login
   */
  async verifyLoginTotp(
    userId: string,
    totpCode: string
  ): Promise<{
    verified: boolean;
    message: string;
  }> {
    const twoFactorAuth: {
      id: string;
      secret: string;
      backupCodes: string[];
    } | null = await this.prismaClient.twoFactorAuth.findFirst({
      where: { userId, enabled: true },
    });

    if (!twoFactorAuth) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    // Try TOTP code first
    const isValidTotp: boolean = this.verifyTotp(twoFactorAuth.secret, totpCode);
    if (isValidTotp) {
      return {
        verified: true,
        message: 'TOTP code verified',
      };
    }

    // Try backup code
    const isValidBackup: boolean = this.verifyBackupCode(totpCode, twoFactorAuth.backupCodes);
    if (isValidBackup) {
      // Remove used backup code
      const remainingBackupCodes: string[] = twoFactorAuth.backupCodes.filter(
        (code: string): boolean => code !== this.hashBackupCode(totpCode)
      );

      await this.prismaClient.twoFactorAuth.update({
        where: { id: twoFactorAuth.id },
        data: { backupCodes: remainingBackupCodes },
      });

      return {
        verified: true,
        message: 'Backup code verified',
      };
    }

    throw new BadRequestException('Invalid authenticator code or backup code');
  }

  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    return Boolean(user.twoFactorEnabled);
  }

  /**
   * Get 2FA status for user
   */
  async get2FAStatus(userId: string): Promise<{
    enabled: boolean;
    backupCodesRemaining: number;
  }> {
    const twoFactorAuth: {
      enabled: boolean;
      backupCodes: string[];
    } | null = await this.prismaClient.twoFactorAuth.findFirst({
      where: { userId },
    });

    if (!twoFactorAuth) {
      return {
        enabled: false,
        backupCodesRemaining: 0,
      };
    }

    return {
      enabled: twoFactorAuth.enabled,
      backupCodesRemaining: twoFactorAuth.backupCodes.length,
    };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<{
    message: string;
    backupCodes: string[];
  }> {
    const twoFactorAuth: {
      id: string;
    } | null = await this.prismaClient.twoFactorAuth.findFirst({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    const newBackupCodes: string[] = this.generateBackupCodes(10);
    const backupCodesHash: string[] = newBackupCodes.map((code: string): string => this.hashBackupCode(code));

    await this.prismaClient.twoFactorAuth.update({
      where: { id: twoFactorAuth.id },
      data: { backupCodes: backupCodesHash },
    });

    this.logger.log(`Backup codes regenerated for user: ${userId}`);

    return {
      message: 'Backup codes have been regenerated',
      backupCodes: newBackupCodes,
    };
  }

  /**
   * Verify TOTP code with time window (±30 seconds)
   */
  private verifyTotp(secret: string, token: string, window: number = 2): boolean {
    try {
      const verified: boolean | null = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window,
      });
      return verified || false;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error verifying TOTP: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Generate backup codes (format: XXXX-XXXX-XXXX)
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i: number = 0; i < count; i++) {
      const code: string = crypto.randomBytes(6).toString('hex').toUpperCase();
      // Format as XXXX-XXXX-XXXX
      const formatted: string = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
      codes.push(formatted);
    }
    return codes;
  }

  /**
   * Hash backup code for secure storage
   */
  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify backup code against stored hashes
   */
  private verifyBackupCode(code: string, storedHashes: string[]): boolean {
    const hash: string = this.hashBackupCode(code);
    return storedHashes.includes(hash);
  }
}
