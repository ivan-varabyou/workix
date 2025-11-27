// Integration CRUD interfaces

import { BasePayload } from '@workix/integrations/core';

/**
 * Create Provider DTO
 */
export interface CreateProviderDto {
  name: string;
  type?: string;
  config?: BasePayload;
  credentials?: BasePayload;
  isActive?: boolean;
}

/**
 * Update Provider DTO
 */
export interface UpdateProviderDto {
  name?: string;
  type?: string;
  config?: BasePayload;
  credentials?: BasePayload;
  isActive?: boolean;
}

/**
 * Add Credential DTO
 */
export interface AddCredentialDto {
  type: string;
  data: BasePayload;
  userId?: string;
  expiresAt?: string; // ISO date string
}

/**
 * Update Credential DTO
 */
export interface UpdateCredentialDto {
  data: BasePayload;
  expiresAt?: string; // ISO date string
}

/**
 * Set Config DTO
 */
export interface SetConfigDto {
  key: string;
  value: string | number | boolean | BasePayload;
}

/**
 * Интерфейс для провайдера с учетными данными из CredentialManager
 */
export interface ProviderWithCredentialsFromManager {
  id: string;
  name: string;
  type: string;
  config: unknown;
  credentials: unknown;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
