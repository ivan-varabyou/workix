import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  console.log('🚀 Starting Monolith API bootstrap...');
  console.log('📦 Creating NestFactory...');
  try {
    console.log('⏳ Calling NestFactory.create(AppModule)...');
    const app: INestApplication = await NestFactory.create(AppModule);
    console.log('✅ App created successfully');

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe());
    console.log('✅ Validation pipe configured');

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });
    console.log('✅ CORS enabled');

    // API prefix with service-specific versioning
    app.setGlobalPrefix('api-monolith/v1');
    console.log('✅ Global prefix set');

  // Swagger documentation
  const config: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Workix Monolith API')
    .setDescription(
      'AI-Powered Virtual Workers Platform\n\n' +
        'Complete API documentation for enabled modules:\n\n' +
        '🔐 Authentication:\n' +
        '  • Use separate auth microservice (api-auth on port 7200)\n' +
        '  • All endpoints require JWT Bearer token\n' +
        '  • Get tokens from auth microservice\n\n' +
        '✅ Enabled Modules:\n' +
        '  • 🛡️ RBAC - Role-based access control (roles, permissions, assignments)\n' +
        '  • 📋 Audit Logs - System audit logging and tracking\n' +
        '  • 🔔 Webhooks - Webhook management and delivery\n' +
        '  • 🔑 API Keys - API key generation and management\n' +
        '  • 🔄 Workflows - Workflow creation and execution\n' +
        '  • 🎨 Generation - AI services (Text, Image, Video, Speech, Embeddings, Translation)\n' +
        '  • 🔗 Integrations - Integration providers, credentials, and configs\n' +
        '  • 🤖 Workers - Virtual workers management and task assignment\n' +
        '  • 🧪 A/B Testing - A/B test creation and tracking\n' +
        '  • 📊 Analytics - Universal analytics endpoints\n' +
        '  • ❤️ Health - Health check and system information\n\n' +
        '⚠️ Note: Some modules are temporarily disabled (Pipelines, Executions, AuthClient)'
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token from auth microservice (api-auth on port 7200)',
      },
      'bearer'
    )
    .addTag('rbac', 'Role-based access control endpoints')
    .addTag('audit', 'Audit logs endpoints (admin only)')
    .addTag('webhooks', 'Webhook management endpoints')
    .addTag('api-keys', 'API key management endpoints')
    .addTag('workflows', 'Workflow management endpoints')
    .addTag(
      'generation',
      'AI Generation Services (Text, Image, Video, Speech, Embeddings, Translation)'
    )
    .addTag('integrations', 'Integration Management (Providers, Credentials, Configs)')
    .addTag('workers', 'Virtual Workers Management')
    .addTag('ab-tests', 'A/B Testing endpoints')
    .addTag('analytics', 'Universal Analytics endpoints')
    .addTag('health', 'Health check and system information')
    .build();

    const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    console.log('✅ Swagger configured');

  // Health check endpoint (with service-specific prefix)
  app.use(
    '/api-monolith/health',
    (
      _req: Record<string, never>,
      res: { json: (data: Record<string, string | number | boolean>) => void }
    ): void => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    }
  );

    const port: string | 7101 = process.env.PORT || 7101;
    console.log(`🚀 Starting server on port ${port}...`);
    await app.listen(port);
    console.log(`✅ Server started on port ${port}`);

    console.log(`
╔═══════════════════════════════════════════════╗
║        🚀 WORKIX MONOLITH API RUNNING 🚀      ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  API:        http://localhost:${port}/api-monolith/v1 ║
║  Docs:       http://localhost:${port}/docs ║
║  Health:     http://localhost:${port}/api-monolith/health ║
║                                               ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ Error during bootstrap:', error);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start Monolith API:', error);
  process.exit(1);
});
