import { BadRequestException, Inject, Injectable, Logger, Optional } from '@nestjs/common';
import * as crypto from 'crypto';

import { I18nAuthService } from '../../interfaces/i18n-auth.interface';
import {
  AuthPrismaService,
  PhoneOtp,
  User,
  UserCreateData,
} from '../../interfaces/prisma-auth.interface';
import { JwtService } from '../../services/jwt.service';
import { PasswordService } from '../../services/password.service';

/**
 * Phone OTP Service
 * Handles Phone OTP generation, verification, and authentication
 */
@Injectable()
export class PhoneOtpService {
  private readonly logger: Logger = new Logger(PhoneOtpService.name);

  // Rate limiting: max 3 OTP requests per 10 minutes per phone
  private readonly MAX_OTP_REQUESTS_PER_10_MIN: number = 3;
  private readonly OTP_EXPIRY_MINUTES: number = 10;
  private readonly MAX_OTP_ATTEMPTS: number = 5;
  private readonly LOCKOUT_MINUTES: number = 15;

  private prisma: AuthPrismaService;

  constructor(
    @Optional() @Inject('PrismaService') prisma: AuthPrismaService,
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(PasswordService) private passwordService: PasswordService,
    @Optional() @Inject('I18nService') private i18n?: I18nAuthService
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
   * Generate and send OTP to phone
   */
  async sendOtp(phoneNumber: string): Promise<{ id: string; expiresAt: Date; message: string }> {
    const normalizedPhone: string = this.normalizePhoneNumber(phoneNumber);

    // Check rate limiting (max 3 requests per 10 minutes)
    const tenMinutesAgo: Date = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequests: number = await this.prismaClient.phoneOtp.count({
      where: {
        phoneNumber: normalizedPhone,
        createdAt: { gt: tenMinutesAgo },
      },
    });

    if (recentRequests >= this.MAX_OTP_REQUESTS_PER_10_MIN) {
      throw new BadRequestException(
        this.i18n?.translate('auth.phone_otp.too_many_requests') || 'Too many OTP requests'
      );
    }

    // Generate 6-digit OTP
    const code: string = this.generateOtpCode();
    const expiresAt: Date = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Check if there's an active OTP (not verified)
    const existingOtp: PhoneOtp | null = await this.prismaClient.phoneOtp.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingOtp && existingOtp.expiresAt > new Date()) {
      // Replace with new OTP
      const updatedOtp: PhoneOtp = await this.prismaClient.phoneOtp.update({
        where: { id: existingOtp.id },
        data: {
          code,
          expiresAt,
          attempts: 0,
        },
      });
      this.logger.log(`OTP regenerated for phone: ${this.maskPhoneNumber(normalizedPhone)}`);
      return {
        id: updatedOtp.id,
        expiresAt,
        message: this.i18n?.translate('auth.phone_otp.sent_success') || 'OTP sent successfully',
      };
    }

    // Create new OTP
    const phoneOtp: PhoneOtp = await this.prismaClient.phoneOtp.create({
      data: {
        phoneNumber: normalizedPhone,
        code,
        expiresAt,
        attempts: 0,
        maxAttempts: this.MAX_OTP_ATTEMPTS,
      },
    });

    this.logger.log(`OTP sent to: ${this.maskPhoneNumber(normalizedPhone)}`);
    // In production, send SMS via Twilio, AWS SNS, etc.
    // SECURITY: Never log OTP codes in production
    // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`[DEV ONLY] OTP Code for ${this.maskPhoneNumber(normalizedPhone)}: ${code}`);
    }

    return {
      id: phoneOtp.id,
      expiresAt,
      message: this.i18n?.translate('auth.phone_otp.sent_success') || 'OTP sent successfully',
    };
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOtp(
    phoneNumber: string,
    code: string,
    email?: string,
    name?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: { id: string; phoneNumber: string; email?: string; name?: string };
  }> {
    const normalizedPhone: string = this.normalizePhoneNumber(phoneNumber);

    // Get latest OTP
    const phoneOtp: PhoneOtp | null = await this.prismaClient.phoneOtp.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!phoneOtp) {
      throw new BadRequestException(
        this.i18n?.translate('auth.phone_otp.no_active_otp') || 'No active OTP found'
      );
    }

    // Check if locked out
    if (phoneOtp.lockedUntil && phoneOtp.lockedUntil > new Date()) {
      throw new BadRequestException(
        this.i18n?.translate('auth.phone_otp.too_many_failed_attempts') ||
          'Too many failed attempts'
      );
    }

    // Check if expired
    if (phoneOtp.expiresAt < new Date()) {
      throw new BadRequestException(
        this.i18n?.translate('auth.phone_otp.expired') || 'OTP expired'
      );
    }

    // Check code
    if (phoneOtp.code !== code) {
      const newAttempts: number = phoneOtp.attempts + 1;
      const lockedUntil: Date | null =
        newAttempts >= phoneOtp.maxAttempts
          ? new Date(Date.now() + this.LOCKOUT_MINUTES * 60 * 1000)
          : (phoneOtp.lockedUntil ?? null);

      await this.prismaClient.phoneOtp.update({
        where: { id: phoneOtp.id },
        data: {
          attempts: newAttempts,
          lockedUntil,
        },
      });

      if (newAttempts >= phoneOtp.maxAttempts) {
        throw new BadRequestException(
          this.i18n?.translate('auth.phone_otp.too_many_failed_attempts') ||
            'Too many failed attempts'
        );
      }

      throw new BadRequestException(
        `Invalid OTP. ${this.MAX_OTP_ATTEMPTS - newAttempts} attempts remaining.`
      );
    }

    // OTP verified!
    let user: User | null = email
      ? await this.prismaClient.user.findUnique({
          where: { email: email.toLowerCase() },
        })
      : null;

    if (!user) {
      // Create new user
      if (!email) {
        throw new BadRequestException(
          this.i18n?.translate('auth.phone_otp.email_required') || 'Email is required'
        );
      }

      user = await this.createUserFromPhoneOtp(normalizedPhone, email, name);
      this.logger.log(`Created new user from phone OTP: ${normalizedPhone}`);
    } else {
      // Link phone to existing user if needed
      this.logger.log(`Linking phone to existing user: ${email}`);
    }

    // Mark OTP as verified
    await this.prismaClient.phoneOtp.update({
      where: { id: phoneOtp.id },
      data: { verifiedAt: new Date() },
    });

    // At this point user is guaranteed to be non-null
    if (!user) {
      throw new BadRequestException(
        this.i18n?.translate('errors.user_not_found') || 'User not found'
      );
    }

    // Generate tokens
    const tokens: { accessToken: string; refreshToken: string; expiresIn: number } = await this.jwtService.generateTokens(user.id, user.email);

    const userName: string | null = user.name;
    const userNameString: string = userName ?? '';

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: user.id,
        phoneNumber: this.maskPhoneNumber(normalizedPhone),
        email: user.email,
        name: userNameString,
      },
    };
  }

  /**
   * Create new user from phone OTP
   */
  private async createUserFromPhoneOtp(
    _phoneNumber: string,
    email: string,
    name?: string
  ): Promise<User> {
    const normalizedEmail: string = email.toLowerCase();

    // Generate random password
    const randomPassword: string = crypto.randomBytes(32).toString('hex');
    const passwordHash: string = await this.passwordService.hashPassword(randomPassword);

    const userCreateData: UserCreateData = {
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
    };
    const userName: string | undefined = name || normalizedEmail.split('@')[0];
    if (userName) {
      userCreateData.name = userName;
    }
    const user: User = await this.prismaClient.user.create({
      data: userCreateData,
    });

    return user;
  }

  /**
   * Normalize phone number to E.164 format
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove non-numeric characters except +
    let normalized: string = phoneNumber.replace(/[^\d+]/g, '');

    // Ensure starts with +
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }

    return normalized;
  }

  /**
   * Mask phone number for display
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length < 6) return phoneNumber;
    return phoneNumber.slice(0, 5) + '*'.repeat(phoneNumber.length - 7) + phoneNumber.slice(-2);
  }

  /**
   * Generate random 6-digit OTP
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
