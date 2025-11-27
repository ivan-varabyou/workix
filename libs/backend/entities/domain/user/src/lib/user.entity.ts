/**
 * User Entity
 * Represents a user in the system
 */
export class UserEntity {
  id!: string;
  email!: string;
  name!: string | null;
  passwordHash!: string | null;
  emailVerified!: boolean;
  phone?: string | null;
  phoneVerified?: boolean | null;
  twoFactorEnabled?: boolean | null;
  biometricEnabled?: boolean | null;
  lockedUntil?: Date | null;
  failedLoginAttempts?: number;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if user is locked
   */
  isLocked(): boolean {
    if (!this.lockedUntil) {
      return false;
    }
    return this.lockedUntil > new Date();
  }

  /**
   * Check if user email is verified
   */
  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  /**
   * Check if user phone is verified
   */
  isPhoneVerified(): boolean {
    return this.phoneVerified === true;
  }
}
