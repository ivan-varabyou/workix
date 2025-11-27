/**
 * Prisma Types
 * Автоматически сгенерированные типы из Prisma схемы
 *
 * Эти типы генерируются автоматически при выполнении:
 *   npx prisma generate
 *
 * Все типы доступны через @prisma/client
 * Этот файл реэкспортирует их для удобства использования
 *
 * ⚠️ ВАЖНО: Эти типы общие для фронтенда и бэкенда!
 * Используйте их напрямую из @prisma/client или через этот файл
 */

// Реэкспортируем все типы из Prisma Client
// Примечание: Экспортируем только те типы, которые точно есть в базовой схеме
// Некоторые типы могут отсутствовать в определенных схемах (например, Permission, Role, UserRole, AuditLog)
export type {
  EmailVerification,
  PhoneOtp,
  // Enums
  Provider,
  SocialAccount,
  // Модели
  User,
} from '@prisma/client';

// Условный экспорт типов, которые могут отсутствовать в некоторых схемах
// Permission, Role, UserRole, AuditLog - могут быть в других схемах (api-monolith)

// Реэкспортируем Prisma namespace со всеми типами операций
export type { Prisma } from '@prisma/client';

/**
 * Примеры использования:
 *
 * // В бэкенде
 * import type { User, Prisma } from '@workix/shared/types/prisma.types';
 *
 * // В фронтенде
 * import type { User, Prisma } from '@workix/shared/types/prisma.types';
 *
 * // Тип модели
 * type UserType = User;
 *
 * // Тип с включенными связями
 * type UserWithProfile = Prisma.UserGetPayload<{
 *   include: { userProfile: true }
 * }>;
 *
 * // Тип для создания
 * type CreateUser = Prisma.UserCreateInput;
 *
 * // Тип для обновления
 * type UpdateUser = Prisma.UserUpdateInput;
 */
