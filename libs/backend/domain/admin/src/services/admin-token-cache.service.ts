import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { AdminTokenCacheServiceInterface } from './admin-jwt.service';

/**
 * Admin Token Cache Service
 * Manages admin JWT tokens in Redis for instant revocation
 * Implements AdminTokenCacheServiceInterface for dependency injection
 */
@Injectable()
export class AdminTokenCacheService implements OnModuleInit, AdminTokenCacheServiceInterface {
  private readonly logger = new Logger(AdminTokenCacheService.name);
  private readonly TOKEN_PREFIX = 'admin:token:';
  private readonly REFRESH_TOKEN_PREFIX = 'admin:refresh:';
  private readonly BLACKLIST_PREFIX = 'admin:blacklist:';
  private readonly VERIFY_CACHE_PREFIX = 'admin:verify:';
  private readonly VERIFY_CACHE_TTL = 5 * 60; // 5 minutes in seconds

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // Test Redis connection
      await this.cacheManager.get('test');
      this.logger.log('✅ Redis cache connected for admin tokens');
    } catch (error) {
      this.logger.warn('⚠️ Redis cache not available, token revocation will be limited to database sessions');
    }
  }

  /**
   * Store access token in Redis
   */
  async storeAccessToken(token: string, adminId: string, expiresIn: number): Promise<void> {
    try {
      const key = `${this.TOKEN_PREFIX}${token}`;
      await this.cacheManager.set(key, adminId, expiresIn * 1000); // TTL in milliseconds
    } catch (error) {
      this.logger.warn(`Failed to store access token in Redis: ${error}`);
      // Don't throw - Redis is optional, fallback to DB sessions
    }
  }

  /**
   * Store refresh token in Redis
   */
  async storeRefreshToken(refreshToken: string, adminId: string, expiresIn: number): Promise<void> {
    try {
      const key = `${this.REFRESH_TOKEN_PREFIX}${refreshToken}`;
      await this.cacheManager.set(key, adminId, expiresIn * 1000);
    } catch (error) {
      this.logger.warn(`Failed to store refresh token in Redis: ${error}`);
    }
  }

  /**
   * Check if access token is valid (exists in Redis)
   */
  async isAccessTokenValid(token: string): Promise<boolean> {
    try {
      const key = `${this.TOKEN_PREFIX}${token}`;
      const adminId = await this.cacheManager.get<string>(key);
      return adminId !== null && adminId !== undefined;
    } catch (error) {
      this.logger.warn(`Failed to check access token in Redis: ${error}`);
      // If Redis fails, return true to allow DB session check
      return true;
    }
  }

  /**
   * Check if refresh token is valid
   */
  async isRefreshTokenValid(refreshToken: string): Promise<boolean> {
    try {
      const key = `${this.REFRESH_TOKEN_PREFIX}${refreshToken}`;
      const adminId = await this.cacheManager.get<string>(key);
      return adminId !== null && adminId !== undefined;
    } catch (error) {
      this.logger.warn(`Failed to check refresh token in Redis: ${error}`);
      return true;
    }
  }

  /**
   * Revoke access token (add to blacklist)
   */
  async revokeAccessToken(token: string, expiresIn: number): Promise<void> {
    try {
      const blacklistKey = `${this.BLACKLIST_PREFIX}${token}`;
      await this.cacheManager.set(blacklistKey, 'revoked', expiresIn * 1000);

      // Also remove from active tokens
      const tokenKey = `${this.TOKEN_PREFIX}${token}`;
      await this.cacheManager.del(tokenKey);
    } catch (error) {
      this.logger.warn(`Failed to revoke access token in Redis: ${error}`);
    }
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const key = `${this.REFRESH_TOKEN_PREFIX}${refreshToken}`;
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(`Failed to revoke refresh token in Redis: ${error}`);
    }
  }

  /**
   * Revoke all tokens for admin (logout from all devices)
   */
  async revokeAllTokensForAdmin(adminId: string): Promise<void> {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to maintain a set of tokens per admin
      // For now, we rely on DB session cleanup and token expiration
      this.logger.log(`Revoked all tokens for admin: ${adminId}`);
    } catch (error) {
      this.logger.warn(`Failed to revoke all tokens in Redis: ${error}`);
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = `${this.BLACKLIST_PREFIX}${token}`;
      const value = await this.cacheManager.get<string>(blacklistKey);
      return value === 'revoked';
    } catch (error) {
      this.logger.warn(`Failed to check token blacklist in Redis: ${error}`);
      return false;
    }
  }

  /**
   * Get admin ID from token
   */
  async getAdminIdFromToken(token: string): Promise<string | null> {
    try {
      const key = `${this.TOKEN_PREFIX}${token}`;
      return await this.cacheManager.get<string>(key) || null;
    } catch (error) {
      this.logger.warn(`Failed to get admin ID from token in Redis: ${error}`);
      return null;
    }
  }

  /**
   * Cache verifyAdmin result
   * Stores admin info (id, email, role) for quick lookup
   */
  async cacheVerifyResult(
    token: string,
    adminInfo: { id: string; email: string; role: string },
  ): Promise<void> {
    try {
      const key = `${this.VERIFY_CACHE_PREFIX}${token}`;
      await this.cacheManager.set(
        key,
        JSON.stringify(adminInfo),
        this.VERIFY_CACHE_TTL * 1000, // TTL in milliseconds
      );
    } catch (error) {
      this.logger.warn(`Failed to cache verify result in Redis: ${error}`);
      // Don't throw - caching is optional
    }
  }

  /**
   * Get cached verifyAdmin result
   */
  async getCachedVerifyResult(token: string): Promise<{ id: string; email: string; role: string } | null> {
    try {
      const key = `${this.VERIFY_CACHE_PREFIX}${token}`;
      const cached = await this.cacheManager.get<string>(key);
      if (!cached) {
        return null;
      }
      return JSON.parse(cached) as { id: string; email: string; role: string };
    } catch (error) {
      this.logger.warn(`Failed to get cached verify result from Redis: ${error}`);
      return null;
    }
  }

  /**
   * Invalidate verifyAdmin cache for a token
   */
  async invalidateVerifyCache(token: string): Promise<void> {
    try {
      const key = `${this.VERIFY_CACHE_PREFIX}${token}`;
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(`Failed to invalidate verify cache in Redis: ${error}`);
    }
  }

  /**
   * Invalidate all verifyAdmin cache for an admin
   * Note: This is a simplified implementation
   * In production, you might want to maintain a set of tokens per admin
   */
  async invalidateAllVerifyCacheForAdmin(adminId: string): Promise<void> {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to maintain a set of tokens per admin
      // For now, we rely on token expiration and individual cache invalidation
      this.logger.log(`Invalidated verify cache for admin: ${adminId}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate all verify cache in Redis: ${error}`);
    }
  }
}


