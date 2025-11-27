import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { AdminJwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Admin Tokens Response
 */
export interface AdminTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Admin Token Cache Service Interface
 * Used for Redis-based token blacklisting and caching
 */
export interface AdminTokenCacheServiceInterface {
  storeAccessToken(token: string, adminId: string, expiresIn: number): Promise<void>;
  storeRefreshToken(refreshToken: string, adminId: string, expiresIn: number): Promise<void>;
  isTokenBlacklisted(token: string): Promise<boolean>;
  isAccessTokenValid(token: string): Promise<boolean>;
  revokeAccessToken(token: string, expiresIn: number): Promise<void>;
  revokeRefreshToken(refreshToken: string): Promise<void>;
  revokeAllTokensForAdmin(adminId: string): Promise<void>;
  getCachedVerifyResult(token: string): Promise<{ id: string; email: string; role: string } | null>;
  cacheVerifyResult(token: string, adminInfo: { id: string; email: string; role: string }): Promise<void>;
  invalidateVerifyCache(token: string): Promise<void>;
}

/**
 * Admin JWT Service
 * Handles JWT token generation and validation for Gateway admins
 * Uses separate secret from user authentication
 */
@Injectable()
export class AdminJwtService {
  private readonly ACCESS_TOKEN_EXPIRY: StringValue = '30m'; // 30 minutes for admins
  private readonly REFRESH_TOKEN_EXPIRY: StringValue = '7d'; // 7 days

  constructor(
    @Inject(NestJwtService) private jwtService: NestJwtService,
    private configService: ConfigService,
    @Optional() @Inject('AdminTokenCacheService') private tokenCacheService?: AdminTokenCacheServiceInterface,
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

    const accessToken = await this.jwtService.signAsync<AdminJwtPayload>(payload, {
      secret,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = await this.jwtService.signAsync<AdminJwtPayload>(payload, {
      secret,
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Store tokens in Redis if available
    if (this.tokenCacheService) {
      const expiresIn = 30 * 60; // 30 minutes in seconds
      const refreshExpiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
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
      const decoded = await this.jwtService.verifyAsync<AdminJwtPayload>(token, { secret });

      if (!decoded || !decoded.adminId || !decoded.email || !decoded.role) {
        return null;
      }

      return decoded;
    } catch (_error) {
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

  /**
   * Generate new access token from refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number } | null> {
    try {
      // Check if refresh token is revoked
      if (this.tokenCacheService) {
        const isValid = await this.tokenCacheService.isAccessTokenValid(refreshToken);
        if (!isValid) {
          return null;
        }
      }

      const secret = this.getJwtSecret();
      const decoded = await this.jwtService.verifyAsync<AdminJwtPayload>(refreshToken, { secret });

      if (!decoded || !decoded.adminId || !decoded.email || !decoded.role) {
        return null;
      }

      const payload: AdminJwtPayload = {
        adminId: decoded.adminId,
        email: decoded.email,
        role: decoded.role,
      };

      const accessToken = await this.jwtService.signAsync<AdminJwtPayload>(payload, {
        secret,
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      });

      return {
        accessToken,
        expiresIn: 30 * 60, // 30 minutes in seconds
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Revoke refresh token (add to blacklist)
   */
  async revokeRefreshToken(refreshToken: string, _adminId: string): Promise<void> {
    if (this.tokenCacheService) {
      await this.tokenCacheService.revokeRefreshToken(refreshToken);
    }
  }
}
