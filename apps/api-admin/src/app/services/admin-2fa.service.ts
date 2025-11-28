import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';

/**
 * Admin 2FA Service
 * Handles two-factor authentication for Admin admins using TOTP
 */
@Injectable()
export class Admin2FAService {
  private readonly logger: Logger = new Logger(Admin2FAService.name);
  private readonly BACKUP_CODES_COUNT: number = 10;

  constructor(
    @Inject('IDatabaseService') private prisma: AdminPrismaService,
  ) {}

  /**
   * Generate 2FA secret and QR code for admin
   */
  async generateSecret(adminId: string, email: string): Promise<{
    secret: string;
    qrCode: string;
    manualEntryKey: string;
  }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const generatedSecret = speakeasy.generateSecret({
      name: `Workix Admin (${email})`,
      issuer: 'Workix Admin',
      length: 32,
    });

    const secret: string = generatedSecret.base32 || '';
    const otpauthUrl: string | undefined = generatedSecret.otpauth_url;

    // Generate QR code as data URL
    const qrCode: string = otpauthUrl ? await qrcode.toDataURL(otpauthUrl) : '';

    this.logger.log(`2FA secret generated for admin: ${adminId}`);

    return {
      secret,
      qrCode,
      manualEntryKey: secret,
    };
  }

  /**
   * Enable 2FA for admin
   * Admin must verify with a valid TOTP code first
   */
  async enable2FA(adminId: string, secret: string, totpCode: string): Promise<{
    message: string;
    backupCodes: string[];
  }> {
    // Verify TOTP code is valid
    const isValid: boolean = this.verifyTotp(secret, totpCode);
    if (!isValid) {
      throw new BadRequestException('Invalid authenticator code');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Generate backup codes
    const backupCodes: string[] = this.generateBackupCodes(this.BACKUP_CODES_COUNT);
    const backupCodesHash: string[] = backupCodes.map((code: string): string => this.hashBackupCode(code));

    // Store 2FA secret and backup codes
    // TODO: In production, encrypt the secret!
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret, // In production, encrypt this!
        twoFactorBackupCodes: backupCodesHash,
      },
    });

    // Log 2FA enablement
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: '2fa_enabled',
        entityType: 'admin',
        resourceType: 'admin',
        metadata: { enabled: true },
      },
    });

    this.logger.log(`2FA enabled for admin: ${adminId}`);

    return {
      message: '2FA has been enabled successfully',
      backupCodes,
    };
  }

  /**
   * Disable 2FA for admin
   */
  async disable2FA(adminId: string): Promise<{ message: string }> {
    const admin: {
      id: string;
      email: string;
      passwordHash: string;
      name: string | null;
      role: string;
      isActive: boolean;
      lastLoginAt: Date | null;
      failedLoginAttempts: number;
      lockedUntil: Date | null;
      ipWhitelistEnabled: boolean;
      twoFactorEnabled: boolean;
      twoFactorSecret: string | null;
      twoFactorBackupCodes: string[];
      createdAt: Date;
      updatedAt: Date;
    } | null = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Clear 2FA data
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });

    // Log 2FA disablement
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: '2fa_disabled',
        entityType: 'admin',
        resourceType: 'admin',
        metadata: { enabled: false },
      },
    });

    this.logger.log(`2FA disabled for admin: ${adminId}`);

    return {
      message: '2FA has been disabled',
    };
  }

  /**
   * Verify TOTP code during login
   */
  async verifyLoginTotp(adminId: string, totpCode: string): Promise<boolean> {
    const admin: {
      id: string;
      email: string;
      passwordHash: string;
      name: string | null;
      role: string;
      isActive: boolean;
      lastLoginAt: Date | null;
      failedLoginAttempts: number;
      lockedUntil: Date | null;
      ipWhitelistEnabled: boolean;
      twoFactorEnabled: boolean;
      twoFactorSecret: string | null;
      twoFactorBackupCodes: string[];
      createdAt: Date;
      updatedAt: Date;
    } | null = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return false;
    }

    if (!admin.twoFactorEnabled || !admin.twoFactorSecret) {
      return false;
    }

    // Verify TOTP code
    const isValid: boolean = this.verifyTotp(admin.twoFactorSecret, totpCode);

    if (!isValid) {
      // Check backup codes
      return this.verifyBackupCode(admin.twoFactorBackupCodes, totpCode);
    }

    return true;
  }

  /**
   * Verify TOTP code
   */
  private verifyTotp(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps (60 seconds) before/after current time
      });
    } catch (error) {
      this.logger.warn(`TOTP verification error: ${error}`);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  private verifyBackupCode(hashedCodes: string[], code: string): boolean {
    return hashedCodes.some((hashedCode: string): boolean => {
      try {
        return bcrypt.compareSync(code, hashedCode);
      } catch (error) {
        this.logger.warn(`Backup code verification error: ${error}`);
        return false;
      }
    });
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup code
   */
  private hashBackupCode(code: string): string {
    return bcrypt.hashSync(code, 10);
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(adminId: string): Promise<{ backupCodes: string[] }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!admin.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(this.BACKUP_CODES_COUNT);
    const backupCodesHash = backupCodes.map((code) => this.hashBackupCode(code));

    // Update backup codes
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        twoFactorBackupCodes: backupCodesHash,
      },
    });

    // Log regeneration
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: '2fa_backup_codes_regenerated',
        entityType: 'admin',
        resourceType: 'admin',
        metadata: { count: backupCodes.length },
      },
    });

    this.logger.log(`Backup codes regenerated for admin: ${adminId}`);

    return { backupCodes };
  }

  /**
   * Get 2FA status for admin
   */
  async get2FAStatus(adminId: string): Promise<{
    enabled: boolean;
    hasBackupCodes: boolean;
  }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return {
      enabled: admin.twoFactorEnabled,
      hasBackupCodes: admin.twoFactorBackupCodes.length > 0,
    };
  }
}
