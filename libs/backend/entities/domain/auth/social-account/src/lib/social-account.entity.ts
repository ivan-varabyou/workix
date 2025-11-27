/**
 * Social Account Entity
 * Represents a social account (OAuth) in the system
 */
export class SocialAccountEntity {
  id!: string;
  userId!: string;
  provider!: 'google' | 'apple' | 'github';
  providerAccountId!: string;
  email?: string | null;
  displayName?: string | null;
  profilePicture?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  metadata?: unknown;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<SocialAccountEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) {
      return false;
    }
    return this.tokenExpiresAt < new Date();
  }

  /**
   * Check if token needs refresh
   */
  needsTokenRefresh(): boolean {
    if (!this.tokenExpiresAt) {
      return false;
    }
    // Refresh if expires in less than 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return this.tokenExpiresAt < fiveMinutesFromNow;
  }
}
