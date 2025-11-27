import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger as WinstonLogger } from 'winston';

export interface LogContext {
  adminId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  [key: string]: unknown;
}

/**
 * Structured Logger Service
 * Provides structured logging with context for admin operations
 */
@Injectable()
export class StructuredLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  /**
   * Log info message with context
   */
  log(message: string, context?: string | LogContext): void {
    if (typeof context === 'string') {
      this.logger.info(message, { context });
    } else if (context) {
      this.logger.info(message, context);
    } else {
      this.logger.info(message);
    }
  }

  /**
   * Log error message with context
   */
  error(message: string, trace?: string, context?: string | LogContext): void {
    if (typeof context === 'string') {
      this.logger.error(message, { context, trace });
    } else if (context) {
      this.logger.error(message, { ...context, trace });
    } else {
      this.logger.error(message, { trace });
    }
  }

  /**
   * Log warning message with context
   */
  warn(message: string, context?: string | LogContext): void {
    if (typeof context === 'string') {
      this.logger.warn(message, { context });
    } else if (context) {
      this.logger.warn(message, context);
    } else {
      this.logger.warn(message);
    }
  }

  /**
   * Log debug message with context
   */
  debug(message: string, context?: string | LogContext): void {
    if (typeof context === 'string') {
      this.logger.debug(message, { context });
    } else if (context) {
      this.logger.debug(message, context);
    } else {
      this.logger.debug(message);
    }
  }

  /**
   * Log verbose message with context
   */
  verbose(message: string, context?: string | LogContext): void {
    if (typeof context === 'string') {
      this.logger.verbose(message, { context });
    } else if (context) {
      this.logger.verbose(message, context);
    } else {
      this.logger.verbose(message);
    }
  }

  /**
   * Log admin activity with structured context
   */
  logAdminActivity(
    action: string,
    message: string,
    context: LogContext,
  ): void {
    this.logger.info(message, {
      type: 'admin_activity',
      action,
      ...context,
    });
  }

  /**
   * Log admin security event
   */
  logSecurityEvent(
    event: string,
    message: string,
    context: LogContext,
  ): void {
    this.logger.warn(message, {
      type: 'security_event',
      event,
      ...context,
    });
  }

  /**
   * Log admin error with full context
   */
  logAdminError(
    error: Error,
    message: string,
    context: LogContext,
  ): void {
    this.logger.error(message, {
      type: 'admin_error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    });
  }
}
