/**
 * Type guards for OAuth2 controller
 * Безопасная проверка типов без использования 'as'
 */

import type { OAuthUserInfoDto } from '@workix/domain/auth';

/**
 * Helper to safely get property from object without type assertions
 */
function getProperty(obj: unknown, key: string): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }
  if (!(key in obj)) {
    return undefined;
  }
  // Safe property access using Object.getOwnPropertyDescriptor
  const descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(obj, key);
  return descriptor?.value;
}

/**
 * Type guard to check if value is OAuthUserInfoDto
 * OAuthUserInfoDto has: id (string), email (string), name (string), emailVerified (boolean)
 */
export function isOAuthUserInfoDto(value: unknown): value is OAuthUserInfoDto {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check required fields: id and email
  const idValue: unknown = getProperty(value, 'id');
  if (typeof idValue !== 'string') {
    return false;
  }

  const emailValue: unknown = getProperty(value, 'email');
  if (typeof emailValue !== 'string') {
    return false;
  }

  // Check optional fields if present
  const nameValue: unknown = getProperty(value, 'name');
  if (nameValue !== undefined && typeof nameValue !== 'string') {
    return false;
  }

  const emailVerifiedValue: unknown = getProperty(value, 'emailVerified');
  if (emailVerifiedValue !== undefined && typeof emailVerifiedValue !== 'boolean') {
    return false;
  }

  return true;
}
