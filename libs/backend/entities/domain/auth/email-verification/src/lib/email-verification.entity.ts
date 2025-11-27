/**
 * Email Verification Entity
 * Represents an email verification in the system
 */
export class EmailVerificationEntity {
  id!: string;
  email!: string;
  token!: string;
  userId?: string | null;
  expiresAt!: Date;
  verifiedAt?: Date | null;
  resendCount!: number;
  maxResends!: number;
  lastResendAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<EmailVerificationEntity>) {
    Object.assign(this, data);
  }

  /**
   * Check if verification is verified
   */
  isVerified(): boolean {
    return this.verifiedAt !== null && this.verifiedAt !== undefined;
  }

  /**
   * Check if verification token is expired
   */
  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  /**
   * Check if verification can be resent
   */
  canResend(): boolean {
    return this.resendCount < this.maxResends && !this.isVerified();
  }
}
