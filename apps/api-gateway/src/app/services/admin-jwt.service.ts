import { Injectable, Optional, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminTokenCacheService } from './admin-token-cache.service';

export interface AdminJwtPayload {
  adminId: string;
  email: string;
  role: string;
}

export interface AdminTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Admin JWT Service
 * Handles JWT token generation and validation for Gateway admins
 * Uses separate secret from user authentication
 */
@Injectable()
export class AdminJwtService {
  private readonly ACCESS_TOKEN_EXPIRY = '30m'; // 30 minutes for admins
  private readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Optional() @Inject(AdminTokenCacheService) private tokenCacheService?: AdminTokenCacheService,
  ) {}

  /**
   * Get JWT secret for admin tokens
   */
  private getJwtSecret(): string {
    const secret = this.configService.get<string>('GATEWAY_ADMIN_JWT_SECRET') ||
                   this.configService.get<string>('JWT_SECRET');

    if (!secret || secret.length < 32) {
      throw new Error(
        'GATEWAY_ADMIN_JWT_SECRET or JWT_SECRET is required and must be at least 32 characters long.'
      );
    }

    return secret;
  }

  /**
   * Generate access and refresh tokens for admin
   */
  async generateTokens(adminId: string, email: string, role: string): Promise<AdminTokensResponse> {
    const payload: AdminJwtPayload = {
      adminId,
      email,
      role,
    };

    const secret = this.getJwtSecret();

    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Store tokens in Redis if available
    if (this.tokenCacheService) {
      const expiresIn = 30 * 60; // 30 minutes
      const refreshExpiresIn = 7 * 24 * 60 * 60; // 7 days
      await this.tokenCacheService.storeAccessToken(accessToken, adminId, expiresIn);
      await this.tokenCacheService.storeRefreshToken(refreshToken, adminId, refreshExpiresIn);
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: 30 * 60, // 30 minutes in seconds
    };
  }

  /**
   * Verify and decode admin token
   * Also checks Redis blacklist if available
   */
  async verifyToken(token: string): Promise<AdminJwtPayload | null> {
    try {
      // Check if token is blacklisted in Redis
      if (this.tokenCacheService) {
        const isBlacklisted = await this.tokenCacheService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          return null;
        }

        // Check if token exists in Redis (optional validation)
        const isValid = await this.tokenCacheService.isAccessTokenValid(token);
        if (!isValid) {
          // Token might have expired in Redis but still valid JWT
          // Continue with JWT verification as fallback
        }
      }

      const secret = this.getJwtSecret();
      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(token, { secret });

      if (!payload || !payload.adminId || !payload.email || !payload.role) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): AdminJwtPayload | null {
    try {
      return this.jwtService.decode<AdminJwtPayload>(token);
    } catch {
      return null;
    }
  }
}
