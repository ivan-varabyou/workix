import { Injectable, Logger } from '@nestjs/common';

/**
 * JWT Token Blacklist Service
 * Manages blacklisted tokens (logged out)
 */
@Injectable()
export class JwtBlacklistService {
  private readonly logger: Logger = new Logger(JwtBlacklistService.name);
  private blacklist: Set<string> = new Set<string>();

  /**
   * Add token to blacklist
   */
  blacklistToken(token: string, expiresAt: Date): void {
    this.blacklist.add(token);
    this.logger.log('Token blacklisted');

    // Auto-remove after expiry
    const ttl: number = expiresAt.getTime() - Date.now();
    setTimeout((): void => {
      this.blacklist.delete(token);
    }, Math.max(ttl, 0));
  }

  /**
   * Check if token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  /**
   * Revoke all tokens (logout all devices)
   */
  revokeAll(): void {
    this.blacklist.clear();
    this.logger.log('All tokens revoked');
  }
}
