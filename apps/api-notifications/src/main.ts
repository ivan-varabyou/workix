import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

/**
 * Notifications Microservice
 * Hybrid service: Worker for processing events + HTTP API for subscription management
 */
async function bootstrap(): Promise<void> {
  const logger: Logger = new Logger('NotificationsService');

  try {
    logger.log('🚀 Starting Notifications Microservice...');

    // Create HTTP application (not just context)
    const app: INestApplication = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    const configService: ConfigService = app.get<ConfigService>(ConfigService);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    // Global prefix
    app.setGlobalPrefix('api-notifications/v1', {
      exclude: ['/docs', '/docs-json', '/docs-yaml', '/health'],
    });

    // CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Swagger documentation
    const isProduction: boolean = configService.get<string>('NODE_ENV') === 'production';
    if (!isProduction) {
      try {
        const config = new DocumentBuilder()
          .setTitle('Workix Notifications Service')
          .setDescription(`Notifications Microservice for Workix Platform

## Features
- Email notifications (verification, password reset, security codes)
- Push notifications (Web Push API)
- Push subscription management API
- Asynchronous event processing via Redis queue

## Architecture
- **Worker**: Processes notification events from Redis queues
- **HTTP API**: Manages push notification subscriptions`)
          .setVersion('1.0')
          .addBearerAuth()
          .addTag('push-subscriptions', 'Push notification subscription management')
          .build();

        const document = SwaggerModule.createDocument(app, config, {
          extraModels: [],
        });
        SwaggerModule.setup('docs', app, document, {
          swaggerOptions: {
            persistAuthorization: true,
          },
        });

        logger.log('✅ Swagger documentation available at /docs');
      } catch (swaggerError: unknown) {
        const errorMessage: string = swaggerError instanceof Error ? swaggerError.message : String(swaggerError);
        logger.warn(`⚠️ Swagger setup failed: ${errorMessage}`);
        logger.warn('⚠️ Continuing without Swagger documentation');
      }
    }

    // Start HTTP server
    const port: number = configService.get<number>('API_NOTIFICATIONS_PORT') || 7103;
    await app.listen(port);

    logger.log(`✅ Notifications Microservice started successfully`);
    logger.log(`🌐 HTTP server listening on port ${port}`);
    logger.log(`📧 Listening for email events on queue: notifications:email`);
    logger.log(`📱 Listening for push events on queue: notifications:push`);
    logger.log(`🔗 Redis: ${configService.get<string>('REDIS_HOST') || 'localhost'}:${configService.get<number>('REDIS_PORT') || 6379}`);

    const vapidPublicKey: string | undefined = configService.get<string>('VAPID_PUBLIC_KEY');
    if (vapidPublicKey) {
      logger.log(`✅ Push notifications enabled (VAPID configured)`);
    } else {
      logger.warn(`⚠️ Push notifications disabled (VAPID keys not configured)`);
    }

    if (!isProduction) {
      logger.log(`📚 Swagger UI: http://localhost:${port}/docs`);
    }

    // Graceful shutdown
    process.on('SIGTERM', async (): Promise<void> => {
      logger.log('SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async (): Promise<void> => {
      logger.log('SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to start Notifications Microservice: ${errorMessage}`);
    if (error instanceof Error && error.stack) {
      logger.error(error.stack);
    }
    process.exit(1);
  }
}

bootstrap();
