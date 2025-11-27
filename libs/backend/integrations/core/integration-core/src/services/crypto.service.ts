import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { BasePayload } from '../../../src/interfaces/integration-payload.interface';

@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private encryptionKey: Buffer;

  constructor(@Optional() @Inject(ConfigService) private configService?: ConfigService) {
    // Initialize encryption key in constructor to satisfy strictPropertyInitialization
    const key =
      this.configService?.get<string>('ENCRYPTION_KEY') ||
      process.env.ENCRYPTION_KEY ||
      this.generateKey();
    if (!this.configService?.get<string>('ENCRYPTION_KEY') && !process.env.ENCRYPTION_KEY) {
      this.logger.warn(
        'ENCRYPTION_KEY not set in environment. Using generated key. Set ENCRYPTION_KEY in production!'
      );
    }
    this.encryptionKey = Buffer.from(key, 'hex');
    if (this.encryptionKey.length !== this.keyLength) {
      throw new Error(
        `ENCRYPTION_KEY must be ${this.keyLength * 2} hex characters (${this.keyLength} bytes)`
      );
    }
  }

  onModuleInit(): void {
    // Key is already initialized in constructor
  }

  private generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Encrypts sensitive data (e.g., API keys, tokens)
   * @param plaintext - Data to encrypt
   * @returns Encrypted data as hex string
   */
  encrypt(plaintext: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      cipher.setAAD(Buffer.from('integration-credentials', 'utf8'));

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Format: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts encrypted data
   * @param ciphertext - Encrypted data as hex string (format: iv:authTag:encrypted)
   * @returns Decrypted plaintext
   */
  decrypt(ciphertext: string): string {
    try {
      const parts = ciphertext.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid ciphertext format');
      }

      const [ivHex, authTagHex, encrypted] = parts;
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid ciphertext format: missing parts');
      }
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      const aadBuffer = Buffer.from('integration-credentials', 'utf8');
      decipher.setAAD(aadBuffer);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      const final = decipher.final('utf8');
      decrypted += final;

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypts a JSON object
   */
  encryptObject<T extends BasePayload>(obj: T): string {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * Decrypts and parses a JSON object
   */
  decryptObject<T extends BasePayload>(ciphertext: string): T {
    // After decryption and JSON.parse, we get an object that should match T
    // This is acceptable for generic types after decryption
    return JSON.parse(this.decrypt(ciphertext)) as T;
  }

  /**
   * Hashes data (one-way, for verification)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generates a secure random token
   */
  generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
