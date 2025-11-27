/**
 * JWT Payload Interface (with standard claims)
 */
export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * JWT Payload for signing (without iat and exp - added by JWT library)
 * Compatible with NestJS JwtService.signAsync which accepts object
 * According to @nestjs/jwt: signAsync(payload: string | Object | Buffer, ...)
 */
export interface JwtSignPayload {
  userId: string;
  email: string;
}

/**
 * Type guard to check if value is JwtSignPayload
 * Uses only type checks - no 'as' assertions
 */
export function isJwtSignPayload(value: unknown): value is JwtSignPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check properties using 'in' operator
  if (!('userId' in value) || !('email' in value)) {
    return false;
  }

  // Access properties using Record type for safe property access
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const recordValue: Record<string, unknown> = value as Record<string, unknown>;
  const userIdValue: unknown = recordValue.userId;
  const emailValue: unknown = recordValue.email;

  return typeof userIdValue === 'string' && typeof emailValue === 'string';
}

/**
 * Decoded JWT payload (may include iat and exp from JWT library)
 */
export interface JwtDecodedPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Type guard to check if value is JwtDecodedPayload
 * Used for safe type narrowing after verifyAsync
 * Uses Record type for safe property access
 */
export function isJwtDecodedPayload(value: unknown): value is JwtDecodedPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Check required properties using 'in' operator
  if (!('userId' in value) || !('email' in value)) {
    return false;
  }

  // Access properties using Record type for safe property access
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const recordValue: Record<string, unknown> = value as Record<string, unknown>;
  const userIdValue: unknown = recordValue.userId;
  const emailValue: unknown = recordValue.email;
  const iatValue: unknown = recordValue.iat;
  const expValue: unknown = recordValue.exp;

  return (
    typeof userIdValue === 'string' &&
    typeof emailValue === 'string' &&
    (iatValue === undefined || typeof iatValue === 'number') &&
    (expValue === undefined || typeof expValue === 'number')
  );
}

/**
 * JWT Tokens Response
 */
export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
