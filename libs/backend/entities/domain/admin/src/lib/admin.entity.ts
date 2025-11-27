/**
 * Admin Entity
 * Represents an admin user in the system
 */
export class AdminEntity {
  id!: string;
  email!: string;
  name?: string | null;
  role!: string;
  passwordHash?: string | null;
  isActive?: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<AdminEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if admin is active
   */
  isActiveAdmin(): boolean {
    return this.isActive !== false;
  }

  /**
   * Check if admin has super admin role
   */
  isSuperAdmin(): boolean {
    return this.role === 'super_admin';
  }
}
