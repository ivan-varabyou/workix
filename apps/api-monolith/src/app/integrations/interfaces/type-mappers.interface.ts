/**
 * Type Mappers Interfaces
 * Интерфейсы для функций преобразования типов
 */

/**
 * Интерфейс для события с метаданными
 */
export interface EventWithMetadata {
  metadata: unknown;
}

/**
 * Интерфейс для Prisma события для преобразования
 */
export interface PrismaEventForMapping {
  id: string;
  providerId: string;
  eventType: string;
  status: string;
  error: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
  provider: {
    id: string;
    name: string;
  };
}

/**
 * Интерфейс для Prisma события без provider (для событий внутри провайдера)
 */
export interface PrismaEventInProvider {
  id: string;
  providerId: string;
  eventType: string;
  status: string;
  error: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Интерфейс для Prisma провайдера для преобразования
 */
export interface PrismaProviderForMapping {
  id: string;
  name: string;
  type: string;
  config: unknown;
  credentials: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  events: PrismaEventInProvider[];
}

/**
 * Интерфейс для объекта метаданных для проверки
 */
export interface MetadataRecord {
  latencyMs?: unknown;
  cost?: unknown;
  error?: unknown;
  message?: unknown;
  [key: string]: unknown;
}
