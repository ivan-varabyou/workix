import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AdminAuthService, AdminTokensResponse } from '@workix/backend/domain/admin';
import * as bcrypt from 'bcrypt';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';
import { Admin2FAService } from './admin-2fa.service';

/**
 * Service for handling 2FA verification during login
 */
@Injectable()
export class AdminAuth2FAService {
  private readonly logger: Logger = new Logger(AdminAuth2FAService.name);

  constructor(
    @Inject('PrismaService') private prisma: AdminPrismaService,
    private adminAuthService: AdminAuthService,
    private admin2FAService: Admin2FAService,
  ) {}

  /**
   * Verify 2FA code and complete login
   */
  async verify2FAAndLogin(adminId: string, totpCode: string): Promise<AdminTokensResponse & { admin: { id: string; email: string; role: string } }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
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
          resourceType: 'admin',
          metadata: { reason: 'Invalid TOTP code' },
        },
      });
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Generate final tokens
    const tokens: AdminTokensResponse = await this.adminAuthService.generateAdminTokens(admin.id, admin.email, admin.role);

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
        resourceType: 'admin',
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
