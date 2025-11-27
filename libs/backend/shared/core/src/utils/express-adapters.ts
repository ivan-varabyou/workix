/**
 * Express Adapters
 * Convert Express types to framework-independent abstractions
 */

import type { HttpNextFunction, HttpRequest, HttpResponse } from '../types/http.types';

/**
 * Type guard to check if value is Express Request
 */
export function isExpressRequest(value: unknown): value is {
  method: string;
  url: string;
  path?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  params?: Record<string, string>;
  ip?: string;
  [key: string]: unknown;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'method' in value &&
    'url' in value &&
    'headers' in value &&
    typeof (value as { method: unknown }).method === 'string' &&
    typeof (value as { url: unknown }).url === 'string'
  );
}

/**
 * Type guard to check if value is Express Response
 */
export function isExpressResponse(value: unknown): value is {
  status: (code: number) => unknown;
  json: (data: unknown) => unknown;
  setHeader: (name: string, value: string) => unknown;
  getHeader: (name: string) => string | string[] | undefined;
  [key: string]: unknown;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'json' in value &&
    'setHeader' in value &&
    typeof (value as { status: unknown }).status === 'function' &&
    typeof (value as { json: unknown }).json === 'function' &&
    typeof (value as { setHeader: unknown }).setHeader === 'function'
  );
}

/**
 * Type guard to check if value is Express Next Function
 */
export function isExpressNextFunction(value: unknown): value is () => void {
  return typeof value === 'function';
}

/**
 * Convert Express Request to HttpRequest abstraction
 */
export function expressRequestToHttpRequest(expressReq: {
  method: string;
  url: string;
  path?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  params?: Record<string, string>;
  ip?: string;
  [key: string]: unknown;
}): HttpRequest {
  return {
    method: expressReq.method,
    url: expressReq.url || expressReq.path || '',
    headers: expressReq.headers,
    body: expressReq.body,
    query: expressReq.query ?? undefined,
    params: expressReq.params ?? undefined,
    ip: expressReq.ip ?? undefined,
    path: expressReq.path ?? undefined,
  };
}

/**
 * Convert Express Response to HttpResponse abstraction
 */
export function expressResponseToHttpResponse(expressRes: {
  status: (code: number) => unknown;
  json: (data: unknown) => unknown;
  setHeader: (name: string, value: string) => unknown;
  getHeader: (name: string) => string | string[] | undefined;
  [key: string]: unknown;
}): HttpResponse {
  return {
    status: (code: number) => {
      const result = expressRes.status(code);
      return expressResponseToHttpResponse(result as typeof expressRes);
    },
    json: (data: unknown) => {
      expressRes.json(data);
      return expressResponseToHttpResponse(expressRes);
    },
    redirect: (url: string) => {
      const expressResWithRedirect = expressRes as { redirect?: (url: string) => void };
      if (expressResWithRedirect.redirect && typeof expressResWithRedirect.redirect === 'function') {
        expressResWithRedirect.redirect(url);
      }
      return expressResponseToHttpResponse(expressRes);
    },
    setHeader: (name: string, value: string) => {
      expressRes.setHeader(name, value);
      return expressResponseToHttpResponse(expressRes);
    },
    getHeader: (name: string) => expressRes.getHeader(name),
  };
}

/**
 * Convert Express Next Function to HttpNextFunction abstraction
 */
export function expressNextToHttpNext(expressNext: () => void): HttpNextFunction {
  return expressNext;
}
