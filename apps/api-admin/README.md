# Workix Admin Service

Enterprise-grade admin management microservice for Workix platform.

## Overview

Admin authentication and authorization service built on NestJS. Provides complete admin management including registration, login, 2FA, OAuth2, password reset, and more.

## Key Features

- Modular architecture - all business logic in `libs/domain/auth`
- Multiple auth methods - basic, 2FA, OAuth2, Phone OTP
- High security - OWASP Top 10 compliant
- Feature flags - enable/disable auth methods
- Full test coverage - unit, integration, security tests
- Swagger docs - auto-generated API documentation
- Rate limiting - brute force protection
- Audit logging - all operations logged

## Quick Start

### Development Mode (with database)

```bash
# From project root - uses nx serve api-admin
npm run api:auth:dev

# Basic nx serve (requires DB and env vars to be set)
npm run api:auth

# Or using script
npm run api:auth:start-script
npm run api:auth:start-script:prod
```

### Production Mode

```bash
# From project root
npm run api:auth:prod

# Or step by step:
docker-compose up -d postgres-auth
npm run api:auth:build
npm run api:auth:start
```

### Manual Setup

```bash
# Install dependencies
npm install

# Setup environment
cp env.example .env

# Start database
docker-compose up -d postgres-auth

# Generate Prisma Client
cd apps/api-admin
npx prisma generate --schema=./prisma/schema.prisma

# Apply schema (dev) or migrations (prod)
npx prisma db push --skip-generate --schema=./prisma/schema.prisma  # dev
npx prisma migrate deploy --schema=./prisma/schema.prisma  # prod

# Start service
npm run dev  # development mode
npm run start  # production mode (from dist)
```

## Port

- **Port**: `7100` (структура: 7vnn, где v=1, nn=00)
- **Database Port**: `5100` (API 7100 → DB 5100, правило: 7→5)
- **Database Name**: `workix_admin`
- **Connection**: `postgresql://postgres:postgres@localhost:5100/workix_admin`
- **Swagger**: `http://localhost:7100/docs`

## Architecture

- Business logic: `libs/backend/domain/admin` (будет добавлено)
- Controllers: `apps/api-admin/src/auth/controllers/`
- Database: Prisma with PostgreSQL

## Documentation

### Спецификации и планы (в `.specs/`):

- **[ADMIN_API_PLAN.md](.specs/ADMIN_API_PLAN.md)** - План функциональности (спецификация)
- **[ADMIN_API_SECURITY.md](.specs/ADMIN_API_SECURITY.md)** - Кейсы безопасности
- **[IMPLEMENTATION_PLAN.md](.specs/IMPLEMENTATION_PLAN.md)** - План внедрения
- **[SPECKIT_WORKFLOW.md](.specs/SPECKIT_WORKFLOW.md)** - Инструкция по командам speckit
- **[COMMANDS_ORDER.md](.specs/COMMANDS_ORDER.md)** - Краткая справка по порядку команд
- **[ANALYSIS_REPORT.md](.specs/ANALYSIS_REPORT.md)** - Анализ согласованности

### Общая документация проекта:

- **Project Specifications**: [.specify/specs-optimized/index.md](../../.specify/specs-optimized/index.md)
- **Architecture**: [.specify/specs-optimized/core/architecture.md](../../.specify/specs-optimized/core/architecture.md)
- **Development**: [.specify/specs-optimized/core/development.md](../../.specify/specs-optimized/core/development.md)

## Testing

```bash
# Run tests
nx test api-admin

# With coverage
nx test api-admin --coverage
```

## MCP Servers

For AI agent integration, start MCP servers:

```bash
npm run mcp:status
npm run mcp:start-all
```

See: [MCP Servers](../../.specify/specs-optimized/architecture/mcp-servers.md)

## Related

- [API Gateway](../../apps/api-gateway/README.md)
- [Monolith API](../../apps/api-monolith/README.md)
- [MCP Servers](../../.specify/specs-optimized/architecture/mcp-servers.md)
