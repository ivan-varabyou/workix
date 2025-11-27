import { BadRequestException, Inject, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import * as crypto from 'crypto';

import type { EventPublisherService } from '@workix/shared/backend/core';
import { AuthPrismaService, User } from '../interfaces/prisma-auth.interface';
import { PasswordService } from './password.service';

/**
 * Password Reset Service
 * Handles password reset requests and token verification
 */
@Injectable()
export class PasswordResetService {
  private readonly logger: Logger = new Logger(PasswordResetService.name);

  private readonly TOKEN_EXPIRY_MINUTES: number = 30; // 30 minutes for reset link
  private readonly MAX_RESET_ATTEMPTS: number = 3; // Max 3 reset requests per hour
  private readonly RESET_ATTEMPT_WINDOW_MINUTES: number = 60;

  private prisma: AuthPrismaService;

  constructor(
    @Optional() @Inject('PrismaService') prisma: AuthPrismaService,
    @Inject(PasswordService) private passwordService: PasswordService,
    @Optional() @Inject('EventPublisherService') private readonly eventPublisher?: EventPublisherService
  ) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.');
    }
    this.prisma = prisma;
  }

  private get prismaClient(): AuthPrismaService {
    return this.prisma;
  }

  /**
   * Request password reset
   * Generates reset token and sends email
   */
  async requestPasswordReset(email: string): Promise<{ message: string; resetTokenId: string }> {
    const normalizedEmail: string = email.toLowerCase().trim();

    // Find user by email
    const user: {
      id: string;
      email: string;
    } | null = await this.prismaClient.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      this.logger.log(`Password reset requested for non-existent email: ${normalizedEmail}`);
      return {
        message: 'Password reset email sent',
        resetTokenId: crypto.randomBytes(16).toString('hex'),
      };
    }

    // Check rate limiting - max 3 requests per hour
    const oneHourAgo: Date = new Date(Date.now() - this.RESET_ATTEMPT_WINDOW_MINUTES * 60 * 1000);
    const recentResets: number = await this.prismaClient.passwordReset.count({
      where: {
        userId: user.id,
        createdAt: { gt: oneHourAgo },
        usedAt: null,
      },
    });

    if (recentResets >= this.MAX_RESET_ATTEMPTS) {
      throw new BadRequestException('Too many password reset requests. Please try again later');
    }

    // Generate reset token
    const token: string = this.generateResetToken();
    const expiresAt: Date = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Store reset token
    const passwordReset: {
      id: string;
    } = await this.prismaClient.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    this.logger.log(`Password reset requested for user: ${user.email}`);

    // Publish password reset event to queue (async, non-blocking)
    if (this.eventPublisher) {
      const resetLink: string = `${process.env.FRONTEND_URL || 'http://localhost:7300'}/reset-password?token=${token}`;
      await this.eventPublisher.publishPasswordReset({
        userId: user.id,
        email: user.email,
        token,
        expiresAt,
        resetLink,
        type: 'password.reset.requested',
      }).catch((error: unknown): void => {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to publish password reset event: ${errorMessage}`);
        // Don't throw - token is saved, user can request resend
      });
    } else {
      // Fallback: log in development
      // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`[DEV ONLY] Password reset link: http://localhost:7300/reset-password?token=${token.substring(0, 20)}...`);
      }
    }

    return {
      message: 'Password reset email sent',
      resetTokenId: passwordReset.id,
    };
  }

  /**
   * Verify reset token
   * Checks if token is valid and not expired
   */
  async verifyResetToken(token: string): Promise<{ userId: string; email: string }> {
    if (!token || token.length < 32) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordReset: {
      userId: string;
      expiresAt: Date;
    } | null = await this.prismaClient.passwordReset.findFirst({
      where: { token, usedAt: null },
    });

    if (!passwordReset) {
      throw new NotFoundException('Reset token has already been used');
    }

    // Check if expired
    if (passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Get user info
    const user: User | null = await this.prismaClient.user.findUnique({
      where: { id: passwordReset.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // At this point user is guaranteed to be non-null
    // TypeScript narrows the type after null check

    const userId: string = user.id;

    const userEmail: string = user.email;

    return {
      userId,
      email: userEmail,
    };
  }

  /**
   * Reset password with valid token
   * Updates user password and marks token as used
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Verify token first
    const userInfo: {
      userId: string;
      email: string;
    } = await this.verifyResetToken(token);

    // Validate new password strength
    const validation: { valid: boolean; errors: string[] } = this.passwordService.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Hash new password
    const passwordHash: string = await this.passwordService.hashPassword(newPassword);

    // Get password reset record
    const passwordReset: {
      id: string;
    } | null = await this.prismaClient.passwordReset.findFirst({
      where: { token, usedAt: null },
    });

    // Update user password and mark token as used
    await this.prismaClient.user.update({
      where: { id: userInfo.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0, // Reset failed attempts
        lockedUntil: null,
      },
    });

    if (!passwordReset) {
      throw new NotFoundException('Password reset token not found');
    }

    await this.prismaClient.passwordReset.update({
      where: { id: passwordReset.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all other reset tokens for this user
    await this.prismaClient.passwordReset.updateMany({
      where: {
        userId: userInfo.userId,
        id: { not: passwordReset.id },
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    this.logger.log(`Password reset completed for user: ${userInfo.email}`);

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Generate random reset token
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Clean up expired reset tokens (call periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result: { count: number } = await this.prismaClient.passwordReset.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        usedAt: null,
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired password reset tokens`);
    return result.count;
  }

  /**
   * Get password reset status
   */
  async getResetStatus(userId: string): Promise<{
    hasPendingReset: boolean;
    expiresAt?: Date;
  }> {
    const pendingReset: {
      expiresAt: Date;
    } | null = await this.prismaClient.passwordReset.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!pendingReset) {
      return { hasPendingReset: false };
    }

    return {
      hasPendingReset: true,
      expiresAt: pendingReset.expiresAt,
    };
  }
}
