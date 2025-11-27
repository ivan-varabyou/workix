/**
 * API Gateway
 * Consolidates and routes requests to all microservices
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { MicroserviceClientService } from './app/services/microservice-client.service';

async function bootstrap(): Promise<void> {
  const app: any = await NestFactory.create(AppModule);

  // Connect microservice clients (Kafka/Redis transport)
  // According to NestJS documentation: https://docs.nestjs.com/microservices/basics
  try {
    const microserviceClientService = app.get(MicroserviceClientService);
    await microserviceClientService.connect();
    Logger.log('✅ Microservice clients connected');
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : String(error);
    Logger.warn(`⚠️ Failed to connect microservice clients (will use HTTP fallback): ${errorMessage}`);
    // Continue startup - HTTP fallback will be used
  }

  // Set global prefix with versioning
  app.setGlobalPrefix('api/v1');

  // Swagger configuration - Consolidated documentation from all microservices
  const config = new DocumentBuilder()
    .setTitle('Workix API Gateway')
    .setDescription(
      `Workix - AI-Powered Virtual Workers Platform API Gateway

## Overview

Central entry point for all API requests. Routes to appropriate microservices, handles authentication, rate limiting, and observability.

## Services

### 🔐 Authentication Service (api-auth:7102)
- User registration and login
- JWT token management
- OAuth2 (Google, GitHub, Apple)
- 2FA/TOTP
- Phone OTP
- Email verification
- Password reset

### 👤 User Service (api-auth:7102)
- User profile management
- Avatar upload
- User search

### 📧 Notifications Service (api-notifications:7103)
- Push notification subscriptions
- Email notifications (via queue)
- Push notifications (via queue)

### 📦 Pipeline Service (api-pipelines:7104)
- Pipeline creation and management
- Pipeline execution
- Public pipelines

### ⚙️ Execution Service (api-pipelines:7104)
- Execution tracking
- Execution history
- Execution status

### 🛡️ RBAC Service (api-auth:7102)
- Role-based access control
- Permissions management
- User role assignment

### 🔔 Webhooks Service (api-webhooks:7105)
- Webhook creation and management
- Webhook event delivery
- Webhook retry logic

### 🔄 Workflows Service (api-workflows:7106)
- Workflow creation and management
- Workflow execution
- Workflow templates

### 🤖 Virtual Workers Service (api-workers:7107)
- Worker management
- Worker templates
- Worker execution

### 🧪 A/B Testing Service (api-ab-testing:7108)
- A/B test creation
- Test results
- Test analytics

### 📋 Audit Service (api-audit:7109)
- Audit log collection
- Compliance tracking
- Security auditing

### 🔗 Integrations Service (api-integrations:7110)
- YouTube, TikTok, Instagram
- Ozon, Wildberries, eBay
- GitHub, GitLab
- Slack, Telegram
- Jira, Salesforce
- AWS, Azure, GCP

### 🎨 Generation Service (api-generation:7111)
- Text generation
- Image generation
- Video generation
- Speech synthesis
- Embeddings
- Translation

### 📊 Analytics
- Analytics endpoints removed (were only stubs, not implemented)
- Will be added as separate microservice when needed

## API Structure

**Base URL**: \`http://localhost:7101/api/v1\`

All requests are routed to appropriate microservices based on path prefix:
- \`/api/v1/auth/*\` → Auth Service (7102)
- \`/api/v1/users/*\` → Auth Service (7102)
- \`/api/v1/subscriptions/*\` → Notifications Service (7103)
- \`/api/v1/pipelines/*\` → Pipeline Service (7104)
- \`/api/v1/executions/*\` → Pipeline Service (7104)
- \`/api/v1/rbac/*\` → Auth Service (7102)
- \`/api/v1/webhooks/*\` → Webhooks Service (7105)
- \`/api/v1/workflows/*\` → Workflows Service (7106)
- \`/api/v1/workers/*\` → Workers Service (7107)
- \`/api/v1/ab-tests/*\` → A/B Testing Service (7108)
- \`/api/v1/audit-logs/*\` → Audit Service (7109)
- \`/api/v1/integrations/*\` → Integrations Service (7110)
- \`/api/v1/generation/*\` → Generation Service (7111)
- Analytics endpoints removed (were only stubs)

## Authentication

Most endpoints require JWT authentication. Get tokens from:
- \`POST /api/v1/auth/login\` - Login with email/password
- \`POST /api/v1/auth/register\` - Register new user
- \`POST /api/v1/auth/refresh\` - Refresh access token

Include token in header: \`Authorization: Bearer {token}\`

## Rate Limiting

API Gateway implements rate limiting per application. Include:
- \`X-Application-Id\`: Application identifier
- \`X-API-Key\`: Optional API key for authentication`
    )
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token obtained from /api/v1/auth/login',
        in: 'header',
      },
      'JWT-auth'
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token for authenticated requests',
        in: 'header',
      },
      'jwt'
    );

  // Add servers - first server is default in Swagger UI
  // Use port 7101 according to specification (7vnn structure: v=1, nn=01)
  // In development: localhost:7101 first (specification port)
  // In production: api.workix.com first
  if (process.env.NODE_ENV === 'production') {
    // Production mode: remote server first
    config.addServer('https://api.workix.com', 'Production (Remote)');
    config.addServer('http://localhost:7101', 'Production (Local)');
  } else {
    // Development mode: localhost:7101 first (specification port)
    config.addServer('http://localhost:7101', 'Development (Local)');
    config.addServer('https://api.workix.com', 'Production (Remote)');
  }

  const swaggerConfig = config
    .addTag('🔐 Authentication', 'User authentication and authorization endpoints')
    .addTag('👤 User Profiles', 'User profile management endpoints')
    .addTag('📧 Notifications', 'Push notification subscription management')
    .addTag('📦 Pipelines', 'Pipeline creation and management')
    .addTag('⚙️ Executions', 'Pipeline execution tracking')
    .addTag('🛡️ RBAC', 'Role-based access control')
    .addTag('📊 Analytics', 'Universal analytics and metrics')
    .addTag('🔗 Integrations', 'Third-party integrations management')
    .addTag('🤖 Workers', 'Virtual workers management')
    .addTag('🧪 A/B Testing', 'A/B testing endpoints')
    .addTag('🎨 Generation', 'AI generation services (text, image, video, speech)')
    // Admin endpoints moved to api-admin microservice (port 7100)
    .build();
  const document: any = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [
      // Include all controllers except AppController (fallback proxy)
      // AppController is excluded via @ApiExcludeController()
    ],
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    ignoreGlobalPrefix: false, // Keep global prefix for proper path generation
  });

  // Fix wildcard route paths in Swagger: /api/v1/api/{path} → /api/v1/{path}
  // Also fix any double /api/ in paths
  if (document.paths) {
    const pathsToFix: Array<{ old: string; new: string }> = [];

    Object.keys(document.paths).forEach((path) => {
      let fixedPath = path;

      // Fix /api/v1/api/ → /api/v1/
      if (fixedPath.includes('/api/v1/api/')) {
        fixedPath = fixedPath.replace('/api/v1/api/', '/api/v1/');
      }

      // Fix any other double /api/ patterns
      fixedPath = fixedPath.replace(/\/api\/api\//g, '/api/');

      if (fixedPath !== path) {
        pathsToFix.push({ old: path, new: fixedPath });
      }
    });

    // Apply fixes
    pathsToFix.forEach(({ old, new: newPath }) => {
      if (document.paths[old]) {
        document.paths[newPath] = document.paths[old];
        delete document.paths[old];
      }
    });
  }
  // Determine default server based on environment
  // Use port 7101 according to specification (7vnn structure: v=1, nn=01)
  const isDevelopment: boolean = process.env.NODE_ENV !== 'production';
  const defaultServer: string = isDevelopment ? 'http://localhost:7101' : 'https://api.workix.com';

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      // Set default server based on environment
      url: defaultServer,
    },
    customSiteTitle: 'Workix API Gateway Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port: string | number = process.env.API_GATEWAY_PORT || process.env.API_PORT || process.env.PORT || 7101;
  const host: string = process.env.API_HOST || '0.0.0.0';
  await app.listen(port, host);
  Logger.log(`🚀 API Gateway listening on http://${host}:${port}/api/v1`);

  Logger.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    🚀 WORKIX API GATEWAY READY 🚀                         ║
╚════════════════════════════════════════════════════════════════════════════╝

📡 API Gateway:     http://localhost:${port}/api
📚 Swagger Docs:    http://localhost:${port}/docs

🔗 Services Status:
   ├─ 🏗️  All services migrated to microservices
   ├─ 🔐 Auth Service (port 7102) - Standalone option
   ├─ 📧 Notifications Service (port 7103) - Standalone option
   ├─ 📊 Universal Analytics & Integrations
   ├─ 🤖 Virtual Workers
   ├─ 🧪 A/B Testing
   └─ 🤖 MCP Server (stdio transport, no port)

⚙️  Environment: ${process.env.NODE_ENV || 'development'}
  `);
}

bootstrap().catch((error) => {
  Logger.error('Failed to start API Gateway:', error);
  process.exit(1);
});
