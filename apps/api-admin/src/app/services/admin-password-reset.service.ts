import { BadRequestException, Inject, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';
import { AdminNotificationService } from './admin-notification.service';
import { AdminTokenCacheService } from './admin-token-cache.service';

/**
 * Admin Password Reset Service
 * Handles password reset requests and token verification for Admin admins
 */
@Injectable()
export class AdminPasswordResetService {
  private readonly logger = new Logger(AdminPasswordResetService.name);
  private readonly TOKEN_EXPIRY_MINUTES = 60; // 1 hour for admin reset tokens
  private readonly MAX_RESET_ATTEMPTS = 3; // Max 3 reset requests per hour
  private readonly RESET_ATTEMPT_WINDOW_MINUTES = 60;
  private readonly MIN_PASSWORD_LENGTH = 12;

  constructor(
    @Inject('PrismaService') private prisma: AdminPrismaService,
    @Optional() private tokenCacheService?: AdminTokenCacheService,
    @Optional() private notificationService?: AdminNotificationService,
  ) {}

  /**
   * Request password reset
   * Generates reset token and stores it in database
   */
  async requestPasswordReset(email: string, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    const admin = await this.prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Don't reveal if admin exists (security best practice)
    if (!admin) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return { message: 'If an admin with this email exists, a reset link has been sent' };
    }

    if (!admin.isActive) {
      this.logger.warn(`Password reset requested for inactive admin: ${email}`);
      return { message: 'If an admin with this email exists, a reset link has been sent' };
    }

    // Check rate limiting (max 3 requests per hour)
    const oneHourAgo = new Date(Date.now() - this.RESET_ATTEMPT_WINDOW_MINUTES * 60 * 1000);
    const recentResets = await this.prisma.passwordReset.count({
      where: {
        adminId: admin.id,
        createdAt: { gte: oneHourAgo },
        usedAt: null,
      },
    });

    if (recentResets >= this.MAX_RESET_ATTEMPTS) {
      this.logger.warn(`Too many password reset requests for admin: ${email}`);
      throw new BadRequestException('Too many reset requests. Please try again later.');
    }

    // Generate reset token
    const token = this.generateResetToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.TOKEN_EXPIRY_MINUTES);

    // Invalidate all previous unused reset tokens for this admin
    await this.prisma.passwordReset.updateMany({
      where: {
        adminId: admin.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Create new reset token
    const resetData: {
      adminId: string;
      token: string;
      expiresAt: Date;
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId: admin.id,
      token,
      expiresAt,
    };
    if (ipAddress) {
      resetData.ipAddress = ipAddress;
    }
    if (userAgent) {
      resetData.userAgent = userAgent;
    }

    await this.prisma.passwordReset.create({
      data: resetData,
    });

    // Log audit
    const auditData: {
      adminId: string;
      action: string;
      entityType: string;
      metadata: { email: string };
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId: admin.id,
      action: 'password_reset_requested',
      entityType: 'admin',
      metadata: { email: admin.email },
    };
    if (ipAddress) {
      auditData.ipAddress = ipAddress;
    }
    if (userAgent) {
      auditData.userAgent = userAgent;
    }
    await this.prisma.auditLog.create({
      data: auditData,
    });

    this.logger.log(`Password reset token generated for admin: ${email}`);

    // TODO: Send email with reset link
    // In production, integrate with email service
    // const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password?token=${token}`;
    // await this.emailService.sendPasswordResetEmail(admin.email, resetLink);

    return {
      message: 'If an admin with this email exists, a reset link has been sent',
    };
  }

  /**
   * Verify reset token
   */
  async verifyResetToken(token: string): Promise<{ adminId: string; email: string }> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token },
      select: {
        adminId: true,
        usedAt: true,
        expiresAt: true,
        admin: { select: { id: true, email: true, isActive: true } }
      },
    });

    if (!passwordReset) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    if (passwordReset.usedAt) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    if (!passwordReset.admin.isActive) {
      throw new BadRequestException('Admin account is inactive');
    }

    return {
      adminId: passwordReset.adminId,
      email: passwordReset.admin.email,
    };
  }

  /**
   * Reset password with valid token
   */
  async resetPassword(token: string, newPassword: string, ipAddress?: string, userAgent?: string): Promise<{ message: string }> {
    // Verify token first
    const adminInfo = await this.verifyResetToken(token);

    // Validate password strength
    if (newPassword.length < this.MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Get password reset record
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!passwordReset) {
      throw new NotFoundException('Password reset token not found');
    }

    // Update admin password
    await this.prisma.admin.update({
      where: { id: adminInfo.adminId },
      data: {
        passwordHash,
        failedLoginAttempts: 0, // Reset failed attempts
        lockedUntil: null,
      },
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all other reset tokens for this admin
    await this.prisma.passwordReset.updateMany({
      where: {
        adminId: adminInfo.adminId,
        id: { not: passwordReset.id },
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Invalidate all sessions (logout from all devices)
    await this.prisma.adminSession.deleteMany({
      where: { adminId: adminInfo.adminId },
    });

    // Revoke all tokens in Redis if available
    if (this.tokenCacheService) {
      await this.tokenCacheService.revokeAllTokensForAdmin(adminInfo.adminId);
    }

    // Log audit
    const auditData: {
      adminId: string;
      action: string;
      entityType: string;
      metadata: { email: string };
      ipAddress?: string;
      userAgent?: string;
    } = {
      adminId: adminInfo.adminId,
      action: 'password_reset_completed',
      entityType: 'admin',
      metadata: { email: adminInfo.email },
    };
    if (ipAddress) {
      auditData.ipAddress = ipAddress;
    }
    if (userAgent) {
      auditData.userAgent = userAgent;
    }
    await this.prisma.auditLog.create({
      data: auditData,
    });

    this.logger.log(`Password reset completed for admin: ${adminInfo.email}`);

    // Notify about password reset
    if (this.notificationService) {
      await this.notificationService.notifyPasswordChanged(adminInfo.adminId, adminInfo.email, ipAddress, userAgent);
    }

    return {
      message: 'Password reset successfully. All sessions have been invalidated.',
    };
  }

  /**
   * Generate random reset token
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
