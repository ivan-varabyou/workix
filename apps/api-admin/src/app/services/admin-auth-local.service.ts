import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '@workix/backend/domain/auth';
import type { StringValue } from 'ms';

import { AdminPrismaService } from '../../prisma/admin-prisma.service';
import { AdminLoginDto, AdminRegisterDto } from '@workix/backend/domain/admin';

/**
 * Admin Tokens Response Type
 * Явный тип для безопасности
 */
export interface AdminTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Admin Login Response Type
 * Явный тип для безопасности
 */
export interface AdminLoginResponse extends AdminTokensResponse {
  admin: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Local Admin Auth Service
 * Упрощенная реализация без зависимостей от WorkixAdminModule
 * Переписана с явными типами и безопасно
 */
@Injectable()
export class AdminAuthLocalService {
  private readonly logger: Logger = new Logger(AdminAuthLocalService.name);
  private readonly ACCESS_TOKEN_EXPIRY: StringValue = '30m'; // 30 minutes
  private readonly REFRESH_TOKEN_EXPIRY: StringValue = '7d'; // 7 days
  private readonly MAX_FAILED_ATTEMPTS: number = 5;
  private readonly LOCK_DURATION_MINUTES: number = 15;

  constructor(
    private readonly prisma: AdminPrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService
  ) {
    this.logger.log('AdminAuthLocalService initialized');
  }

  /**
   * Register new admin
   */
  async register(dto: AdminRegisterDto): Promise<{ id: string; email: string; role: string }> {
    const { email, password, name, role } = dto;

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    if (!password || password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters long');
    }

    // Normalize email
    const normalizedEmail: string = email.toLowerCase().trim();

    // Check if admin already exists
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash password
    const passwordHash: string = await this.passwordService.hashPassword(password);

    // Create admin
    const admin = await this.prisma.admin.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name || null,
        role: role || 'admin',
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    this.logger.log(`Admin registered: ${admin.email}`);

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
  }

  /**
   * Login admin
   */
  async login(dto: AdminLoginDto): Promise<AdminLoginResponse> {
    const { email, password } = dto;

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    // Normalize email
    const normalizedEmail: string = email.toLowerCase().trim();

    // Find admin
    const admin = await this.prisma.admin.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!admin) {
      // Don't reveal if admin exists
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is disabled');
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutesLeft: number = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account is locked. Try again in ${minutesLeft} minute(s)`);
    }

    // Verify password
    const isValid: boolean = await this.passwordService.comparePassword(
      password,
      admin.passwordHash
    );

    if (!isValid) {
      // Increment failed login attempts
      const failedAttempts: number = (admin.failedLoginAttempts || 0) + 1;
      const lockedUntil: Date | null =
        failedAttempts >= this.MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + this.LOCK_DURATION_MINUTES * 60000)
          : null;

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate tokens
    const tokens: AdminTokensResponse = await this.generateTokens(
      admin.id,
      admin.email,
      admin.role
    );

    this.logger.log(`Admin logged in: ${admin.email}`);

    return {
      ...tokens,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Generate admin tokens
   */
  private async generateTokens(
    adminId: string,
    email: string,
    role: string
  ): Promise<AdminTokensResponse> {
    const payload: { adminId: string; email: string; role: string } = {
      adminId,
      email,
      role,
    };

    const accessToken: string = await this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken: string = await this.jwtService.signAsync(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Calculate expiresIn in seconds
    const expiresIn: number = 30 * 60; // 30 minutes in seconds

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}
