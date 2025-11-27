import { Logger } from '@nestjs/common';

export type LogEventDataValue =
  | string
  | number
  | boolean
  | Date
  | null
  | string[];

export type LogEventData =
  | LogEventDataValue
  | Record<string, LogEventDataValue | LogEventDataValue[] | Record<string, LogEventDataValue>>;

/**
 * Custom Logger Utility
 * Provides structured logging
 */
export class AppLogger extends Logger {
  constructor(context?: string) {
    super(context || 'AppLogger');
  }

  /**
   * Log metric
   */
  logMetric(metric: string, value: number, unit = ''): void {
    this.log(`METRIC: ${metric}=${value}${unit}`);
  }

  /**
   * Log performance
   */
  logPerformance(operation: string, durationMs: number): void {
    this.log(`PERF: ${operation} took ${durationMs}ms`);
  }

  /**
   * Log event
   */
  logEvent(event: string, data?: LogEventData): void {
    this.log(`EVENT: ${event}${data ? ` - ${JSON.stringify(data)}` : ''}`);
  }

  /**
   * Log trace
   */
  logTrace(message: string, trace?: string): void {
    if (trace) {
      this.debug(`TRACE: ${message}\n${trace}`);
    } else {
      this.debug(`TRACE: ${message}`);
    }
  }
}

/**
 * Create logger for a class
 */
export function createLogger(className: string): AppLogger {
  return new AppLogger(className);
}
