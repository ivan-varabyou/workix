import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { HttpRequest, HttpResponse } from '@workix/backend/shared/core';

/**
 * Global HTTP Exception Filter
 * Handles and formats all HTTP errors
 *
 * Note: Uses HttpRequest/HttpResponse abstractions for framework independence.
 * In apps, use adapters to convert Express/Fastify types to abstractions.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    // Use abstractions - apps should convert Express/Fastify types using adapters
    const response = ctx.getResponse<HttpResponse>();
    const request = ctx.getRequest<HttpRequest>();
    const status: number = exception.getStatus();
    const exceptionResponse: string | { message?: string } = exception.getResponse();

    const errorResponse: {
      statusCode: number;
      message: string;
      path?: string;
      method?: string;
      timestamp: string;
    } = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || 'Internal server error',
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(`HTTP ${status} Error: ${JSON.stringify(errorResponse)}`);
    }

    response.status(status).json(errorResponse);
  }
}
