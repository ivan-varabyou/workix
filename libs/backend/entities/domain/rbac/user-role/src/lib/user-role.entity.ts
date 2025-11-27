/**
 * User Role Entity
 * Represents a user-role assignment in the RBAC system
 */
export class UserRoleEntity {
  id!: string;
  userId!: string;
  roleId!: string;
  assignedBy?: string | null;
  expiresAt?: Date | null;
  role?: {
    id: string;
    name: string;
    description?: string | null;
    level?: number | null;
    isActive: boolean;
    isSystem: boolean;
    permissions?: Array<{
      id: string;
      name: string;
      description?: string | null;
      resource?: string | null;
      action?: string | null;
      isActive: boolean;
    }>;
  };
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<UserRoleEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if role assignment is active
   */
  isActive(): boolean {
    if (!this.expiresAt) {
      return true;
    }
    return this.expiresAt > new Date();
  }

  /**
   * Check if role assignment is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return this.expiresAt <= new Date();
  }

  /**
   * Get days remaining until expiration
   */
  getDaysRemaining(): number | null {
    if (!this.expiresAt) {
      return null;
    }
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
