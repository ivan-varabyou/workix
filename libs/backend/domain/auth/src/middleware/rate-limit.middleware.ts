import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import type { HttpNextFunction, HttpRequest, HttpResponse } from '@workix/shared/backend/core';

/**
 * Rate Limiting Middleware
 * Limits requests per IP/user
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: Map<string, { count: number; resetTime: number }> = new Map<string, { count: number; resetTime: number }>();

  use(req: HttpRequest, _res: HttpResponse, next: HttpNextFunction): void {
    const key: string = this.getKey(req);
    const now: number = Date.now();
    const limit: number = this.getLimit(req.path || '');

    const entry: { count: number; resetTime: number } | undefined = this.store.get(key);

    if (entry && entry.resetTime > now) {
      entry.count++;
      if (entry.count > limit) {
        throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
    } else {
      this.store.set(key, { count: 1, resetTime: now + 60000 });
    }

    next();
  }

  private getKey(req: HttpRequest): string {
    return req.ip || 'unknown';
  }

  private getLimit(path: string): number {
    if (path.includes('login') || path.includes('register')) {
      return 5;
    }
    if (path.includes('password-reset')) {
      return 3;
    }
    if (path.includes('2fa')) {
      return 10;
    }
    return 100;
  }
}
