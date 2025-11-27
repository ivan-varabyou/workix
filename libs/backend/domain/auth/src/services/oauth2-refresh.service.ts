import { BadRequestException, Inject, Injectable, Logger, Optional } from '@nestjs/common';
import * as crypto from 'crypto';

import { AuthPrismaService } from '../interfaces/prisma-auth.interface';

/**
 * OAuth2 Refresh Token Rotation Service
 * Implements refresh token rotation for security
 */
@Injectable()
export class OAuth2RefreshService {
  private readonly logger: Logger = new Logger(OAuth2RefreshService.name);
  private prisma: AuthPrismaService;

  constructor(@Optional() @Inject('PrismaService') prisma: AuthPrismaService) {
    if (!prisma) {
      throw new Error('PrismaService must be provided. Ensure PrismaModule is imported and provides PrismaService globally.');
    }
    this.prisma = prisma;
  }

  /**
   * Rotate refresh token
   */
  async rotateRefreshToken(userId: string, oldToken: string): Promise<{ newToken: string }> {
    const token: {
      id: string;
    } | null = await this.prisma.oAuth2Token.findFirst({
      where: { userId, refreshToken: oldToken },
    });

    if (!token) {
      throw new BadRequestException('Invalid refresh token');
    }

    // Generate new token
    const newRefreshToken: string = crypto.randomBytes(32).toString('hex');
    const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.oAuth2Token.update({
      where: { id: token.id },
      data: { refreshToken: newRefreshToken, refreshExpiresAt: expiresAt },
    });

    this.logger.log(`Refresh token rotated for user: ${userId}`);

    return { newToken: newRefreshToken };
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(userId: string, token: string): Promise<void> {
    await this.prisma.oAuth2Token.updateMany({
      where: { userId, refreshToken: token },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`Refresh token revoked for user: ${userId}`);
  }
}
