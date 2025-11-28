/**
 * Auth Controller Response Interfaces
 * Интерфейсы для ответов контроллера аутентификации
 *
 * Правило: В интерфейсах НЕ используются импорты, только примитивные типы и другие интерфейсы
 */

/**
 * User without password hash
 */
export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  phone?: string | null | undefined;
  phoneVerified?: boolean | null | undefined;
  twoFactorEnabled?: boolean | null | undefined;
  biometricEnabled?: boolean | null | undefined;
  lockedUntil?: Date | null | undefined;
  failedLoginAttempts?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null | undefined;
}

/**
 * Register Response
 */
export interface RegisterResponse {
  message: string;
  user: UserWithoutPassword;
}

/**
 * Tokens Response
 */
export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login Response
 */
export interface LoginResponse {
  tokens?: TokensResponse;
  user: UserWithoutPassword;
  requiresSecurityCode?: boolean;
  securityCodeExpiresAt?: Date;
  message?: string;
}

/**
 * Refresh Token Response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Logout Response
 */
export interface LogoutResponse {
  message: string;
}

/**
 * Request Password Reset Response
 */
export interface RequestPasswordResetResponse {
  message: string;
  resetTokenId: string;
}

/**
 * Verify Reset Token Response
 */
export interface VerifyResetTokenResponse {
  userId: string;
  email: string;
}

/**
 * Reset Password Response
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * Generate 2FA Secret Response
 */
export interface Generate2FASecretResponse {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

/**
 * Enable 2FA Response
 */
export interface Enable2FAResponse {
  message: string;
  backupCodes: string[];
}

/**
 * Verify 2FA Response
 */
export interface Verify2FAResponse {
  verified: boolean;
  message: string;
}

/**
 * Disable 2FA Response
 */
export interface Disable2FAResponse {
  message: string;
}

/**
 * Get 2FA Status Response
 */
export interface Get2FAStatusResponse {
  enabled: boolean;
  backupCodesRemaining: number;
}

/**
 * Regenerate Backup Codes Response
 */
export interface RegenerateBackupCodesResponse {
  message: string;
  backupCodes: string[];
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  status: string;
  timestamp: Date;
}

/**
 * Verify Token Request Body
 */
export interface VerifyTokenRequestBody {
  token: string;
}
