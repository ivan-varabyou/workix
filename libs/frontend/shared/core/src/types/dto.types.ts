/**
 * Frontend DTO Types
 * Data Transfer Objects для фронтенд приложений
 *
 * ⚠️ ВАЖНО: Эти типы ТОЛЬКО для фронтенда!
 * Бэкенд использует свои DTO в domain библиотеках с валидацией.
 *
 * Эти типы основаны на Prisma типах (из @workix/shared/types/prisma.types.ts), но:
 * - Исключают чувствительные данные (passwordHash, tokens, etc.)
 * - Соответствуют API контракту
 * - Могут содержать дополнительные поля для UI
 * - Оптимизированы для фронтенда
 *
 * Типы автоматически обновляются при изменении Prisma схемы
 *
 * АРХИТЕКТУРА:
 * - Prisma типы: @workix/shared/types/prisma.types.ts (общие)
 * - Frontend DTO: этот файл (только для фронтенда)
 * - Backend DTO: libs/domain/.../dto/ (только для бэкенда)
 */

// Импортируем Prisma типы напрямую из @prisma/client
// (Prisma типы общие для фронтенда и бэкенда)
import type { Prisma, User as PrismaUser } from '@prisma/client';

// ============================================
// USER DTO
// ============================================

/**
 * User DTO для фронтенда
 * Исключает: passwordHash, deletedAt, failedLoginAttempts, lockedUntil
 */
export type User = Omit<
  PrismaUser,
  'passwordHash' | 'deletedAt' | 'failedLoginAttempts' | 'lockedUntil'
> & {
  // Дополнительные поля для UI
  role?: string;
  roles?: string[];
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  lastLoginAt?: Date | string;
  isActive?: boolean;
};

/**
 * User с профилем
 */
export type UserWithProfile = User & {
  userProfile?: {
    bio?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    dateOfBirth?: Date | string;
    location?: string;
    website?: string;
  };
};

/**
 * DTO для создания пользователя
 */
export interface CreateUserDto {
  email: string;
  name?: string;
  password: string;
  role?: string;
  roles?: string[];
}

/**
 * DTO для обновления пользователя
 */
export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: string;
  roles?: string[];
  isActive?: boolean;
}

// ============================================
// PIPELINE DTO
// ============================================

/**
 * Pipeline Step DTO
 */
export interface PipelineStep {
  id?: string;
  name: string;
  type: string;
  order: number;
  config?: Record<string, unknown>;
  condition?: string;
  position?: { x: number; y: number };
}

/**
 * Pipeline DTO для фронтенда
 */
export interface Pipeline {
  id: string;
  name: string;
  description: string;
  userId: string;
  steps: PipelineStep[];
  status?: 'active' | 'inactive' | 'draft';
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * DTO для создания пайплайна
 */
export interface CreatePipelineDto {
  name: string;
  description: string;
  steps: PipelineStep[];
  status?: 'active' | 'inactive' | 'draft';
}

/**
 * DTO для обновления пайплайна
 */
export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  steps?: PipelineStep[];
  status?: 'active' | 'inactive' | 'draft';
}

// ============================================
// EXECUTION DTO
// ============================================

/**
 * Execution Status
 */
export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'timeout'
  | 'completed';

/**
 * Execution DTO для фронтенда
 */
export interface Execution {
  id: string;
  pipelineId: string;
  status: ExecutionStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
  startedAt?: Date | string;
  completedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Execution Details с дополнительной информацией
 */
export interface ExecutionDetails extends Execution {
  pipeline?: Pipeline;
  steps?: Array<{
    id: string;
    name: string;
    status: ExecutionStatus;
    output?: Record<string, unknown>;
    error?: string;
    duration?: number;
  }>;
}

// ============================================
// ROLE DTO
// ============================================

/**
 * Permission DTO для фронтенда
 * Основан на Prisma Permission модели (автоматически генерируется)
 * Исключаем связи, которые не нужны на фронтенде
 */
export type Permission = Omit<Prisma.PermissionGetPayload<{}>, 'roles'>;

/**
 * Role DTO для фронтенда
 * Основан на Prisma Role модели (автоматически генерируется)
 * Добавляем UI-специфичные поля
 */
export type Role = Omit<Prisma.RoleGetPayload<{}>, 'permissions' | 'userRoles'> & {
  // UI-специфичные поля (не из Prisma)
  permissions?: Permission[];
  permissionIds?: string[];
};

/**
 * DTO для создания роли
 */
export interface CreateRoleDto {
  name: string;
  description?: string;
  level?: number;
  permissionIds?: string[];
}

/**
 * DTO для обновления роли
 */
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  level?: number;
  permissionIds?: string[];
}

/**
 * DTO для назначения прав роли
 */
export interface AssignPermissionsDto {
  permissionIds: string[];
}

/**
 * Role с флагом isNew
 */
export interface RoleWithNew extends Role {
  isNew?: boolean;
}

// ============================================
// AUDIT LOG DTO
// ============================================

/**
 * Audit Log DTO для фронтенда
 */
export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date | string;
}

/**
 * Audit Log List Response
 */
export type AuditLogListResponse = ListResponse<AuditLog>;

/**
 * Audit Log Filters
 */
export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// INTEGRATION DTO
// ============================================

/**
 * IntegrationProvider DTO для фронтенда
 * Основан на Prisma IntegrationProvider модели (автоматически генерируется)
 */
export type IntegrationProvider = Omit<Prisma.IntegrationProviderGetPayload<{}>, 'events'> & {
  // UI-специфичные поля (не из Prisma)
  displayName?: string;
  capabilities?: string[];
  healthStatus?: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
  baseApiUrl?: string;
};

/**
 * IntegrationCredential DTO для фронтенда
 * Примечание: credentials хранятся в JSON поле IntegrationProvider,
 * но для удобства работы на фронтенде выделяем отдельный тип
 */
export interface IntegrationCredential {
  id: string;
  providerId: string;
  userId?: string;
  type: 'OAUTH2' | 'API_KEY' | 'BASIC';
  data: Record<string, unknown>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO для создания credentials
 */
export interface CreateCredentialDto {
  type: 'OAUTH2' | 'API_KEY' | 'BASIC';
  data: Record<string, unknown>;
  expiresAt?: string;
}

/**
 * DTO для обновления credentials
 */
export interface UpdateCredentialDto {
  type?: 'OAUTH2' | 'API_KEY' | 'BASIC';
  data?: Record<string, unknown>;
  expiresAt?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * List Response с пагинацией
 */
export interface ListResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

/**
 * User List Response
 */
export type UserListResponse = ListResponse<User>;

/**
 * Pipeline List Response
 */
export type PipelineListResponse = ListResponse<Pipeline>;

/**
 * Role List Response
 */
export type RoleListResponse = ListResponse<Role>;
