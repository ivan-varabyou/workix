import { describe, it, expect, beforeEach } from 'vitest';
import { PasswordService } from '@workix/domain/auth';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await service.hashPassword('');
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle very long password', async () => {
      const longPassword = 'A'.repeat(100) + 'a' + 'b' + 'C' + '1' + '!';
      const hash = await service.hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should handle unicode characters in password', async () => {
      const password = 'Пароль123!Пароль';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(20);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'SecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword('securepassword123!', hash);

      expect(result).toBe(false);
    });

    it('should handle extra spaces', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword('SecurePassword123! ', hash);

      expect(result).toBe(false);
    });

    it('should work with unicode passwords', async () => {
      const password = 'Пароль123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false on altered hash', async () => {
      const password = 'SecurePassword123!';
      const hash = await service.hashPassword(password);
      const alteredHash = hash.slice(0, -5) + 'XXXXX';

      // bcrypt.compare returns false instead of throwing on altered hash
      const result = await service.comparePassword(password, alteredHash);
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = service.validatePasswordStrength('SecurePassword123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 12 chars', () => {
      const result = service.validatePasswordStrength('Short1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters');
    });

    it('should require lowercase letters', () => {
      const result = service.validatePasswordStrength('SECUREPASSWORD123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain lowercase letters');
    });

    it('should require uppercase letters', () => {
      const result = service.validatePasswordStrength('securepassword123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain uppercase letters');
    });

    it('should require numbers', () => {
      const result = service.validatePasswordStrength('SecurePassword!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain numbers');
    });

    it('should require special characters', () => {
      const result = service.validatePasswordStrength('SecurePassword123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain special characters (@$!%*?&)');
    });

    it('should accept all special characters: @$!%*?&', () => {
      const passwords = [
        'SecurePassword123@',
        'SecurePassword123$',
        'SecurePassword123!',
        'SecurePassword123%',
        'SecurePassword123*',
        'SecurePassword123?',
        'SecurePassword123&',
      ];

      passwords.forEach((pwd) => {
        const result = service.validatePasswordStrength(pwd);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject multiple validation errors', () => {
      const result = service.validatePasswordStrength('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should work with exactly 12 characters (minimum)', () => {
      const result = service.validatePasswordStrength('SecurePass1!a');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should work with very long password', () => {
      const result = service.validatePasswordStrength(
        'VerySecurePassword123!WithLongPasswordLength'
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle unicode characters', () => {
      const result = service.validatePasswordStrength('SecureПароль123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle multiple special characters', () => {
      const result = service.validatePasswordStrength('SecurePass1@$!%*?&');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should provide all errors at once', () => {
      const result = service.validatePasswordStrength('nospecial');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors).toContain('Password must be at least 12 characters');
      expect(result.errors).toContain('Password must contain numbers');
      expect(result.errors).toContain('Password must contain special characters (@$!%*?&)');
    });
  });
});
