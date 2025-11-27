import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { HttpNextFunction, HttpRequest, HttpResponse } from '@workix/backend/shared/core';
import { expressNextToHttpNext, expressRequestToHttpRequest, expressResponseToHttpResponse, isExpressNextFunction, isExpressRequest, isExpressResponse } from '@workix/backend/shared/core';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  try {
    Logger.log('Starting Admin Service bootstrap...');
    const startTime: number = Date.now();
    Logger.log('Creating NestFactory...');
    Logger.log('Before NestFactory.create - about to create AppModule...');
    Logger.log('About to call NestFactory.create...');
    const app: INestApplication = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    Logger.log('NestFactory.create completed!');
    const createTime: number = Date.now() - startTime;
    Logger.log(`✅ App created successfully in ${createTime}ms`);
    Logger.log('Continuing bootstrap after NestFactory.create...');

    // Wait for all modules to initialize
    Logger.log('Waiting for module initialization...');
    await new Promise(resolve => setTimeout(resolve, 100));
    Logger.log('Module initialization check complete');

    // Get config service
    Logger.log('Getting ConfigService...');
    const configService: ConfigService = app.get(ConfigService);
    Logger.log('ConfigService obtained');
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
        skipMissingProperties: false,
        stopAtFirstError: false,
      })
    );

    // Global exception filter
    app.useGlobalFilters({
      catch(exception: unknown, host: ArgumentsHost): void {
        const ctx: ReturnType<ArgumentsHost['switchToHttp']> = host.switchToHttp();
        const expressResponse: unknown = ctx.getResponse();
        const expressRequest: unknown = ctx.getRequest();
        if (!isExpressRequest(expressRequest) || !isExpressResponse(expressResponse)) {
          Logger.error('Invalid request or response type in exception filter');
          return;
        }
        const response: HttpResponse = expressResponseToHttpResponse(expressResponse);
        const request: HttpRequest = expressRequestToHttpRequest(expressRequest);

        const status: number = exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
        const message: string | object = exception instanceof HttpException
          ? exception.getResponse()
          : (exception instanceof Error ? exception.message : 'Internal server error');

        Logger.error(
          `Exception caught: ${request.method || 'UNKNOWN'} ${request.url || 'UNKNOWN'} - Status: ${status}`,
          exception instanceof Error ? exception.stack : String(exception)
        );

        const messageText: string = typeof message === 'string'
          ? message
          : (message && typeof message === 'object' && 'message' in message && typeof message.message === 'string')
            ? message.message
            : 'Internal server error';

        response.status(status).json({
          statusCode: status,
          message: messageText,
          timestamp: new Date().toISOString(),
          path: request.url || 'UNKNOWN',
        });
      },
    } as ExceptionFilter);

    // Security Headers Middleware
    app.use((req: unknown, res: unknown, next: unknown): void => {
      if (!isExpressRequest(req) || !isExpressResponse(res) || !isExpressNextFunction(next)) {
        return;
      }
      const httpRes: HttpResponse = expressResponseToHttpResponse(res);
      const httpNext: HttpNextFunction = expressNextToHttpNext(next);
      httpRes.setHeader('X-Frame-Options', 'DENY');
      httpRes.setHeader('X-Content-Type-Options', 'nosniff');
      httpRes.setHeader('X-XSS-Protection', '1; mode=block');
      httpRes.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      if (isProduction) {
        httpRes.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
      httpNext();
    });

    // CORS configuration
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Key'],
    });

    // Global prefix
    const globalPrefix = 'api-admin/v1';
    app.setGlobalPrefix(globalPrefix, {
      exclude: ['/docs', '/docs-json', '/docs-yaml', '/health'],
    });

    // Swagger documentation
    if (!isProduction) {
      try {
        const config: ReturnType<DocumentBuilder['build']> = new DocumentBuilder()
          .setTitle('Workix Admin Service')
          .setDescription(`Admin Microservice for Workix Platform

## Features
- Admin authentication and authorization
- Admin session management
- Two-factor authentication (2FA/TOTP)
- IP whitelist management
- Password reset flow
- Audit logging
- Service routing management
- Endpoint whitelist management`)
          .setVersion('1.0.0')
          .setContact('Workix Team', 'https://workix.io', 'support@workix.io')
          .setLicense('Proprietary', 'https://workix.io/license')
          .addServer(`http://localhost:${process.env.API_ADMIN_PORT || 7100}/${globalPrefix}`, 'Development server')
          .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT token obtained from /admin/auth/login endpoint',
            name: 'admin-jwt',
          }, 'admin-jwt')
          .addTag('admin-auth', 'Admin authentication endpoints')
          .addTag('admin-2fa', 'Two-factor authentication endpoints')
          .addTag('admin-sessions', 'Session management endpoints')
          .addTag('admin-routing', 'Service routing management')
          .addTag('admin-whitelist', 'Endpoint whitelist management')
          .build();

        const document = SwaggerModule.createDocument(app, config, {
          deepScanRoutes: true,
          ignoreGlobalPrefix: false,
          operationIdFactory: (controllerKey: string, methodKey: string): string => `${controllerKey}_${methodKey}`,
        });

        SwaggerModule.setup('docs', app, document, {
          swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            tryItOutEnabled: true,
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
          },
          customSiteTitle: 'Workix Admin API',
        });

        Logger.log('✅ Swagger setup completed successfully');
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        Logger.error(`❌ Swagger setup failed: ${errorMessage}`);
        Logger.warn('⚠️ Service will continue without Swagger documentation');
      }
    }

    Logger.log('Setting up port and host...');
    const port: string | number = process.env.API_ADMIN_PORT || 7100;
    const host: string = process.env.API_HOST || '0.0.0.0';
    Logger.log(`Port: ${port}, Host: ${host}`);

    Logger.log('Starting app.listen...');
    await app.listen(port, host);
    Logger.log('app.listen completed');

    Logger.log(`🚀 Admin Service running on: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
    Logger.log(`❤️ Health check: http://localhost:${port}/health`);
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    Logger.error('Failed to start Admin Service:', errorMessage);
    console.error('Bootstrap error:', error);
    throw error;
  }
}

bootstrap().catch((error: unknown): void => {
  const errorMessage: string = error instanceof Error ? error.message : String(error);
  Logger.error('Failed to start Admin Service:', errorMessage);
  process.exit(1);
});
