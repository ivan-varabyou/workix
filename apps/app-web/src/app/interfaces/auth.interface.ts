// Auth interfaces for app-web

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  refresh_token?: string;
  [key: string]: string | undefined;
}

/**
 * Auth Response interface
 */
export interface AuthResponse {
  access_token: string;
  user: User;
  refresh_token?: string;
}

/**
 * Login Request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register Request interface
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Refresh Token Request interface
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Forgot Password Request interface
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request interface
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}
