/**
 * HTTP Framework Abstraction Types
 * Framework-independent types for HTTP requests/responses
 */

/**
 * HTTP Request abstraction
 */
export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined> | undefined;
  params?: Record<string, string> | undefined;
  ip?: string | undefined;
  path?: string | undefined;
  [key: string]: unknown;
}

/**
 * HTTP Response abstraction
 */
export interface HttpResponse {
  status(code: number): HttpResponse;
  json(data: unknown): HttpResponse;
  redirect(url: string): HttpResponse;
  setHeader(name: string, value: string): HttpResponse;
  getHeader(name: string): string | string[] | undefined;
  [key: string]: unknown;
}

/**
 * HTTP Next Function abstraction
 */
export type HttpNextFunction = () => void;

/**
 * HTTP Middleware abstraction
 */
export type HttpMiddleware = (req: HttpRequest, res: HttpResponse, next: HttpNextFunction) => void;
