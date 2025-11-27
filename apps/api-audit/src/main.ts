import { ArgumentsHost, HttpException, HttpStatus, INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { HttpRequest, HttpResponse } from '@workix/backend/shared/core';
import { expressRequestToHttpRequest, expressResponseToHttpResponse, isExpressRequest, isExpressResponse } from '@workix/backend/shared/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  try {
    Logger.log('Starting Audit Service bootstrap...');
    const startTime: number = Date.now();
    const app: INestApplication = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const createTime: number = Date.now() - startTime;
    Logger.log(`✅ Audit Service created successfully in ${createTime}ms`);

    // Get config service
    const configService: ConfigService = app.get(ConfigService);
    const isProduction: boolean = configService.get<string>('NODE_ENV') === 'production';

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Global exception filter
    app.useGlobalFilters({
      catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response: HttpResponse | undefined = isExpressResponse(ctx.getResponse())
          ? expressResponseToHttpResponse(ctx.getResponse())
          : ctx.getResponse();
        const request: HttpRequest | undefined = isExpressRequest(ctx.getRequest())
          ? expressRequestToHttpRequest(ctx.getRequest())
          : ctx.getRequest();

        const status: number = exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

        const message: string = exception instanceof HttpException
          ? exception.message
          : exception instanceof Error
            ? exception.message
            : 'Internal server error';

        Logger.error(
          `Exception: ${message}`,
          exception instanceof Error ? exception.stack : String(exception),
          'ExceptionFilter'
        );

        if (response && response.status) {
          response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request?.url || 'unknown',
            message,
          });
        }
      },
    });

    // CORS
    app.enableCors({
      origin: isProduction ? configService.get<string>('CORS_ORIGIN') : '*',
      credentials: true,
    });

    // Swagger
    if (!isProduction) {
      const config = new DocumentBuilder()
        .setTitle('Audit Service API')
        .setDescription('API for managing audit logs and compliance tracking')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
    }

    const port: number = configService.get<number>('PORT') || 7109;
    await app.listen(port);
    Logger.log(`✅ Audit Service is running on: http://localhost:${port}`);
    if (!isProduction) {
      Logger.log(`📚 Swagger UI: http://localhost:${port}/docs`);
    }
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    Logger.error(`Failed to start Audit Service: ${errorMessage}`, error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

bootstrap();

