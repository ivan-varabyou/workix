import { Injectable, NestMiddleware } from '@nestjs/common';
import type { HttpNextFunction, HttpRequest, HttpResponse } from '@workix/shared/backend/core';

/**
 * Security Headers Middleware
 * Adds important security headers
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: HttpRequest, res: HttpResponse, next: HttpNextFunction): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  }
}
