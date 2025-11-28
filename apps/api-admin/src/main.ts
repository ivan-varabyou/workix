import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthConfigService } from '@workix/domain/auth';
import type { HttpNextFunction, HttpRequest, HttpResponse } from '@workix/shared/backend/core';
import { expressNextToHttpNext, expressRequestToHttpRequest, expressResponseToHttpResponse, isExpressNextFunction, isExpressRequest, isExpressResponse } from '@workix/shared/backend/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  try {
    console.log('🔍 DEBUG: bootstrap() started');
    Logger.log('Starting bootstrap...');
    console.log('🔍 DEBUG: After first log');
    Logger.log('Creating NestFactory...');
    console.log('🔍 DEBUG: Before NestFactory.create');
    const startTime: number = Date.now();
    let app: INestApplication;
    try {
      console.log('🔍 DEBUG: Calling NestFactory.create()...');
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      });
      console.log('🔍 DEBUG: NestFactory.create() completed successfully');
    } catch (createError: unknown) {
      const errorMessage: string = createError instanceof Error ? createError.message : String(createError);
      const errorStack: string = createError instanceof Error ? createError.stack || '' : '';
      console.error('🔍 DEBUG: NestFactory.create() FAILED:', errorMessage);
      console.error('🔍 DEBUG: Error stack:', errorStack);
      Logger.error('NestFactory.create() failed:', errorMessage);
      throw createError;
    }
    const createTime: number = Date.now() - startTime;
    Logger.log(`✅ App created successfully in ${createTime}ms`);
    console.log('🔍 DEBUG: After logging create time');
    Logger.log('✅ All modules initialized, continuing bootstrap...');
    console.log('🔍 DEBUG: After logging modules initialized');

    // Add explicit check that app is initialized
    if (!app) {
      throw new Error('App is not initialized');
    }

    Logger.log('🔍 STEP 1: App initialized, starting middleware setup...');
    Logger.log('Setting up middleware...');

    // Get config service
    const configService: ConfigService = app.get(ConfigService);
    const authConfig: AuthConfigService = new AuthConfigService(configService);
    const isProduction: boolean = authConfig.isProduction();

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        skipMissingProperties: false, // Validate all properties, even if optional
        stopAtFirstError: false, // Show all validation errors
      })
    );

    // Global exception filter for better error logging
    app.useGlobalFilters({
      catch(exception: unknown, host: ArgumentsHost): void {
        const ctx: ReturnType<ArgumentsHost['switchToHttp']> = host.switchToHttp();
        // Convert framework-specific types to abstractions
        // getResponse/getRequest return Express types, but we convert to abstractions immediately
        const expressResponse: unknown = ctx.getResponse();
        const expressRequest: unknown = ctx.getRequest();
        // Use type guards to safely convert
        if (!isExpressRequest(expressRequest) || !isExpressResponse(expressResponse)) {
          Logger.error('Invalid request or response type in exception filter');
          return;
        }
        const response: HttpResponse = expressResponseToHttpResponse(expressResponse);
        const request: HttpRequest = expressRequestToHttpRequest(expressRequest);

        // Handle Passport authentication errors
        if (exception && typeof exception === 'object' && 'status' in exception) {
          const passportStatus: unknown = exception.status;
          if (typeof passportStatus === 'number' && (passportStatus === 401 || passportStatus === 403)) {
            const status: number = passportStatus;
            const sanitizedMessage: string = 'OAuth authentication failed';
            response.status(status).json({
              statusCode: status,
              message: sanitizedMessage,
              timestamp: new Date().toISOString(),
              path: request.url || 'UNKNOWN',
            });
            return;
          }
        }

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

        // Sanitize error message - don't expose internal details
        let sanitizedMessage: string = messageText;

        // Remove internal error details (especially in production)
        if (isProduction) {
          // In production, don't expose stack traces or internal paths
          sanitizedMessage = sanitizedMessage
            .replace(/at\s+.*/g, '')
            .replace(/Error:\s*/g, '')
            .replace(/\/etc\/passwd/g, '')
            .replace(/\.\.\//g, '')
            .replace(/\.\.\\/g, '')
            .replace(/Prisma/g, 'Database')
            .replace(/SQL/g, 'Database')
            .replace(/database/g, 'system')
            .trim();

          // If message is empty or contains only technical details, use generic message
          if (!sanitizedMessage || sanitizedMessage.length < 3) {
            sanitizedMessage = status === 500
              ? 'Internal server error'
              : messageText;
          }
        } else {
          // In development, still sanitize paths but keep more details
          sanitizedMessage = sanitizedMessage
            .replace(/\/etc\/passwd/gi, '')
            .replace(/\.\.\//g, '')
            .replace(/\.\.\\/g, '')
            .replace(/\.\.\./g, '')
            .replace(/\.\./g, '');
        }

        // Always sanitize message to remove path traversal patterns (both dev and prod)
        sanitizedMessage = sanitizedMessage
          .replace(/\.\.\//g, '')
          .replace(/\.\.\\/g, '')
          .replace(/\.\.\./g, '')
          .replace(/\.\./g, '');

        // Sanitize path to prevent information disclosure
        let sanitizedPath: string = request.url || 'UNKNOWN';
        // Remove all dangerous patterns
        sanitizedPath = sanitizedPath
          .replace(/\/etc\/passwd/gi, '')
          .replace(/\.\.\//g, '')
          .replace(/\.\.\\/g, '')
          .replace(/\.\.%2f/gi, '')
          .replace(/\.\.%5c/gi, '')
          .replace(/%2e%2e/gi, '')
          .replace(/\.\.\./g, '')
          .replace(/\.\./g, '');

        // If path contains dangerous patterns, use generic path
        if (/etc|passwd|\.\.|%2e|%5c|%2f/i.test(sanitizedPath)) {
          sanitizedPath = '/api-admin/v1';
        }

        // Also sanitize message to remove path traversal patterns
        sanitizedMessage = sanitizedMessage
          .replace(/\.\.\//g, '')
          .replace(/\.\.\\/g, '')
          .replace(/\.\.\./g, '')
          .replace(/\.\./g, '');

        response.status(status).json({
          statusCode: status,
          message: sanitizedMessage,
          timestamp: new Date().toISOString(),
          path: sanitizedPath,
        });
      },
    } as ExceptionFilter);

    // Security Headers Middleware
    // Note: In production, these should be set at reverse proxy level (nginx)
    app.use((req: unknown, res: unknown, next: unknown): void => {
      // Convert framework-specific types to abstractions
      // req/res/next are unknown to avoid dependency on Express types
      // Use type guards to safely convert
      if (!isExpressRequest(req) || !isExpressResponse(res) || !isExpressNextFunction(next)) {
        return;
      }
      // Converted but not used in this method - kept for future use
      void expressRequestToHttpRequest(req);
      const httpRes: HttpResponse = expressResponseToHttpResponse(res);
      const httpNext: HttpNextFunction = expressNextToHttpNext(next);
      // Prevent clickjacking
      httpRes.setHeader('X-Frame-Options', 'DENY');
      // Prevent MIME type sniffing
      httpRes.setHeader('X-Content-Type-Options', 'nosniff');
      // Enable XSS protection
      httpRes.setHeader('X-XSS-Protection', '1; mode=block');
      // Referrer Policy
      httpRes.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      // HSTS (only in production with HTTPS)
      if (isProduction) {
        httpRes.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
      httpNext();
    });
    Logger.log('✅ Security headers enabled');

    // CORS configuration
    const corsOrigin: string | string[] | undefined = authConfig.getCorsOrigin();
    if (corsOrigin) {
      // Convert array to function for proper origin validation
      const allowedOrigins: string[] = Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin];

      app.enableCors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
          // Allow requests with no origin (mobile apps, Postman, etc.)
          if (!origin) {
            callback(null, true);
            return;
          }

          // Check if origin is in allowed list
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            // Reject origin not in whitelist
            callback(null, false);
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Key'],
      });
      Logger.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
    } else {
      Logger.warn('⚠️ CORS disabled - no origins configured');
    }

    // Global prefix with service-specific versioning (before Swagger setup)
    Logger.log('🔍 STEP 2: Setting global prefix...');
    const globalPrefix = 'api-admin/v1';
    app.setGlobalPrefix(globalPrefix, {
      exclude: ['/docs', '/docs-json', '/docs-yaml'],
    });
    Logger.log(`✅ Global prefix set to: ${globalPrefix}`);

    // Swagger documentation - only in development (setup after global prefix)
    Logger.log(`🔍 STEP 3: Checking production mode (isProduction: ${isProduction})...`);
    if (!isProduction) {
      Logger.log('🔍 STEP 4: Setting up Swagger...');

      try {
        const config: ReturnType<DocumentBuilder['build']> = new DocumentBuilder()
          .setTitle('Workix Admin Service')
          .setDescription(`Admin Management Microservice for Workix Platform

## Features
- Admin registration and authentication
- JWT token management (access & refresh tokens)
- Password reset flow
- Two-factor authentication (2FA/TOTP)
- Security code verification for suspicious activity
- OAuth2 integration (Google, GitHub, Apple)
- Email verification
- Phone OTP authentication
- Admin profile management

## Security Features
- Injection attack detection (SQL, XSS, Command, Path Traversal)
- IP blocking for suspicious activity
- Account security tracking (brute force, distributed attacks)
- Security code verification for new locations/devices
- Rate limiting
- Password strength validation`)
          .setVersion('1.0.0')
          .setContact('Workix Team', 'https://workix.io', 'support@workix.io')
          .setLicense('Proprietary', 'https://workix.io/license')
          .addServer(`http://localhost:${process.env.API_ADMIN_PORT || 7100}/${globalPrefix}`, 'Development server')
          .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT token obtained from /auth/login endpoint',
          })
          .addTag('authentication', 'Core authentication endpoints (register, login, tokens)')
          .addTag('authentication-security', 'Security code verification endpoints')
          .addTag('users', 'User profile management endpoints')
          .addTag('phone-otp', 'Phone OTP authentication endpoints')
          .addTag('oauth2', 'OAuth2 social login endpoints')
          .build();

        Logger.log('🔍 Creating Swagger document with full descriptions...');

        // Create document with full options - include descriptions and DTO schemas
        const document = SwaggerModule.createDocument(app, config, {
          deepScanRoutes: true, // Enable deep scanning to find all routes and descriptions
          ignoreGlobalPrefix: true,
          operationIdFactory: (controllerKey: string, methodKey: string): string => `${controllerKey}_${methodKey}`,
          // extraModels will be automatically discovered from @ApiExtraModels decorators
        });

        Logger.log(`📊 Swagger document created successfully`);
        Logger.log(`📊 Document paths count: ${Object.keys(document.paths || {}).length}`);

        SwaggerModule.setup('docs', app, document, {
          swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            tryItOutEnabled: true,
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            docExpansion: 'full', // 'none', 'list', or 'full' - use 'full' to show descriptions by default
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
          },
          customSiteTitle: 'Workix Admin API',
          customCss: `
            .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #49cc90; }
            .swagger-ui .opblock .opblock-summary-description {
              font-weight: normal;
              color: #3b4151;
              display: block !important;
              margin-top: 5px;
            }
            .swagger-ui .opblock-description-wrapper {
              margin: 0 0 20px 0;
              display: block !important;
            }
            .swagger-ui .opblock-description {
              display: block !important;
              visibility: visible !important;
            }
            .swagger-ui .opblock .opblock-section { display: block !important; }
          `,
        });

        Logger.log('✅ Swagger setup completed successfully');
        Logger.log(`🌐 Swagger UI available at: http://localhost:${process.env.API_ADMIN_PORT || 7100}/docs`);
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        const errorStack: string = error instanceof Error ? error.stack || '' : '';

        Logger.error(`❌ Swagger setup failed: ${errorMessage}`);
        if (errorStack) {
          Logger.error(`Error stack: ${errorStack}`);
        }
        Logger.warn('⚠️ Swagger disabled due to DTO circular dependencies');
        Logger.warn('⚠️ Service will continue without Swagger documentation');
        // Continue service startup even if Swagger fails
      }
    } else {
      Logger.warn(`🔒 Swagger disabled - NODE_ENV=${process.env.NODE_ENV || 'not set'}`);
      Logger.warn('⚠️ To enable Swagger, set NODE_ENV=development');
    }

    Logger.log('🔍 STEP 5: Preparing to start server...');
    const port: string | number = process.env.API_ADMIN_PORT || 7100;
    const host: string = process.env.API_HOST || '0.0.0.0';

    // Connect microservice with Redis transport for inter-service communication
    // According to NestJS documentation: https://docs.nestjs.com/microservices/basics
    const redisHost: string = process.env.REDIS_HOST || 'localhost';
    const redisPort: number = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 5900;
    const redisPassword: string | undefined = process.env.REDIS_PASSWORD;

    Logger.log(`🔌 Connecting microservice with Redis transport (${redisHost}:${redisPort})...`);
    const microserviceOptions: MicroserviceOptions = {
      transport: Transport.REDIS,
      options: {
        host: redisHost,
        port: redisPort,
        ...(redisPassword ? { password: redisPassword } : {}),
      },
    };

    app.connectMicroservice<MicroserviceOptions>(microserviceOptions);
    Logger.log('✅ Microservice connected with Redis transport');

    // Start all microservices first, then HTTP server
    Logger.log('Starting microservices...');
    await app.startAllMicroservices();
    Logger.log('✅ All microservices started');

    Logger.log(`🔍 STEP 6: Starting HTTP server on ${host}:${port}...`);
    Logger.log('🔍 STEP 7: Calling app.listen()...');
    try {
      await app.listen(port, host);
      Logger.log('✅ app.listen() completed successfully');
    } catch (listenError: unknown) {
      const errorMessage: string = listenError instanceof Error ? listenError.message : String(listenError);
      Logger.error(`❌ app.listen() failed: ${errorMessage}`);
      throw listenError;
    }

    Logger.log(`🚀 Admin Service running on: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
    Logger.log(`❤️ Health check: http://localhost:${port}/${globalPrefix}/health`);
    Logger.log(`🔌 Microservice (Redis): ${redisHost}:${redisPort}`);
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    Logger.error('Failed to start Auth Service:', errorMessage);
    console.error('Bootstrap error:', error);
    throw error;
  }
}

bootstrap().catch((error: unknown): void => {
  const errorMessage: string = error instanceof Error ? error.message : String(error);
  Logger.error('Failed to start Auth Service:', errorMessage);
  process.exit(1);
});
