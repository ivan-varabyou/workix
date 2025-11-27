/**
 * HTTP Framework Abstraction Interfaces
 *
 * DEPRECATED: Используйте типы из @workix/shared/backend/core вместо этого файла.
 * Этот файл оставлен для обратной совместимости.
 *
 * Для новых файлов используйте:
 * import { HttpRequest, HttpResponse, HttpNextFunction, HttpMiddleware } from '@workix/shared/backend/core';
 */

import type { HttpRequest, HttpResponse, HttpNextFunction, HttpMiddleware } from '@workix/shared/backend/core';

/**
 * @deprecated Use HttpRequest from @workix/shared/backend/core
 */
export type TypedRequest = HttpRequest;

/**
 * @deprecated Use HttpResponse from @workix/shared/backend/core
 */
export type TypedResponse = HttpResponse;

/**
 * @deprecated Use HttpNextFunction from @workix/shared/backend/core
 */
export type TypedNextFunction = HttpNextFunction;

/**
 * @deprecated Use HttpMiddleware from @workix/shared/backend/core
 */
export type ExpressMiddleware = HttpMiddleware;

// Re-export for convenience
export type { HttpRequest, HttpResponse, HttpNextFunction, HttpMiddleware };
