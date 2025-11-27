/**
 * Prisma Types
 * Автоматически сгенерированные типы из Prisma схемы
 *
 * Эти типы генерируются автоматически при выполнении:
 *   npx prisma generate
 *
 * Все типы доступны через @prisma/client
 * Этот файл просто реэкспортирует их для удобства использования
 */

// Реэкспортируем все типы из Prisma Client
export type {
  ABTest,
  AIExecution,
  AIModel,
  AIProvider,
  EmailVerification,
  Execution,
  ExecutionStatus,
  IntegrationEvent,
  IntegrationProvider,
  Permission,
  PhoneOtp,
  Pipeline,
  // Enums
  Provider,
  Role,
  SocialAccount,
  Status,
  // Модели
  User,
  UserProfile,
  UserRole,
  VirtualWorker,
} from '@prisma/client';

// Реэкспортируем Prisma namespace со всеми типами операций
export type { Prisma } from '@prisma/client';

/**
 * Примеры использования:
 *
 * import type { User, Prisma } from '@workix/shared/frontend/core/types/prisma.types';
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
 *
 * // Тип для запроса
 * type FindUsersArgs = Prisma.UserFindManyArgs;
 *
 * // Тип для where условия
 * type UserWhere = Prisma.UserWhereInput;
 */
