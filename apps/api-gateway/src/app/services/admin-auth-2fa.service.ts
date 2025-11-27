import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AdminJwtService, AdminTokensResponse } from '@workix/domain/admin';
import { Admin2FAService } from './admin-2fa.service';
import { GatewayPrismaService } from '../../prisma/gateway-prisma.service';

/**
 * Service for handling 2FA verification during login
 */
@Injectable()
export class AdminAuth2FAService {
  private readonly logger = new Logger(AdminAuth2FAService.name);

  constructor(
    @Inject('PrismaService') private prisma: GatewayPrismaService,
    private adminJwtService: AdminJwtService,
    private admin2FAService: Admin2FAService,
  ) {}

  /**
   * Verify 2FA code and complete login
   */
  async verify2FAAndLogin(adminId: string, totpCode: string): Promise<AdminTokensResponse & { admin: { id: string; email: string; role: string } }> {
    const admin = await this.prisma.gatewayAdmin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    if (!admin.twoFactorEnabled) {
      throw new UnauthorizedException('2FA is not enabled for this admin');
    }

    // Verify TOTP code
    const isValid = await this.admin2FAService.verifyLoginTotp(adminId, totpCode);

    if (!isValid) {
      // Log failed 2FA attempt
      await this.prisma.gatewayAuditLog.create({
        data: {
          adminId,
          action: '2fa_verification_failed',
          resourceType: 'admin',
          details: { reason: 'Invalid TOTP code' },
        },
      });
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Generate final tokens
    const tokens = await this.adminJwtService.generateTokens(admin.id, admin.email, admin.role);

    // Create session
    const tokenHash = await bcrypt.hash(tokens.accessToken, 10);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await this.prisma.gatewayAdminSession.create({
      data: {
        adminId: admin.id,
        tokenHash,
        refreshTokenHash,
        expiresAt,
      },
    });

    // Update last login
    await this.prisma.gatewayAdmin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful 2FA login
    await this.prisma.gatewayAuditLog.create({
      data: {
        adminId,
        action: 'login_2fa_success',
        resourceType: 'admin',
        details: { method: '2FA' },
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
