import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { isCommonPassword } from '../data/common-passwords';

/**
 * Password Service
 * Handles password hashing and comparison
 */
@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS: number = 12;

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   * Requirements: 12+ chars, uppercase, lowercase, number, special char
   * Also checks against common passwords list
   */
  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain numbers');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain special characters (@$!%*?&)');
    }

    // Check against common passwords list
    if (isCommonPassword(password)) {
      errors.push('Password is too common. Please choose a more unique password');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if password is common (without full validation)
   * Useful for quick checks before full validation
   */
  isCommonPassword(password: string): boolean {
    return isCommonPassword(password);
  }
}
