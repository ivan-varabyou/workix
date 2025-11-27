// Credential Manager interfaces

import { BasePayload } from './integration-payload.interface';
import { ProviderRegistryPrismaService } from './provider-registry.interface';

export interface CredentialData {
  type: string;
  data: string; // Encrypted data
  userId?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Type guard to check if value is CredentialData
 */
export function isCredentialData(value: unknown): value is CredentialData {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const obj: Record<string, unknown> = value as Record<string, unknown>;
  return (
    typeof obj.type === 'string' &&
    typeof obj.data === 'string' &&
    typeof obj.createdAt === 'string' &&
    (obj.userId === undefined || typeof obj.userId === 'string') &&
    (obj.expiresAt === undefined || typeof obj.expiresAt === 'string') &&
    (obj.updatedAt === undefined || typeof obj.updatedAt === 'string')
  );
}

/**
 * Type guard to check if value is Record<string, CredentialData>
 */
export function isCredentialsRecord(value: unknown): value is Record<string, CredentialData> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const obj: Record<string, unknown> = value as Record<string, unknown>;
  return Object.values(obj).every((v) => isCredentialData(v));
}

export interface Credential {
  id: string;
  providerId: string;
  type: string;
  userId?: string;
  data: BasePayload; // Decrypted data
  expiresAt?: Date;
  createdAt: Date;
}

export interface CredentialManagerPrismaService extends ProviderRegistryPrismaService {
  integrationProvider: ProviderRegistryPrismaService['integrationProvider'];
}

export interface CredentialRotationResult {
  id: string;
  status: 'rotated' | 'failed';
  error?: string;
}
