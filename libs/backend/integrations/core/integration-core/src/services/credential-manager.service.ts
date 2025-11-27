import { Injectable, Logger } from '@nestjs/common';
import { extractRecordFromJson, toPrismaJsonValue } from '@workix/infrastructure/prisma';

import {
  CredentialManagerPrismaService,
  isCredentialData,
  isCredentialsRecord,
} from '../../../src/interfaces/credential.interface';
import { BasePayload, isBasePayload } from '../../../src/interfaces/integration-payload.interface';
import { isRecord } from '../../../src/interfaces/provider-registry.interface';
import { CryptoService } from './crypto.service';

@Injectable()
export class CredentialManagerService {
  private readonly logger = new Logger(CredentialManagerService.name);

  constructor(
    private readonly prisma: CredentialManagerPrismaService,
    private crypto: CryptoService
  ) {}

  /**
   * Creates encrypted credentials for a provider
   */
  async createCredential(
    providerId: string,
    type: string,
    data: BasePayload,
    userId?: string,
    expiresAt?: Date
  ) {
    const encryptedData = this.crypto.encryptObject(data);

    // Get provider and update credentials JSON field
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials = isRecord(provider.credentials) ? provider.credentials : {};
    const credentialKey = `${type}_${userId || 'default'}`;
    credentials[credentialKey] = {
      type,
      data: encryptedData,
      userId,
      expiresAt: expiresAt?.toISOString(),
      createdAt: new Date().toISOString(),
    };

    return this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: { credentials: toPrismaJsonValue(credentials) },
    });
  }

  /**
   * Gets and decrypts credentials for a provider
   */
  async getCredentials(providerId: string, userId?: string) {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return [];
    }

    const credentials = isCredentialsRecord(provider.credentials) ? provider.credentials : {};
    const result: Array<{
      id: string;
      providerId: string;
      type: string;
      userId?: string;
      data: BasePayload;
      expiresAt?: Date;
      createdAt: Date;
    }> = [];

    for (const [key, cred] of Object.entries(credentials)) {
      if (!isCredentialData(cred)) {
        continue;
      }
      if (userId && cred.userId !== userId) {
        continue;
      }
      const credential: {
        id: string;
        providerId: string;
        type: string;
        data: BasePayload;
        createdAt: Date;
        userId?: string;
        expiresAt?: Date;
      } = {
        id: key,
        providerId,
        type: cred.type,
        data: this.decryptCredentialData(cred.data),
        createdAt: cred.createdAt ? new Date(cred.createdAt) : new Date(),
      };
      if (cred.userId !== undefined) {
        credential.userId = cred.userId;
      }
      if (cred.expiresAt !== undefined) {
        credential.expiresAt = new Date(cred.expiresAt);
      }
      result.push(credential);
    }

    return result;
  }

  /**
   * Gets a single credential and decrypts it
   */
  async getCredential(credentialId: string) {
    // credentialId format: providerId_type_userId
    const parts = credentialId.split('_');
    if (parts.length < 2) {
      return null;
    }

    const providerId = parts[0];
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return null;
    }

    const credentials = isCredentialsRecord(provider.credentials) ? provider.credentials : {};
    const cred = credentials[credentialId];

    if (!cred || !isCredentialData(cred)) {
      return null;
    }

    return {
      id: credentialId,
      providerId,
      type: cred.type,
      userId: cred.userId,
      data: this.decryptCredentialData(cred.data),
      expiresAt: cred.expiresAt ? new Date(cred.expiresAt) : undefined,
      createdAt: cred.createdAt ? new Date(cred.createdAt) : new Date(),
    };
  }

  /**
   * Updates credentials with encryption
   */
  async updateCredential(credentialId: string, data?: BasePayload, expiresAt?: Date) {
    const parts = credentialId.split('_');
    if (parts.length < 2) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }

    const providerId = parts[0];
    if (!providerId) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials = isCredentialsRecord(provider.credentials) ? provider.credentials : {};
    const cred = credentials[credentialId];

    if (!cred || !isCredentialData(cred)) {
      throw new Error(`Credential ${credentialId} not found`);
    }

    if (data) {
      cred.data = this.crypto.encryptObject(data);
    }
    if (expiresAt) {
      cred.expiresAt = expiresAt.toISOString();
    }
    cred.updatedAt = new Date().toISOString();

    credentials[credentialId] = cred;

    return this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: { credentials: toPrismaJsonValue(credentials) },
    });
  }

  /**
   * Deletes credentials
   */
  async deleteCredential(credentialId: string) {
    const parts = credentialId.split('_');
    if (parts.length < 2) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }

    const providerId = parts[0];
    if (!providerId) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials = extractRecordFromJson(provider.credentials);
    delete credentials[credentialId];

    return this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: { credentials: toPrismaJsonValue(credentials) },
    });
  }

  /**
   * Checks if credentials are expired
   */
  async checkExpiredCredentials(providerId: string): Promise<boolean> {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return false;
    }

    const credentials = isCredentialsRecord(provider.credentials) ? provider.credentials : {};
    const now = new Date();

    for (const cred of Object.values(credentials)) {
      if (isCredentialData(cred) && cred.expiresAt && new Date(cred.expiresAt) <= now) {
        return true;
      }
    }

    return false;
  }

  /**
   * Decrypts credential data (handles both encrypted and plaintext for migration)
   */
  private decryptCredentialData(data: string | BasePayload): BasePayload {
    try {
      // If data is a string, try to decrypt it
      if (typeof data === 'string') {
        // Check if it's encrypted (format: iv:authTag:encrypted)
        if (data.includes(':') && data.split(':').length === 3) {
          const decrypted = this.crypto.decryptObject(data);
          return isBasePayload(decrypted) ? decrypted : { raw: String(decrypted) };
        }
        // If it's a JSON string, parse it
        try {
          const parsed = JSON.parse(data);
          return isBasePayload(parsed) ? parsed : { raw: data };
        } catch {
          // If it's not JSON, return as-is
          return { raw: data };
        }
      }
      // If data is already an object, return it
      return isBasePayload(data) ? data : {};
    } catch (error) {
      this.logger.error('Failed to decrypt credential data:', error);
      return { error: 'Failed to decrypt' };
    }
  }

  /**
   * Rotates credentials (re-encrypts with new key)
   */
  async rotateCredentials(providerId: string) {
    const provider = await this.prisma.integrationProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials = isCredentialsRecord(provider.credentials) ? provider.credentials : {};
    const results: Array<{ id: string; status: string; error?: string }> = [];

    for (const [key, cred] of Object.entries(credentials)) {
      if (!isCredentialData(cred)) {
        continue;
      }
      try {
        const decrypted = this.decryptCredentialData(cred.data);
        const reEncrypted = this.crypto.encryptObject(decrypted);

        cred.data = reEncrypted;
        cred.updatedAt = new Date().toISOString();
        credentials[key] = cred;

        results.push({ id: key, status: 'rotated' });
      } catch (error: unknown) {
        this.logger.error(`Failed to rotate credential ${key}:`, error);
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        results.push({ id: key, status: 'failed', error: errorMessage });
      }
    }

    await this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: { credentials },
    });

    return results;
  }
}
