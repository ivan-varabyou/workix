/**
 * API Key Entity
 * Represents an API key in the system
 */
export class ApiKeyEntity {
  id!: string;
  userId!: string;
  name!: string;
  key!: string;
  secret!: string;
  permissions!: string[];
  rateLimit!: number;
  expiresAt?: Date | null;
  lastUsedAt?: Date | null;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<ApiKeyEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if API key is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Check if API key is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return this.expiresAt < new Date();
  }

  /**
   * Check if API key can be used
   */
  canUse(): boolean {
    return this.isActive() && !this.isExpired();
  }

  /**
   * Check if API key has permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission) || this.permissions.includes('*');
  }
}
