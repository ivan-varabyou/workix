import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base Application Exception
 * Extends HttpException with custom error handling
 */
export class AppException extends HttpException {
  public readonly code: string;
  constructor(
    code: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public details?: Record<string, any>
  ) {
    super(
      {
        code,
        message,
        details,
      },
      statusCode
    );
    this.code = code;
  }
}

/**
 * Resource Not Found Exception
 */
export class ResourceNotFoundException extends AppException {
  constructor(resource: string, id: string) {
    super('RESOURCE_NOT_FOUND', `${resource} with ID "${id}" not found`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Validation Error Exception
 */
export class ValidationErrorException extends AppException {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * Unauthorized Exception
 */
export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized access') {
    super('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }
}
