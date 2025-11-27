/**
 * Permission Entity
 * Represents a permission in the RBAC system
 */
export class PermissionEntity {
  id!: string;
  name!: string;
  description?: string | null;
  resource?: string | null;
  action?: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<PermissionEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if permission is active
   */
  isActivePermission(): boolean {
    return this.isActive;
  }

  /**
   * Get permission identifier (resource:action or name)
   */
  getIdentifier(): string {
    if (this.resource && this.action) {
      return `${this.resource}:${this.action}`;
    }
    return this.name;
  }
}
