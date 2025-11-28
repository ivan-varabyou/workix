/**
 * Auth Controller Types
 * Типы для контроллера аутентификации
 *
 * Правило: В типах НЕ используются импорты, только примитивные типы и другие интерфейсы
 * Но для совместимости с сервисами, мы определяем типы, совместимые с User из domain/auth
 */

/**
 * User type compatible with domain/auth User (without passwordHash)
 * This matches the return type of AuthService.register and AuthService.getUserById
 */
export interface UserFromService {
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
