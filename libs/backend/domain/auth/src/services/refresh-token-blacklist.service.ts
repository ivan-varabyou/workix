import { Inject, Injectable, Optional } from '@nestjs/common';

import { AuthPrismaService } from '../interfaces/prisma-auth.interface';

/**
 * Refresh Token Blacklist Service
 * Manages refresh token blacklist for security (token revocation)
 */
@Injectable()
export class RefreshTokenBlacklistService {
  private prisma: AuthPrismaService;

  constructor(@Optional() @Inject('PrismaService') prisma: AuthPrismaService) {
    if (!prisma) {
      throw new Error(
        'PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.'
      );
    }
    this.prisma = prisma;
  }

  // Type assertion for Prisma Client methods
  private get prismaClient(): AuthPrismaService {
    return this.prisma;
  }

  /**
   * Add refresh token to blacklist
   */
  async revokeToken(token: string, userId: string, expiresAt: Date): Promise<void> {
    try {
      // Check if token already exists
      const existing: {
        id: string;
      } | null = await this.prismaClient.refreshToken.findUnique({
        where: { token },
      });

      if (existing) {
        // Update existing record to mark as revoked
        await this.prismaClient.refreshToken.update({
          where: { token },
          data: {
            revokedAt: new Date(),
          },
        });
      } else {
        // Create new record
        await this.prismaClient.refreshToken.create({
          data: {
            token,
            userId,
            expiresAt,
            revokedAt: new Date(),
          },
        });
      }
    } catch (error: unknown) {
      // Ignore errors - token might already be revoked or expired
      // This prevents errors from breaking the logout flow
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to revoke refresh token: ${errorMessage}`);
    }
  }

  /**
   * Store refresh token (for tracking)
   */
  async storeToken(token: string, userId: string, expiresAt: Date): Promise<void> {
    try {
      // Check if token already exists
      const existing: {
        id: string;
      } | null = await this.prismaClient.refreshToken.findUnique({
        where: { token },
      });

      if (!existing) {
        // Create new record
        await this.prismaClient.refreshToken.create({
          data: {
            token,
            userId,
            expiresAt,
          },
        });
      }
    } catch (error: unknown) {
      // Ignore errors - token might already exist
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to store refresh token: ${errorMessage}`);
    }
  }

  /**
   * Check if refresh token is revoked
   */
  async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const tokenRecord: {
        revokedAt: Date | null;
        expiresAt: Date;
      } | null = await this.prismaClient.refreshToken.findUnique({
        where: { token },
      });

      if (!tokenRecord) {
        // Token not in database - consider it valid (for backward compatibility)
        return false;
      }

      // Check if token is revoked
      if (tokenRecord.revokedAt) {
        return true;
      }

      // Check if token is expired
      if (new Date(tokenRecord.expiresAt) < new Date()) {
        return true;
      }

      return false;
    } catch (error: unknown) {
      // On error, assume token is valid (fail open for availability)
      // In production, you might want to fail closed
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to check refresh token revocation: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result: { count: number } = await this.prismaClient.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return result.count;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to cleanup expired tokens: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Revoke all tokens for a user (e.g., on password change)
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const result: { count: number } = await this.prismaClient.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      return result.count;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to revoke all user tokens: ${errorMessage}`);
      return 0;
    }
  }
}
