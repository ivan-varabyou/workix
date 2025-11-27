/**
 * Phone OTP Controller Response Interfaces
 * Интерфейсы для ответов контроллера Phone OTP
 *
 * Правило: В интерфейсах НЕ используются импорты, только примитивные типы и другие интерфейсы
 */

/**
 * Send OTP Response
 */
export interface SendOtpResponse {
  id: string;
  expiresAt: Date;
  message: string;
}

/**
 * Verify OTP Response User
 */
export interface VerifyOtpResponseUser {
  id: string;
  phoneNumber: string;
  email?: string | undefined;
  name?: string | undefined;
}

/**
 * Verify OTP Response
 */
export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: VerifyOtpResponseUser;
}
