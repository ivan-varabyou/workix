/**
 * Salesforce API Types
 *
 * Этот файл содержит типы из @types/jsforce
 * После установки пакетов эти типы будут импортироваться из библиотек
 */

// TODO: После установки @types/jsforce заменить на:
// import type {
//   Connection,
//   QueryResult,
//   Record,
//   SObject,
// } from 'jsforce';

// Временные типы до установки пакетов
// После установки будут заменены на импорты из jsforce

export interface SalesforceUser {
  Id: string;
  Username: string;
  Email: string;
  FirstName?: string;
  LastName?: string;
  Name: string;
  Alias?: string;
  TimeZoneSidKey?: string;
  LocaleSidKey?: string;
  EmailEncodingKey?: string;
  ProfileId?: string;
  LanguageLocaleKey?: string;
  IsActive: boolean;
  CreatedDate: string;
  LastModifiedDate: string;
  [key: string]: unknown;
}

export interface SalesforceRecord {
  Id: string;
  attributes?: {
    type: string;
    url: string;
  };
  [key: string]: unknown;
}

export interface SalesforceQueryResult<T = SalesforceRecord> {
  totalSize: number;
  done: boolean;
  records: T[];
}

export interface SalesforceSObject {
  name: string;
  label: string;
  keyPrefix?: string;
  labelPlural?: string;
  custom?: boolean;
  queryable?: boolean;
  createable?: boolean;
  updateable?: boolean;
  deletable?: boolean;
  deprecatedAndHidden?: boolean;
  searchable?: boolean;
  feedEnabled?: boolean;
  retrieveable?: boolean;
  customSetting?: boolean;
  activateable?: boolean;
  [key: string]: unknown;
}

export interface SalesforceConnectionInfo {
  accessToken: string;
  instanceUrl: string;
  refreshToken?: string;
  id?: string;
  issued_at?: string;
  signature?: string;
  [key: string]: unknown;
}

export interface SalesforceApiResponse<T = unknown> {
  success: boolean;
  id?: string;
  errors?: Array<{
    statusCode: string;
    message: string;
    fields?: string[];
  }>;
  result?: T;
  [key: string]: unknown;
}

export interface SalesforceFlowInput {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SalesforceFlowOutput {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SalesforceFlowResponse {
  flowName: string;
  status: string;
  output?: SalesforceFlowOutput;
  errors?: string[];
}

export interface SalesforceOrgInfo {
  orgName: string;
  edition: string;
  apiVersion: string;
  organizationId?: string;
  instanceUrl?: string;
}

/**
 * Type guards for Salesforce API responses
 */
export function isSalesforceUser(data: unknown): data is SalesforceUser {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.Id === 'string' &&
    typeof obj.Username === 'string' &&
    typeof obj.Email === 'string' &&
    typeof obj.Name === 'string'
  );
}

export function isSalesforceRecord(data: unknown): data is SalesforceRecord {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.Id === 'string';
}

export function isSalesforceQueryResult<T = SalesforceRecord>(
  data: unknown
): data is SalesforceQueryResult<T> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return (
    typeof obj.totalSize === 'number' && typeof obj.done === 'boolean' && Array.isArray(obj.records)
  );
}

export function isSalesforceSObject(data: unknown): data is SalesforceSObject {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.name === 'string' && typeof obj.label === 'string';
}

export function isSalesforceConnectionInfo(data: unknown): data is SalesforceConnectionInfo {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.accessToken === 'string' && typeof obj.instanceUrl === 'string';
}

export function isSalesforceApiResponse<T = unknown>(
  data: unknown
): data is SalesforceApiResponse<T> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj: Record<string, unknown> = data as Record<string, unknown>;
  return typeof obj.success === 'boolean';
}
