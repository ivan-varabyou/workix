/**
 * Credential Rotation Interfaces
 * Интерфейсы для ротации учетных данных
 */

/**
 * Интерфейс для провайдера с учетными данными
 */
export interface ProviderWithCredential {
  id: string;
  name: string;
  credentials: Record<string, unknown>;
}

/**
 * Интерфейс для учетных данных с датой истечения
 */
export interface CredentialWithExpiresAt {
  expiresAt: unknown;
  [key: string]: unknown;
}

/**
 * Интерфейс для результата ротации с датой истечения
 */
export interface CredentialRotationItem {
  providerId: string;
  key: string;
  credential: CredentialWithExpiresAt;
}

/**
 * Интерфейс для результата ротации учетных данных
 */
export interface CredentialRotationResultItem {
  id: string;
  status: string;
  error?: string;
}

/**
 * Интерфейс для результата ротации провайдера
 */
export interface RotationResult {
  providerId: string;
  total: number;
  rotated: number;
  failed: number;
  results: CredentialRotationResultItem[];
}

/**
 * Интерфейс для ошибки ротации
 */
export interface RotationError {
  providerId: string;
  total: number;
  rotated: number;
  failed: number;
  error: string;
}
