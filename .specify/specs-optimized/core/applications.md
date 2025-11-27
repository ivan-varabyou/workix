# Applications Structure

**Version**: 3.0

## Overview

Applications connect libraries. No business logic in apps.

## Critical Rule

**🔴 CRITICAL: apps/ - ONLY connection from libs!**
**❌ NEVER business logic in apps!**
**✅ apps/ - ONLY controllers, modules, main.ts**

## Backend Applications

### api-monolith (Port 7101)

Monolithic API with all services.

**Purpose**: Phase 1 - all services in single application

**Modules**:
- PipelinesModule (uses `@workix/domain/pipelines`)
- ExecutionsModule
- RbacModule (uses `@workix/domain/rbac`)
- AuditLogsModule
- WebhooksModule (uses `@workix/domain/webhooks`)
- ApiKeysModule (uses `@workix/infrastructure/api-keys`)
- WorkflowsModule (uses `@workix/domain/workflows`)
- BatchProcessingModule (uses `@workix/utilities/batch-processing`)
- WorkersModule (uses `@workix/domain/workers`)
- AICoreModule (uses `@workix/ai/ai-core`)
- GenerationModule (uses `@workix/ai/generation`)
- IntegrationCoreModule (uses `@workix/integrations/core`)
- IntegrationsModule
- ABTestingModule (uses `@workix/utilities/ab-testing`)

**Database**: Prisma schema in `apps/api-monolith/prisma/schema.prisma`
- **Database Port**: `5101` (API 7101 → DB 5101, правило: 7→5)
- **Database Name**: `workix_monolith`
- **Connection**: `postgresql://postgres:postgres@localhost:5101/workix_monolith`

**Swagger**: `http://localhost:7101/docs`

### api-gateway (Port 7000)

API Gateway for request routing.

**Purpose**: Route requests to backend services

**Database**: Prisma schema in `apps/api-gateway/prisma/schema.prisma`
- **Database Port**: `5000` (API 7000 → DB 5000, правило: 7→5)
- **Database Name**: `workix_gateway`
- **Connection**: `postgresql://postgres:postgres@localhost:5000/workix_gateway`
- **Stores**: Service configuration, health status, whitelist, API keys, admin auth

**Routing**:
- `/api/v1/auth/*` → Auth service (port 7102)
- `/api/v1/users/*` → Auth service (port 7102)
- `/api/v1/pipelines/*` → Monolith API (port 7101)
- `/api/v1/*` → Monolith API (port 7101)

**Features**:
- Request routing
- Authentication & authorization
- Rate limiting
- Health checks
- Request/response logging
- CORS configuration
- Service configuration management
- Admin authentication (separate from api-auth)

**Swagger**: `http://localhost:7000/docs`

### api-auth (Port 7102)

Authentication microservice.

**Purpose**: Separate auth service

**Database**: Prisma schema in `apps/api-auth/prisma/schema.prisma`
- **Database Port**: `5102` (API 7102 → DB 5102, правило: 7→5)
- **Database Name**: `workix_auth`
- **Connection**: `postgresql://postgres:postgres@localhost:5102/workix_auth`

**Modules**:
- Uses `@workix/domain/auth` for all business logic
- Controllers: AuthController, OAuth2Controller, PhoneOtpController, EmailVerificationController

**Features**:
- Basic auth (register, login, password reset)
- 2FA (TOTP)
- OAuth2 (Google, GitHub, Apple)
- Phone OTP
- Email verification

**Swagger**: `http://localhost:7102/docs`

### api-notifications (Port 7103)

Notifications microservice (worker service).

**Purpose**: Process email notifications from Redis queue asynchronously

**Modules**:
- Uses `@workix/domain/notifications` for email processing
- Uses `@workix/infrastructure/message-broker` for Redis queue
- Uses `@workix/infrastructure/notifications` for email sending

**Features**:
- Processes email notification events from Redis queue
- Email verification emails
- Password reset emails
- Security code emails
- Retry mechanism for failed sends
- Async processing (non-blocking)

**Database**: Prisma schema in `apps/api-notifications/prisma/schema.prisma` (if needed for notification history/statistics)
- **Database Port**: `5103` (API 7103 → DB 5103, правило: 7→5)
- **Database Name**: `workix_notifications`
- **Connection**: `postgresql://postgres:postgres@localhost:5103/workix_notifications`

**Queue**: `notifications:email` (Redis/Bull)

**Swagger**: `http://localhost:7103/docs`

**Note**: This is a worker service (ApplicationContext), not HTTP server

## Frontend Applications

### app-admin (Port 7300)

Administrative dashboard.

**Purpose**: Admin interface for platform management

**Technologies**:
- Angular 20+
- PrimeNG
- Zoneless (Signals)
- Shared UI components (`@workix/shared/frontend/ui`)

**Features**:
- User management
- Pipeline administration
- System configuration
- Analytics & monitoring
- RBAC management

### app-web (Port 7301)

Client-facing web application.

**Purpose**: Client interface for creating and running workflows

**Technologies**:
- Angular 20+
- PrimeNG
- Zoneless (Signals)
- Shared UI components (`@workix/shared/frontend/ui`)

**Features**:
- Visual pipeline editor
- Workflow execution
- Dashboard & monitoring
- User profile management
- Integration management

## Utility Applications

### mcp-server

MCP Server for AI agent integration.

**Purpose**: Model Context Protocol server for AI agents

**Structure**:
- `tools/`: MCP tools (API methods)
  - auth.tools.ts
  - users.tools.ts
  - pipelines.tools.ts
  - health.tools.ts
  - project.tools.ts
- `resources/`: MCP resources (documentation)
  - api-reference.resource.ts
  - architecture.resource.ts
  - schema.resource.ts
  - development-rules.resource.ts
  - libs-structure.resource.ts
  - apps-structure.resource.ts

**Transport**: stdio

## Port Configuration

| Application | Port | Purpose |
|------------|------|---------|
| api-monolith | 7000 | Monolithic API |
| api-gateway | 7100 | API Gateway |
| api-auth | 7200 | Auth service |
| api-notifications | 7201 | Notifications service (worker) |
| app-admin | 7300 | Admin frontend |
| app-web | 7301 | Web frontend |

## Rules

1. **Apps only connect libs**
2. **No business logic in apps**
3. **Controllers only call libs services**
4. **Modules only import libs**
5. **main.ts only configures app**

## Related

- [Architecture](./architecture.md)
- [Libraries](./libraries.md)
- [Development Process](./development.md)
