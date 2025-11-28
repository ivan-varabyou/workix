import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AdminAuthService, AdminJwtService, AdminTokensResponse } from '@workix/backend/domain/admin';
import * as bcrypt from 'bcrypt';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';
import { Admin2FAService } from './admin-2fa.service';

/**
 * Admin 2FA Integration Service
 * Integrates 2FA verification with admin authentication
 * Uses library AdminAuthService and AdminJwtService
 */
@Injectable()
export class Admin2FAIntegrationService {
  private readonly logger: Logger = new Logger(Admin2FAIntegrationService.name);

  constructor(
    @Inject('IDatabaseService') private prisma: AdminPrismaService,
    private adminAuthService: AdminAuthService,
    private adminJwtService: AdminJwtService,
    private admin2FAService: Admin2FAService,
  ) {}

  /**
   * Verify 2FA code and complete login
   */
  async verify2FAAndLogin(adminId: string, totpCode: string): Promise<AdminTokensResponse & { admin: { id: string; email: string; role: string } }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    if (!admin.twoFactorEnabled) {
      throw new UnauthorizedException('2FA is not enabled for this admin');
    }

    // Verify TOTP code
    const isValid: boolean = await this.admin2FAService.verifyLoginTotp(adminId, totpCode);

    if (!isValid) {
      // Log failed 2FA attempt
      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: '2fa_verification_failed',
          entityType: 'admin',
          metadata: { reason: 'Invalid TOTP code' },
        },
      });
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Generate final tokens using library service
    const tokens: AdminTokensResponse = await this.adminJwtService.generateTokens(admin.id, admin.email, admin.role);

    // Create session
    const tokenHash: string = await bcrypt.hash(tokens.accessToken, 10);
    const refreshTokenHash: string = await bcrypt.hash(tokens.refreshToken, 10);

    const expiresAt: Date = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash,
        refreshTokenHash,
        expiresAt,
      },
    });

    // Update last login
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful 2FA login
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'login_2fa_success',
        entityType: 'admin',
        metadata: { method: '2FA' },
      },
    });

    this.logger.log(`Admin logged in with 2FA: ${admin.email}`);

    return {
      ...tokens,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
