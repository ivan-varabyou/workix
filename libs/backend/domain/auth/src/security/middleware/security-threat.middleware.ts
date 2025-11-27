import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { HttpNextFunction, HttpRequest, HttpResponse } from '@workix/shared/backend/core';

import { ThreatDetectionService } from '../services/threat-detection.service';

/**
 * Extended Request interface with user property
 * User property is added by authentication guards/middleware
 */
interface RequestWithUser extends HttpRequest {
  user?: {
    userId?: string;
    email?: string;
  };
}

/**
 * Type guard to check if body has email property
 */
function hasEmailProperty(body: unknown): body is { email?: string } {
  return typeof body === 'object' && body !== null && 'email' in body;
}

/**
 * Type guard to check if value is user object
 */
function isUserObject(value: unknown): value is { userId?: string; email?: string } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Type guard requires assertion
  const obj: Record<string, unknown> = value as Record<string, unknown>;
  const hasUserId: boolean = 'userId' in obj;
  const hasEmail: boolean = 'email' in obj;
  if (!hasUserId && !hasEmail) {
    return false;
  }
  const userIdValid: boolean = !hasUserId || obj.userId === undefined || typeof obj.userId === 'string';
  const emailValid: boolean = !hasEmail || obj.email === undefined || typeof obj.email === 'string';
  return userIdValid && emailValid;
}

/**
 * Safely extract user from request
 * User property is added by authentication guards/middleware if user is authenticated
 */
function getUserFromRequest(req: HttpRequest): RequestWithUser['user'] {
  // Check if request has user property using 'in' operator
  // Access user property safely - it's added by auth guards if present
  if ('user' in req && req.user) {
    const userValue: unknown = req.user;
    if (isUserObject(userValue)) {
      const result: { userId?: string; email?: string } = {};
      if (userValue.userId !== undefined && typeof userValue.userId === 'string') {
        result.userId = userValue.userId;
      }
      if (userValue.email !== undefined && typeof userValue.email === 'string') {
        result.email = userValue.email;
      }
      return result;
    }
  }
  return undefined;
}

/**
 * Security Threat Middleware
 * Analyzes requests for security threats and blocks suspicious activity
 */
@Injectable()
export class SecurityThreatMiddleware implements NestMiddleware {
  private readonly logger: Logger = new Logger(SecurityThreatMiddleware.name);

  constructor(private readonly threatDetection: ThreatDetectionService) {}

  async use(req: HttpRequest, res: HttpResponse, next: HttpNextFunction): Promise<void> {
    try {
      // Extract request information
      // Request may have user property added by authentication middleware/guards
      const reqSocket = 'socket' in req && typeof req.socket === 'object' && req.socket !== null
        ? req.socket as { remoteAddress?: string }
        : null;
      const ipAddress: string = req.ip || reqSocket?.remoteAddress || 'unknown';
      // Safely extract user from request (added by auth guards if authenticated)
      const reqUser: RequestWithUser['user'] = getUserFromRequest(req);
      const userId: string | undefined = reqUser?.userId;
      const bodyWithEmail: { email?: string } | undefined = hasEmailProperty(req.body) ? req.body : undefined;
      const bodyEmail: string | undefined = bodyWithEmail?.email;
      const email: string | undefined = reqUser?.email || bodyEmail;

      // Safely extract path and method
      const reqPath = 'path' in req && typeof req.path === 'string' ? req.path : '';
      const reqMethod = 'method' in req && typeof req.method === 'string' ? req.method : 'GET';

      // Analyze request for threats
      const requestData: {
        ip: string;
        path: string;
        method: string;
        body?: unknown;
        query?: Record<string, unknown>;
        headers?: Record<string, string>;
        userId?: string;
        email?: string;
      } = {
        ip: ipAddress,
        path: reqPath,
        method: reqMethod,
      };

      if (req.body) requestData.body = req.body;
      if (req.query && Object.keys(req.query).length > 0) {
        const query: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(req.query)) {
          query[key] = value;
        }
        requestData.query = query;
      }
      if (req.headers && Object.keys(req.headers).length > 0) {
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') {
            headers[key] = value;
          } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
            headers[key] = value[0];
          }
        }
        requestData.headers = headers;
      }
      if (userId) requestData.userId = userId;
      if (email) requestData.email = email;

      const analysis: {
        threatDetected: boolean;
        threatType?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        action?: 'block_ip' | 'lock_account' | 'log_only';
      } = await this.threatDetection.analyzeRequest(requestData);

      // Handle threat detection
      if (analysis.threatDetected) {
        this.logger.warn(
          `Security threat detected: ${analysis.threatType} (${analysis.severity}) from IP ${ipAddress} on ${requestData.method} ${requestData.path}`
        );

        // Return appropriate error response
        const statusCode: number =
          analysis.action === 'block_ip' || analysis.action === 'lock_account'
            ? HttpStatus.FORBIDDEN
            : HttpStatus.BAD_REQUEST;

        const message: string = this.getThreatMessage(analysis.threatType || 'unknown');

        res.status(statusCode).json({
          statusCode,
          message,
          error: 'Security threat detected',
          timestamp: new Date().toISOString(),
        });

        return;
      }

      // No threat detected, continue
      next();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`Security middleware error: ${errorMessage}`);

      // On error, allow request to continue (fail open for availability)
      // But log the error for investigation
      next();
    }
  }

  /**
   * Get user-friendly threat message
   */
  private getThreatMessage(threatType: string | undefined): string {
    if (!threatType) {
      return 'Security threat detected. Access denied.';
    }
    const messages: Record<string, string> = {
      ip_blocked: 'Your IP address has been temporarily blocked due to suspicious activity. Please try again later.',
      account_locked:
        'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.',
      sql_injection: 'Invalid request detected. Please check your input and try again.',
      xss: 'Invalid request detected. Please check your input and try again.',
      command_injection: 'Invalid request detected. Please check your input and try again.',
      path_traversal: 'Invalid request detected. Please check your input and try again.',
      injection: 'Invalid request detected. Please check your input and try again.',
      distributed_attack: 'Suspicious activity detected. Your account has been temporarily locked.',
      default: 'Security threat detected. Access denied.',
    };

    const defaultMessage: string = messages.default ?? 'Security threat detected. Access denied.';
    if (threatType && threatType in messages) {
      const messageValue: unknown = messages[threatType];
      if (typeof messageValue === 'string') {
        return messageValue;
      }
    }
    return defaultMessage;
  }
}
