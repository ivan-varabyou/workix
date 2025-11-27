import { Injectable, Logger } from '@nestjs/common';

import {
  Credential,
  CredentialData,
  CredentialManagerPrismaService,
  CredentialRotationResult,
  isCredentialsRecord,
} from '../interfaces/credential.interface';
import { BasePayload, isBasePayload } from '../interfaces/integration-payload.interface';
import { IntegrationProviderData } from '../interfaces/provider-registry.interface';
import { CryptoService } from './crypto.service';

@Injectable()
export class CredentialManagerService {
  private readonly logger = new Logger(CredentialManagerService.name);

  constructor(
    private readonly prisma: CredentialManagerPrismaService,
    private readonly crypto: CryptoService
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
  ): Promise<IntegrationProviderData> {
    const encryptedData: string = this.crypto.encryptObject(data);

    // Get provider and update credentials JSON field
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials: Record<string, CredentialData> = isCredentialsRecord(provider.credentials)
      ? provider.credentials
      : {};
    const credentialKey = `${type}_${userId || 'default'}`;
    const credentialData: CredentialData = {
      type,
      data: encryptedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (userId !== undefined) {
      credentialData.userId = userId;
    }
    if (expiresAt !== undefined) {
      credentialData.expiresAt = expiresAt.toISOString();
    }
    credentials[credentialKey] = credentialData;

    return this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: { credentials },
    });
  }

  /**
   * Gets and decrypts credentials for a provider
   */
  async getCredentials(providerId: string, userId?: string): Promise<Credential[]> {
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      return [];
    }

    const credentials: Record<string, CredentialData> = isCredentialsRecord(provider.credentials)
      ? provider.credentials
      : {};
    const result: Credential[] = [];

    for (const [key, cred] of Object.entries(credentials)) {
      if (userId && cred.userId !== userId) {
        continue;
      }
      const credential: Credential = {
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
  async getCredential(credentialId: string): Promise<Credential | null> {
    // credentialId format: providerId_type_userId
    const parts: string[] = credentialId.split('_');
    if (parts.length < 2) {
      return null;
    }

    const providerId: string | undefined = parts[0];
    if (!providerId) {
      return null;
    }
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      return null;
    }

    const credentials: Record<string, CredentialData> = isCredentialsRecord(provider.credentials)
      ? provider.credentials
      : {};
    const cred: CredentialData | undefined = credentials[credentialId];

    if (!cred) {
      return null;
    }

    const credential: Credential = {
      id: credentialId,
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
    return credential;
  }

  /**
   * Updates credentials with encryption
   */
  async updateCredential(
    credentialId: string,
    data?: BasePayload,
    expiresAt?: Date
  ): Promise<IntegrationProviderData> {
    const parts: string[] = credentialId.split('_');
    if (parts.length < 2) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }

    const providerId: string | undefined = parts[0];
    if (!providerId) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials: Record<string, CredentialData> = isCredentialsRecord(provider.credentials)
      ? provider.credentials
      : {};
    const cred: CredentialData | undefined = credentials[credentialId];

    if (!cred) {
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
      data: { credentials },
    });
  }

  /**
   * Deletes credentials
   */
  async deleteCredential(credentialId: string): Promise<IntegrationProviderData> {
    const parts: string[] = credentialId.split('_');
    if (parts.length < 2) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }

    const providerId: string | undefined = parts[0];
    if (!providerId) {
      throw new Error(`Invalid credential ID: ${credentialId}`);
    }
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials: Record<string, CredentialData> = isCredentialsRecord(provider.credentials)
      ? provider.credentials
      : {};
    delete credentials[credentialId];

    return this.prisma.integrationProvider.update({
      where: { id: providerId },
      data: { credentials },
    });
  }

  /**
   * Checks if credentials are expired
   */
  async checkExpiredCredentials(providerId: string): Promise<boolean> {
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      return false;
    }

    const credentials: Record<string, CredentialData> = isCredentialsRecord(provider.credentials)
      ? provider.credentials
      : {};
    const now: Date = new Date();

    for (const cred of Object.values(credentials)) {
      if (cred.expiresAt && new Date(cred.expiresAt) <= now) {
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
  async rotateCredentials(providerId: string): Promise<CredentialRotationResult[]> {
    const provider: IntegrationProviderData | null =
      await this.prisma.integrationProvider.findUnique({
        where: { id: providerId },
      });

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const credentials: Record<string, CredentialData> = isCredentialsRecord(provider.credentials)
      ? provider.credentials
      : {};
    const results: CredentialRotationResult[] = [];

    for (const [key, cred] of Object.entries(credentials)) {
      try {
        const decrypted: BasePayload = this.decryptCredentialData(cred.data);
        const reEncrypted: string = this.crypto.encryptObject(decrypted);

        cred.data = reEncrypted;
        cred.updatedAt = new Date().toISOString();
        credentials[key] = cred;

        results.push({ id: key, status: 'rotated' });
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to rotate credential ${key}:`, error);
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
