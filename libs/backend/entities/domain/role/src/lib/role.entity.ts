/**
 * Role Entity
 * Represents a role in the RBAC system
 */
export class RoleEntity {
  id!: string;
  name!: string;
  description?: string | null;
  level?: number | null;
  isActive!: boolean;
  isSystem!: boolean;
  permissions?: Array<{
    id: string;
    name: string;
    description?: string | null;
    resource?: string | null;
    action?: string | null;
    isActive: boolean;
  }>;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<RoleEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if role is active
   */
  isActiveRole(): boolean {
    return this.isActive;
  }

  /**
   * Check if role is system role (cannot be deleted)
   */
  isSystemRole(): boolean {
    return this.isSystem;
  }

  /**
   * Check if role has permission
   */
  hasPermission(permissionName: string): boolean {
    if (!this.permissions) {
      return false;
    }
    return this.permissions.some((p) => p.name === permissionName && p.isActive);
  }
}
