import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';

import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokensResponse } from '../interfaces/jwt-payload.interface';
import {
  AuthPrismaService,
  User,
  UserCreateData,
} from '../interfaces/prisma-auth.interface';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';

/**
 * Auth Service
 * Core authentication business logic
 */
@Injectable()
export class AuthService {
  private readonly LOCKOUT_DURATION: number = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_FAILED_ATTEMPTS: number = 5;

  private prisma: AuthPrismaService;

  constructor(
    @Optional() @Inject('PrismaService') prisma: AuthPrismaService,
    @Inject(PasswordService) private passwordService: PasswordService,
    @Inject(JwtService) private jwtService: JwtService,
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
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    const { email, name, password }: { email?: string; name?: string; password?: string } = registerDto;

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    // Normalize email
    const normalizedEmail: string = email.toLowerCase().trim();

    // Validate password strength
    const passwordValidation: { valid: boolean; errors: string[] } = this.passwordService.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Check if user exists
    const existingUser: User | null = await this.prismaClient.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash: string = await this.passwordService.hashPassword(password);

    // Create user
    // Name is required in Prisma schema, so we provide a default if not given
    const userCreateData: UserCreateData = {
      email: normalizedEmail,
      passwordHash,
      name: name || email.split('@')[0] || 'User', // Default to email username or 'User'
    };
    const savedUser: User = await this.prismaClient.user.create({
      data: userCreateData,
    });

    // Remove password hash from response
    const userWithoutPassword: Omit<User, 'passwordHash'> = {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      emailVerified: savedUser.emailVerified,
      phone: savedUser.phone ?? undefined,
      phoneVerified: savedUser.phoneVerified ?? undefined,
      twoFactorEnabled: savedUser.twoFactorEnabled ?? undefined,
      biometricEnabled: savedUser.biometricEnabled ?? undefined,
      lockedUntil: savedUser.lockedUntil ?? undefined,
      failedLoginAttempts: savedUser.failedLoginAttempts ?? undefined,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
      deletedAt: savedUser.deletedAt ?? undefined,
    };
    return userWithoutPassword;
  }

  /**
   * Login user
   */
  async login(
    loginDto: LoginDto
  ): Promise<{ tokens: TokensResponse; user: Omit<User, 'passwordHash'> }> {
    const { email, password }: { email?: string; password?: string } = loginDto;

    if (!email) {
      throw new BadRequestException('Email is required');
    }
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    // Normalize email
    const normalizedEmail: string = email.toLowerCase().trim();

    // Find user
    const user: User | null = await this.prismaClient.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      throw new UnauthorizedException('Account is locked. Please try again later');
    }

    // Verify password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid: boolean = await this.passwordService.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts: number = (user.failedLoginAttempts ?? 0) + 1;
      const lockedUntil: Date | null =
        failedAttempts >= this.MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + this.LOCKOUT_DURATION)
          : (user.lockedUntil ?? null);

      await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    if ((user.failedLoginAttempts ?? 0) > 0) {
      await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Generate tokens
    const tokens: TokensResponse = await this.jwtService.generateTokens(user.id, user.email);

    // Return tokens and user (without password)
    const userWithoutPassword: Omit<User, 'passwordHash'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      phone: user.phone ?? undefined,
      phoneVerified: user.phoneVerified ?? undefined,
      twoFactorEnabled: user.twoFactorEnabled ?? undefined,
      biometricEnabled: user.biometricEnabled ?? undefined,
      lockedUntil: user.lockedUntil ?? undefined,
      failedLoginAttempts: user.failedLoginAttempts ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt ?? undefined,
    };
    return {
      tokens,
      user: userWithoutPassword,
    };
  }

  /**
   * Verify token
   */
  async verifyToken(
    token: string
  ): Promise<{ valid: boolean; userId?: string; email?: string; error?: string }> {
    const decoded: { userId: string; email: string; iat: number; exp: number } | null = await this.jwtService.verifyToken(token);

    if (!decoded) {
      return {
        valid: false,
        error: 'Invalid or expired token',
      };
    }

    return {
      valid: true,
      userId: decoded.userId,
      email: decoded.email,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const result: { accessToken: string; expiresIn: number } | null = await this.jwtService.refreshAccessToken(refreshToken);

    if (!result) {
      throw new UnauthorizedException('Token expired');
    }

    return result;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user: User | null = await this.prismaClient.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userWithoutPassword: Omit<User, 'passwordHash'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      phone: user.phone ?? undefined,
      phoneVerified: user.phoneVerified ?? undefined,
      twoFactorEnabled: user.twoFactorEnabled ?? undefined,
      biometricEnabled: user.biometricEnabled ?? undefined,
      lockedUntil: user.lockedUntil ?? undefined,
      failedLoginAttempts: user.failedLoginAttempts ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt ?? undefined,
    };
    return userWithoutPassword;
  }

  /**
   * Logout user and invalidate refresh token
   */
  async logout(refreshToken: string, userId: string): Promise<{ message: string }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Revoke refresh token (add to blacklist)
    await this.jwtService.revokeRefreshToken(refreshToken, userId);

    return { message: 'Successfully logged out' };
  }
}
