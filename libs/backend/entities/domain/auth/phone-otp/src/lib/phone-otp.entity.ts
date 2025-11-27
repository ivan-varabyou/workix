/**
 * Phone OTP Entity
 * Represents a phone OTP verification in the system
 */
export class PhoneOtpEntity {
  id!: string;
  phoneNumber!: string;
  code!: string;
  expiresAt!: Date;
  verifiedAt?: Date | null;
  attempts!: number;
  maxAttempts!: number;
  lockedUntil?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<PhoneOtpEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if OTP is verified
   */
  isVerified(): boolean {
    return this.verifiedAt !== null && this.verifiedAt !== undefined;
  }

  /**
   * Check if OTP is expired
   */
  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  /**
   * Check if OTP is locked
   */
  isLocked(): boolean {
    if (!this.lockedUntil) {
      return false;
    }
    return this.lockedUntil > new Date();
  }

  /**
   * Check if OTP can be verified (not expired, not locked, not verified)
   */
  canVerify(): boolean {
    return !this.isExpired() && !this.isLocked() && !this.isVerified();
  }

  /**
   * Check if max attempts reached
   */
  hasMaxAttempts(): boolean {
    return this.attempts >= this.maxAttempts;
  }
}
