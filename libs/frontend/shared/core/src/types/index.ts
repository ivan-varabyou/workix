/**
 * Frontend Types
 * Types for frontend applications
 *
 * ⚠️ IMPORTANT: These types are ONLY for the frontend!
 * The backend uses its own DTOs in domain libraries.
 *
 * TYPE ARCHITECTURE:
 *
 * 1. Prisma types (common) - in @prisma/client
 *    - Used by both frontend and backend
 *    - Automatically generated: npx prisma generate
 *
 * 2. Frontend DTO (this file) - in @workix/shared/frontend/core
 *    - Based on Prisma types
 *    - Exclude sensitive data
 *    - Optimized for UI
 *
 * 3. Backend DTO - in libs/domain/[module]/dto/
 *    - With validation (class-validator)
 *    - Used in NestJS controllers
 *
 * 4. Swagger types (optional) - for API contracts
 *    - Generation: npm run generate:api-types:monolith
 */

// ============================================
// PRISMA TYPES (automatic generation)
// ============================================
// ⚠️ IMPORTANT: Prisma types are in the common shared library (@workix/shared),
// not in the frontend library, because they are also needed by the backend!
//
// For using Prisma types:
//   import type { User, Prisma } from '@prisma/client';
//   // or via re-export:
//   import type { User, Prisma } from '@workix/shared';
//
// For using Prisma types with a prefix (if both Prisma and DTOs are needed):
//   import type { User as PrismaUser } from '@prisma/client';
//   import type { User } from '@workix/shared/frontend/core';
//
// Re-export Prisma namespace for convenience
// ⚠️ It is recommended to import directly from @prisma/client or @workix/shared
export type { Prisma } from '@prisma/client';

// Re-export Prisma types with a prefix to avoid conflicts
export type {
  Execution as PrismaExecution,
  Pipeline as PrismaPipeline,
  Role as PrismaRole,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@prisma/client';

// ============================================
// DTO TYPES (for frontend) - main export
// ============================================
export * from './dto.types';

// ============================================
// SWAGGER TYPES (require generation)
// ============================================
// Uncomment after generation:
// export type { paths as MonolithPaths, components as MonolithComponents } from './api-monolith.types';
// export type { paths as GatewayPaths, components as GatewayComponents } from './api-gateway.types';
// export type { paths as AuthPaths, components as AuthComponents } from './api-auth.types';

// Placeholder types until first Swagger generation
export type ApiPaths = Record<string, unknown>;
export type ApiComponents = Record<string, unknown>;

/**
 * Example usage after generation:
 *
 * import type { MonolithPaths, MonolithComponents } from '@workix/shared/frontend/core/types';
 *
 * // User type from schema
 * type User = MonolithComponents['schemas']['User'];
 *
 * // Request type for user creation
 * type CreateUserRequest = MonolithPaths['/api/v1/users']['post']['requestBody']['content']['application/json'];
 *
 * // Response type
 * type CreateUserResponse = MonolithPaths['/api/v1/users']['post']['responses']['201']['content']['application/json'];
 */
