import { BadRequestException, Inject, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import * as crypto from 'crypto';

import type { EventPublisherService } from '@workix/shared/backend/core';
import type { EmailVerificationEvent } from '@workix/shared/backend/core';
import {
  AuthPrismaService,
  EmailVerification,
  EmailVerificationCreateData,
  User,
} from '../../interfaces/prisma-auth.interface';

/**
 * Email Verification Service
 * Handles email verification workflows
 */
@Injectable()
export class EmailVerificationService {
  private readonly logger: Logger = new Logger(EmailVerificationService.name);

  private readonly TOKEN_EXPIRY_MINUTES: number = 24 * 60; // 24 hours
  // private readonly MAX_RESENDS = 5; // Reserved for future use
  private readonly RESEND_COOLDOWN_MINUTES: number = 5;

  private prisma: AuthPrismaService;

  constructor(
    @Optional() @Inject('PrismaService') prisma: AuthPrismaService,
    @Optional() @Inject('EventPublisherService') private readonly eventPublisher?: EventPublisherService
  ) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.');
    }
    this.prisma = prisma;
  }

  // Type assertion for Prisma Client methods
  private get prismaClient(): AuthPrismaService {
    return this.prisma;
  }

  /**
   * Send verification email to user
   */
  async sendVerificationEmail(
    email: string,
    userId?: string
  ): Promise<{ token: string; expiresAt: Date }> {
    const normalizedEmail: string = email.toLowerCase();

    // Check if already verified
    if (userId) {
      const user: User | null = await this.prismaClient.user.findUnique({ where: { id: userId } });
      if (user?.emailVerified) {
        throw new BadRequestException(
          'Email is already verified'
        );
      }
    }

    // Check for existing unverified token
    const existing: { token: string; expiresAt: Date; resendCount: number } | null = await this.prismaClient.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing && existing.expiresAt > new Date()) {
      // Token still valid, return it
      return {
        token: existing.token,
        expiresAt: existing.expiresAt,
      };
    }

    // Generate new verification token
    const token: string = this.generateVerificationToken();
    const expiresAt: Date = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

    const createData: EmailVerificationCreateData = {
      email: normalizedEmail,
      token,
      expiresAt,
      resendCount: existing ? existing.resendCount : 0,
    };
    if (userId !== undefined) {
      createData.userId = userId;
    }
    await this.prismaClient.emailVerification.create({
      data: createData,
    });

    this.logger.log(`Email verification token sent to: ${normalizedEmail}`);

    // Publish email verification event to queue (async, non-blocking)
    if (this.eventPublisher) {
      const verificationLink: string = `${process.env.FRONTEND_URL || 'http://localhost:7300'}/verify-email?token=${token}`;
      const event: Omit<EmailVerificationEvent, 'type' | 'timestamp'> = {
        email: normalizedEmail,
        token,
        expiresAt,
        verificationLink,
      };
      if (userId !== undefined) {
        event.userId = userId;
      }
      await this.eventPublisher.publishEmailVerification(event).catch((error: unknown): void => {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to publish email verification event: ${errorMessage}`);
        // Don't throw - token is saved, user can request resend
      });
    } else {
      // Fallback: log in development
      // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`[DEV ONLY] Verification link: http://localhost:7300/verify-email?token=${token.substring(0, 20)}...`);
      }
    }

    return { token, expiresAt };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ user: User; message: string }> {
    if (!token || token.length < 20) {
      throw new BadRequestException('Invalid verification token');
    }

    const emailVerification: EmailVerification | null = await this.prismaClient.emailVerification.findFirst({
      where: { token, verifiedAt: null },
    });

    if (!emailVerification) {
      throw new NotFoundException('Verification token has already been used');
    }

    // Check if expired
    if (emailVerification.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    let user: User | null;

    if (emailVerification.userId) {
      // Update existing user
      user = await this.prismaClient.user.findUnique({
        where: { id: emailVerification.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    } else {
      // Create or find user by email
      user = await this.prismaClient.user.findUnique({
        where: { email: emailVerification.email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // At this point user is guaranteed to be non-null
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mark email as verified
    const updatedUser: User = await this.prismaClient.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Mark verification as completed
    await this.prismaClient.emailVerification.update({
      where: { id: emailVerification.id },
      data: { verifiedAt: new Date() },
    });

    this.logger.log(`Email verified for: ${updatedUser.email}`);

    return {
      user: updatedUser,
      message: 'Email verified successfully',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    email: string
  ): Promise<{ token: string; expiresAt: Date; message: string }> {
    const normalizedEmail: string = email.toLowerCase();

    // Find latest unverified token
    const existing: EmailVerification | null = await this.prismaClient.emailVerification.findFirst({
      where: { email: normalizedEmail, verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!existing) {
      throw new NotFoundException('No pending verification found');
    }

    // Check resend limit
    if (existing.resendCount >= existing.maxResends) {
      throw new BadRequestException(
        'Maximum resend attempts exceeded. Please try again later'
      );
    }

    // Check resend cooldown (5 minutes between resends)
    if (existing.lastResendAt) {
      const timeSinceLastResend: number = Date.now() - existing.lastResendAt.getTime();
      const cooldownMs: number = this.RESEND_COOLDOWN_MINUTES * 60 * 1000;

      if (timeSinceLastResend < cooldownMs) {
        const secondsRemaining: number = Math.ceil((cooldownMs - timeSinceLastResend) / 1000);
        throw new BadRequestException(
          `Please wait ${secondsRemaining} seconds before resending verification email`
        );
      }
    }

    // Update resend count and timestamp
    const updated: EmailVerification = await this.prismaClient.emailVerification.update({
      where: { id: existing.id },
      data: {
        resendCount: existing.resendCount + 1,
        lastResendAt: new Date(),
        expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    this.logger.log(
      `Verification email resent to: ${normalizedEmail} (attempt ${updated.resendCount}/${updated.maxResends})`
    );
    // SECURITY: Never log tokens in production
    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `[DEV ONLY] Verification link: http://localhost:7300/verify-email?token=${updated.token.substring(0, 20)}...`
      );
    }

    return {
      token: updated.token,
      expiresAt: updated.expiresAt,
      message: `Verification email resent successfully. ${updated.maxResends - updated.resendCount} attempts remaining`,
    };
  }

  /**
   * Check verification status
   */
  async getVerificationStatus(email: string): Promise<{
    verified: boolean;
    expiresAt?: Date;
    resendCount?: number;
    maxResends?: number;
  }> {
    const normalizedEmail: string = email.toLowerCase();

    const user: User | null = await this.prismaClient.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      return { verified: true };
    }

    const verification: EmailVerification | null = await this.prismaClient.emailVerification.findFirst({
      where: { email: normalizedEmail, verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return { verified: false };
    }

    return {
      verified: false,
      expiresAt: verification.expiresAt,
      resendCount: verification.resendCount,
      maxResends: verification.maxResends,
    };
  }

  /**
   * Generate random verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
