/**
 * Integration CRUD Response Interfaces
 * Правильные типы для всех ответов контроллера без unknown и any
 */

import { BasePayload , Credential, CredentialRotationResult } from '@workix/integrations/core';

import { IntegrationProviderWithEvents } from './integration-monitoring.interface';

/**
 * Integration Event (из Prisma)
 */
export interface IntegrationEventResponse {
  id: string;
  providerId: string;
  eventType: string;
  payload: BasePayload | null;
  status: string;
  error: string | null;
  metadata: BasePayload | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Integration Provider (из Prisma с events) - используем существующий интерфейс
 */
export type IntegrationProviderWithEventsResponse = IntegrationProviderWithEvents;

/**
 * Integration Provider (из Prisma без events)
 */
export interface IntegrationProviderResponse {
  id: string;
  name: string;
  type: string;
  config: BasePayload | null;
  credentials: BasePayload | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Credential Response - используем существующий интерфейс
 */
export type CredentialResponse = Credential;

/**
 * Credential Rotation Result Item - используем существующий интерфейс
 */
export interface CredentialRotationResultItem {
  id: string;
  status: 'rotated' | 'failed';
  error?: string;
}

/**
 * Credential Rotation Response
 */
export interface CredentialRotationResponse {
  providerId: string;
  total: number;
  rotated: number;
  failed: number;
  results: CredentialRotationResult[];
}
