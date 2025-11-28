/**
 * Email Verification Controller Response Interfaces
 * Интерфейсы для ответов контроллера верификации email
 *
 * Правило: В интерфейсах НЕ используются импорты, только примитивные типы и другие интерфейсы
 */

/**
 * Send Verification Email Response
 */
export interface SendVerificationEmailResponse {
  token: string;
  expiresAt: Date;
}

/**
 * Verify Email Response User
 */
export interface VerifyEmailResponseUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

/**
 * Verify Email Response
 */
export interface VerifyEmailResponse {
  message: string;
  user: VerifyEmailResponseUser;
}

/**
 * Resend Verification Email Response
 */
export interface ResendVerificationEmailResponse {
  message: string;
  expiresAt: Date;
}

/**
 * Get Verification Status Response
 */
export interface GetVerificationStatusResponse {
  verified: boolean;
  expiresAt?: Date;
  resendCount?: number;
  maxResends?: number;
}
