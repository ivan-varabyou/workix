import { Injectable, Logger } from '@nestjs/common';

/**
 * Injection Detector Service
 * Detects SQL injection, XSS, command injection, and path traversal attempts
 */
@Injectable()
export class InjectionDetectorService {
  private readonly logger: Logger = new Logger(InjectionDetectorService.name);

  // SQL Injection patterns
  private readonly SQL_PATTERNS: RegExp[] = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bDROP\b.*\bDATABASE\b)/i,
    /(\bALTER\b.*\bTABLE\b)/i,
    /(\bCREATE\b.*\bTABLE\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(\bSP_\w+)/i, // SQL Server stored procedures
    /(['"`]).*(\bOR\b|\bAND\b).*(\d+\s*=\s*\d+)/i,
    /(['"`]).*(\bOR\b|\bAND\b).*(\d+\s*=\s*\d+)/i,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
    /(--|#|\/\*|\*\/)/, // SQL comments
    /(\bUNION\b.*\bALL\b.*\bSELECT\b)/i,
    /(\bCONCAT\b|\bGROUP_CONCAT\b)/i,
    /(\bINFORMATION_SCHEMA\b)/i,
    /(\bpg_catalog\b)/i, // PostgreSQL
    /(\bsys\b)/i, // Oracle
  ];

  // XSS patterns
  private readonly XSS_PATTERNS: RegExp[] = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, onload=, etc.
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /<style[^>]*>.*?<\/style>/gi,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i,
    /document\.cookie/i,
    /document\.write/i,
    /window\.location/i,
    /<img[^>]*onerror/i,
    /<svg[^>]*onload/i,
    /<body[^>]*onload/i,
  ];

  // Command injection patterns
  private readonly COMMAND_INJECTION_PATTERNS: RegExp[] = [
    /[;&|`$()]/g, // Basic command separators
    /\$\([^)]*\)/g, // Command substitution
    /\$\{[^}]*\}/g, // Variable substitution
    /\|\s*\w+/g, // Pipe commands
    /&&\s*\w+/g, // AND operator
    /\|\|\s*\w+/g, // OR operator
    /\bexec\s*\(/i,
    /\bsystem\s*\(/i,
    /\bshell_exec\s*\(/i,
    /\bpassthru\s*\(/i,
    /\bproc_open\s*\(/i,
    /\bpopen\s*\(/i,
    /\bpcntl_exec\s*\(/i,
    /\bcmd\s*\/c/i, // Windows cmd
    /\bbash\s+-c/i, // Bash
    /\bsh\s+-c/i, // Shell
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
    /\/proc\/self/i,
    /C:\\Windows\\System32/i,
  ];

  // Path traversal patterns
  private readonly PATH_TRAVERSAL_PATTERNS: RegExp[] = [
    /\.\.\//g, // ../
    /\.\.\\/g, // ..\
    /\.\.%2F/gi, // URL encoded ../
    /\.\.%5C/gi, // URL encoded ..\
    /%2E%2E%2F/gi, // Double URL encoded ../
    /%2E%2E%5C/gi, // Double URL encoded ..\
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
    /\/proc\/self/i,
    /\/var\/log/i,
    /\/root/i,
    /C:\\Windows/i,
    /C:\\System32/i,
    /\.\.\/\.\.\/\.\./g, // Multiple ../../
  ];

  /**
   * Detect all types of injections in request data
   */
  detectInjection(data: string | object | undefined): {
    detected: boolean;
    type?: 'sql' | 'xss' | 'command' | 'path_traversal';
    pattern?: string;
  } {
    if (!data) {
      return { detected: false };
    }

    // Convert object to string for pattern matching
    const dataString: string = typeof data === 'string' ? data : JSON.stringify(data);

    // Check SQL injection
    const sqlResult: ReturnType<typeof this.detectSqlInjection> = this.detectSqlInjection(dataString);
    if (sqlResult.detected) {
      return sqlResult;
    }

    // Check XSS
    const xssResult: ReturnType<typeof this.detectXss> = this.detectXss(dataString);
    if (xssResult.detected) {
      return xssResult;
    }

    // Check command injection
    const cmdResult: ReturnType<typeof this.detectCommandInjection> = this.detectCommandInjection(dataString);
    if (cmdResult.detected) {
      return cmdResult;
    }

    // Check path traversal
    const pathResult: ReturnType<typeof this.detectPathTraversal> = this.detectPathTraversal(dataString);
    if (pathResult.detected) {
      return pathResult;
    }

    return { detected: false };
  }

  /**
   * Detect SQL injection
   */
  detectSqlInjection(data: string): {
    detected: boolean;
    type?: 'sql';
    pattern?: string;
  } {
    for (const pattern of this.SQL_PATTERNS) {
      if (pattern.test(data)) {
        this.logger.warn(`SQL injection detected: ${pattern.source}`);
        return {
          detected: true,
          type: 'sql',
          pattern: pattern.source,
        };
      }
    }
    return { detected: false };
  }

  /**
   * Detect XSS
   */
  detectXss(data: string): {
    detected: boolean;
    type?: 'xss';
    pattern?: string;
  } {
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(data)) {
        this.logger.warn(`XSS detected: ${pattern.source}`);
        return {
          detected: true,
          type: 'xss',
          pattern: pattern.source,
        };
      }
    }
    return { detected: false };
  }

  /**
   * Detect command injection
   */
  detectCommandInjection(data: string): {
    detected: boolean;
    type?: 'command';
    pattern?: string;
  } {
    for (const pattern of this.COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(data)) {
        this.logger.warn(`Command injection detected: ${pattern.source}`);
        return {
          detected: true,
          type: 'command',
          pattern: pattern.source,
        };
      }
    }
    return { detected: false };
  }

  /**
   * Detect path traversal
   */
  detectPathTraversal(data: string): {
    detected: boolean;
    type?: 'path_traversal';
    pattern?: string;
  } {
    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(data)) {
        this.logger.warn(`Path traversal detected: ${pattern.source}`);
        return {
          detected: true,
          type: 'path_traversal',
          pattern: pattern.source,
        };
      }
    }
    return { detected: false };
  }

  /**
   * Sanitize data for logging (remove sensitive info)
   */
  sanitizeForLogging(data: string | object | undefined, maxLength: number = 500): string {
    if (!data) {
      return '';
    }

    const dataString: string = typeof data === 'string' ? data : JSON.stringify(data);

    // Remove potential passwords (common field names)
    let sanitized: string = dataString.replace(/(password|pwd|passwd|secret|token|key)\s*[:=]\s*["']?[^"'\s]+["']?/gi, '$1: ***');

    // Truncate if too long
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }

    return sanitized;
  }
}
