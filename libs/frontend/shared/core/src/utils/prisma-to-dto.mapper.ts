/**
 * Prisma to DTO Mappers
 * Утилиты для конвертации Prisma типов в DTO для фронтенда
 *
 * Эти функции используются для преобразования данных из API (Prisma) в DTO,
 * исключая чувствительные данные и добавляя UI-специфичные поля
 */

import type {
  CreatePipelineDto,
  CreateUserDto,
  Execution,
  Pipeline,
  UpdatePipelineDto,
  UpdateUserDto,
  User,
  UserWithProfile,
} from '../types/dto.types';
import type {
  Execution as PrismaExecution,
  Pipeline as PrismaPipeline,
  Prisma,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '../types/prisma.types';

// ============================================
// USER MAPPERS
// ============================================

/**
 * Конвертирует Prisma User в DTO User
 * Исключает чувствительные данные
 */
export function prismaUserToDto(prismaUser: PrismaUser): User {
  const { passwordHash, deletedAt, failedLoginAttempts, lockedUntil, ...safeUser } = prismaUser;

  const user: User = {
    ...safeUser,
  };
  // role и roles будут заполнены из UserRole при необходимости
  // Не добавляем их в объект, если они undefined

  return user;
}

/**
 * Конвертирует Prisma User с профилем в DTO UserWithProfile
 */
export function prismaUserWithProfileToDto(
  prismaUser: PrismaUser & { userProfile?: PrismaUserProfile | null }
): UserWithProfile {
  const user = prismaUserToDto(prismaUser);

  const userWithProfile: UserWithProfile = {
    ...user,
  };

  if (prismaUser.userProfile) {
    const profile: {
      bio?: string;
      avatarUrl?: string;
      phoneNumber?: string;
      dateOfBirth?: Date | string;
      location?: string;
      website?: string;
    } = {};

    if (prismaUser.userProfile.bio !== undefined && prismaUser.userProfile.bio !== null) {
      profile.bio = prismaUser.userProfile.bio;
    }
    if (prismaUser.userProfile.avatarUrl !== undefined && prismaUser.userProfile.avatarUrl !== null) {
      profile.avatarUrl = prismaUser.userProfile.avatarUrl;
    }
    if (prismaUser.userProfile.phoneNumber !== undefined && prismaUser.userProfile.phoneNumber !== null) {
      profile.phoneNumber = prismaUser.userProfile.phoneNumber;
    }
    if (prismaUser.userProfile.dateOfBirth !== undefined && prismaUser.userProfile.dateOfBirth !== null) {
      profile.dateOfBirth = prismaUser.userProfile.dateOfBirth;
    }
    if (prismaUser.userProfile.location !== undefined && prismaUser.userProfile.location !== null) {
      profile.location = prismaUser.userProfile.location;
    }
    if (prismaUser.userProfile.website !== undefined && prismaUser.userProfile.website !== null) {
      profile.website = prismaUser.userProfile.website;
    }

    userWithProfile.userProfile = profile;
  }

  return userWithProfile;
}

/**
 * Конвертирует CreateUserDto в Prisma UserCreateInput
 */
export function createUserDtoToPrisma(dto: CreateUserDto): Prisma.UserCreateInput {
  return {
    email: dto.email,
    name: dto.name || '',
    passwordHash: '', // Будет хеширован на бэкенде
    emailVerified: false,
  };
}

/**
 * Конвертирует UpdateUserDto в Prisma UserUpdateInput
 */
export function updateUserDtoToPrisma(dto: UpdateUserDto): Prisma.UserUpdateInput {
  const update: Prisma.UserUpdateInput = {};

  if (dto.email !== undefined) update.email = dto.email;
  if (dto.name !== undefined) update.name = dto.name;

  return update;
}

// ============================================
// PIPELINE MAPPERS
// ============================================

/**
 * Type guard для проверки PipelineStep
 */
function isPipelineStep(value: unknown): value is Pipeline['steps'][0] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const nameDesc = Object.getOwnPropertyDescriptor(value, 'name');
  const typeDesc = Object.getOwnPropertyDescriptor(value, 'type');
  const orderDesc = Object.getOwnPropertyDescriptor(value, 'order');
  return (
    typeof nameDesc?.value === 'string' &&
    typeof typeDesc?.value === 'string' &&
    typeof orderDesc?.value === 'number'
  );
}

/**
 * Type guard для проверки наличия steps в config
 */
function hasSteps(config: unknown): config is { steps: Pipeline['steps'] } {
  if (!config || typeof config !== 'object') return false;
  if (Array.isArray(config)) return false;
  const stepsDesc = Object.getOwnPropertyDescriptor(config, 'steps');
  if (!Array.isArray(stepsDesc?.value)) return false;
  // Проверяем, что все элементы - это PipelineStep
  return stepsDesc.value.every(isPipelineStep);
}

/**
 * Type guard для проверки статуса pipeline
 */
function isValidPipelineStatus(value: unknown): value is 'active' | 'inactive' | 'draft' {
  return (
    typeof value === 'string' && (value === 'active' || value === 'inactive' || value === 'draft')
  );
}

/**
 * Конвертирует Prisma Pipeline в DTO Pipeline
 */
export function prismaPipelineToDto(prismaPipeline: PrismaPipeline): Pipeline {
  // Prisma Pipeline хранит steps в config как JSON
  let steps: Pipeline['steps'] = [];

  if (prismaPipeline.config) {
    try {
      const config =
        typeof prismaPipeline.config === 'string'
          ? JSON.parse(prismaPipeline.config)
          : prismaPipeline.config;

      if (hasSteps(config)) {
        steps = config.steps;
      }
    } catch {
      steps = [];
    }
  }

  // Получаем status из config если есть
  let status: 'active' | 'inactive' | 'draft' | undefined = undefined;
  if (prismaPipeline.config) {
    try {
      const config =
        typeof prismaPipeline.config === 'string'
          ? JSON.parse(prismaPipeline.config)
          : prismaPipeline.config;

      if (config && typeof config === 'object' && !Array.isArray(config)) {
        const statusDesc = Object.getOwnPropertyDescriptor(config, 'status');
        const statusValue = statusDesc?.value;
        if (isValidPipelineStatus(statusValue)) {
          status = statusValue;
        }
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
  }

  const pipeline: Pipeline = {
    id: prismaPipeline.id,
    name: prismaPipeline.name,
    description: prismaPipeline.description || '',
    userId: prismaPipeline.userId,
    steps,
    createdAt: prismaPipeline.createdAt,
    updatedAt: prismaPipeline.updatedAt,
  };

  if (status !== undefined) {
    pipeline.status = status;
  }

  return pipeline;
}

/**
 * Конвертирует CreatePipelineDto в Prisma PipelineCreateInput
 */
export function createPipelineDtoToPrisma(dto: CreatePipelineDto): Prisma.PipelineCreateInput {
  // InputJsonValue может быть объектом, массивом, примитивом или null
  const configValue: Prisma.InputJsonValue = JSON.parse(
    JSON.stringify({
      steps: dto.steps,
      status: dto.status || 'draft',
    })
  );

  return {
    name: dto.name,
    description: dto.description,
    config: configValue,
    user: {
      connect: {
        id: '', // Должно быть заполнено из контекста
      },
    },
  };
}

/**
 * Конвертирует UpdatePipelineDto в Prisma PipelineUpdateInput
 */
export function updatePipelineDtoToPrisma(dto: UpdatePipelineDto): Prisma.PipelineUpdateInput {
  const update: Prisma.PipelineUpdateInput = {};

  if (dto.name !== undefined) update.name = dto.name;
  if (dto.description !== undefined) update.description = dto.description;
  if (dto.steps !== undefined || dto.status !== undefined) {
    // InputJsonValue может быть объектом, массивом, примитивом или null
    const configValue: Prisma.InputJsonValue = JSON.parse(
      JSON.stringify({
        steps: dto.steps,
        status: dto.status,
      })
    );
    update.config = configValue;
  }

  return update;
}

// ============================================
// EXECUTION MAPPERS
// ============================================

/**
 * Type guard для проверки ExecutionStatus
 */
function isValidExecutionStatus(value: unknown): value is Execution['status'] {
  if (typeof value !== 'string') return false;
  const validStatuses: readonly string[] = [
    'pending',
    'running',
    'success',
    'failed',
    'timeout',
    'completed',
  ];
  return validStatuses.includes(value);
}

/**
 * Type guard для проверки Record<string, unknown>
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  return true;
}

/**
 * Конвертирует Prisma Execution в DTO Execution
 */
export function prismaExecutionToDto(prismaExecution: PrismaExecution): Execution {
  let input: Record<string, unknown> | undefined;
  let output: Record<string, unknown> | undefined;

  // Получаем inputs и outputs из Prisma Execution
  const inputsDesc = Object.getOwnPropertyDescriptor(prismaExecution, 'inputs');
  const outputsDesc = Object.getOwnPropertyDescriptor(prismaExecution, 'outputs');
  const errorDesc = Object.getOwnPropertyDescriptor(prismaExecution, 'error');
  const durationMsDesc = Object.getOwnPropertyDescriptor(prismaExecution, 'durationMs');
  const startedAtDesc = Object.getOwnPropertyDescriptor(prismaExecution, 'startedAt');
  const completedAtDesc = Object.getOwnPropertyDescriptor(prismaExecution, 'completedAt');

  try {
    if (inputsDesc?.value) {
      const inputsValue =
        typeof inputsDesc.value === 'string' ? JSON.parse(inputsDesc.value) : inputsDesc.value;

      if (isRecord(inputsValue)) {
        input = inputsValue;
      }
    }

    if (outputsDesc?.value) {
      const outputsValue =
        typeof outputsDesc.value === 'string' ? JSON.parse(outputsDesc.value) : outputsDesc.value;

      if (isRecord(outputsValue)) {
        output = outputsValue;
      }
    }
  } catch {
    // Ошибка парсинга - оставляем undefined
  }

  // Проверяем статус
  const statusValue = prismaExecution.status;
  const status: Execution['status'] = isValidExecutionStatus(statusValue) ? statusValue : 'pending';

  // Получаем дополнительные поля
  const error = typeof errorDesc?.value === 'string' ? errorDesc.value : undefined;
  const duration = typeof durationMsDesc?.value === 'number' ? durationMsDesc.value : undefined;
  const startedAt = startedAtDesc?.value instanceof Date ? startedAtDesc.value : undefined;
  const completedAt = completedAtDesc?.value instanceof Date ? completedAtDesc.value : undefined;

  const execution: Execution = {
    id: prismaExecution.id,
    pipelineId: prismaExecution.pipelineId,
    status,
    createdAt: prismaExecution.createdAt,
    updatedAt: prismaExecution.updatedAt,
  };

  if (input !== undefined) {
    execution.input = input;
  }
  if (output !== undefined) {
    execution.output = output;
  }
  if (error !== undefined) {
    execution.error = error;
  }
  if (duration !== undefined) {
    execution.duration = duration;
  }
  if (startedAt !== undefined) {
    execution.startedAt = startedAt;
  }
  if (completedAt !== undefined) {
    execution.completedAt = completedAt;
  }

  return execution;
}
