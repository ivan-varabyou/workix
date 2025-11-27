import { Inject, Injectable, Optional } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import {
  isJwtDecodedPayload,
  JwtDecodedPayload,
  JwtPayload,
  JwtSignPayload,
  TokensResponse,
} from '../interfaces/jwt-payload.interface';
import { RefreshTokenBlacklistService } from './refresh-token-blacklist.service';

/**
 * JWT Service
 * Handles JWT token generation and validation
 */
@Injectable()
export class JwtService {
  private readonly ACCESS_TOKEN_EXPIRY: StringValue = '1h';
  private readonly REFRESH_TOKEN_EXPIRY: StringValue = '7d';

  constructor(
    @Inject(NestJwtService) private jwtService: NestJwtService,
    @Optional() @Inject(RefreshTokenBlacklistService)
    private refreshTokenBlacklist?: RefreshTokenBlacklistService
  ) {}

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(userId: string, email: string): Promise<TokensResponse> {
    const payload: JwtSignPayload = {
      userId,
      email,
    };

    // NestJS JwtService.signAsync<T extends object = any>(payload: T, ...)
    // Using generic type parameter to select correct overload
    // expiresIn accepts number | StringValue | undefined
    const accessToken: string = await this.jwtService.signAsync<JwtSignPayload>(
      payload,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      }
    );

    const refreshPayload: JwtSignPayload = { userId, email };
    // expiresIn accepts number | StringValue | undefined
    const refreshToken: string = await this.jwtService.signAsync<JwtSignPayload>(
      refreshPayload,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      }
    );

    // Store refresh token in blacklist service (for tracking and revocation)
    if (this.refreshTokenBlacklist) {
      const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await this.refreshTokenBlacklist.storeToken(refreshToken, userId, expiresAt);
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  /**
   * Verify and decode token
   */
  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      // verifyAsync returns object with JWT claims
      const decoded: unknown = await this.jwtService.verifyAsync<JwtDecodedPayload>(token);

      // Use type guard to safely narrow type
      if (!isJwtDecodedPayload(decoded)) {
        return null;
      }

      // After type guard, decoded is guaranteed to be JwtDecodedPayload
      // TypeScript narrows the type after type guard
      // Explicitly assign to avoid linter warnings
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const validatedDecoded: JwtDecodedPayload = decoded as JwtDecodedPayload;
      const userId: string = validatedDecoded.userId;
      const email: string = validatedDecoded.email;
      const iat: number = validatedDecoded.iat ?? Math.floor(Date.now() / 1000);
      const exp: number = validatedDecoded.exp ?? Math.floor(Date.now() / 1000) + 3600;

      const payload: JwtPayload = {
        userId,
        email,
        iat,
        exp,
      };

      return payload;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Generate new access token from refresh token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number } | null> {
    try {
      // Check if refresh token is revoked (blacklist check)
      if (this.refreshTokenBlacklist) {
        const isRevoked: boolean = await this.refreshTokenBlacklist.isTokenRevoked(refreshToken);
        if (isRevoked) {
          return null;
        }
      }

      // verifyAsync returns object with JWT claims
      const decoded: unknown = await this.jwtService.verifyAsync<JwtDecodedPayload>(refreshToken);

      // Use type guard to safely narrow type
      if (!isJwtDecodedPayload(decoded)) {
        return null;
      }

      // After type guard, decoded is guaranteed to be JwtDecodedPayload
      // TypeScript narrows the type after type guard
      // Explicitly assign to avoid linter warnings
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const validatedDecoded: JwtDecodedPayload = decoded as JwtDecodedPayload;
      const userId: string = validatedDecoded.userId;
      const email: string = validatedDecoded.email;

      const payload: JwtSignPayload = {
        userId,
        email,
      };

      // NestJS JwtService.signAsync<T extends object = any>(payload: T, ...)
      // Using generic type parameter to select correct overload
      // expiresIn accepts number | StringValue | undefined
      const accessToken: string = await this.jwtService.signAsync<JwtSignPayload>(
        payload,
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRY,
        }
      );

      return {
        accessToken,
        expiresIn: 3600,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Revoke refresh token (add to blacklist)
   */
  async revokeRefreshToken(refreshToken: string, userId: string): Promise<void> {
    if (this.refreshTokenBlacklist) {
      const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await this.refreshTokenBlacklist.revokeToken(refreshToken, userId, expiresAt);
    }
  }
}
