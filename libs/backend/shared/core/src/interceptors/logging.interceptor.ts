import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Logging Interceptor
 * Tracks all HTTP requests and responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logger.log(`${request.method} ${request.url} - ${duration}ms`);
        return data;
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`${request.method} ${request.url} - ${duration}ms - ${error.message}`);
        throw error;
      })
    );
  }
}
