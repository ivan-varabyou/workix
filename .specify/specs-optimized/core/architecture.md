# Workix Architecture

**Version**: 3.1
**Strategy**: Monolith-First
**Last Updated**: 2025-11-27

## Overview

Start with monolith for rapid hypothesis testing, then easily split into microservices when needed.

## Benefits

- Fast hypothesis testing (single service, single DB)
- Easy splitting (all logic in `libs/`, create new `app` and connect)
- Code reuse (no duplication, all logic in `libs/`)
- Flexibility (run monolith or microservices based on load)
- Simple development (one codebase, one test, one deploy)

## Project Structure

```
workix/
├── libs/
│   ├── backend/              # Backend-specific libraries
│   │   ├── domain/           # Business logic
│   │   │   ├── auth/         # Authentication
│   │   │   ├── users/        # User management
│   │   │   ├── pipelines/    # Pipelines
│   │   │   ├── rbac/         # RBAC
│   │   │   ├── webhooks/     # Webhooks
│   │   │   ├── workflows/    # Workflows
│   │   │   ├── workers/      # Workers
│   │   │   ├── admin/        # Admin
│   │   │   ├── notifications/# Notifications
│   │   │   ├── ab-testing/   # A/B testing
│   │   │   ├── billing/      # Billing
│   │   │   └── ai/           # AI domain services
│   │   ├── entities/         # Data models with business logic
│   │   │   ├── domain/       # Domain entities
│   │   │   └── infrastructure/# Infrastructure entities
│   │   ├── infrastructure/    # Infrastructure layer
│   │   │   ├── database/     # Database
│   │   │   ├── prisma/       # Prisma client
│   │   │   ├── message-broker/# Message broker
│   │   │   ├── i18n/         # Internationalization
│   │   │   ├── notifications/# Notifications
│   │   │   ├── api-keys/     # API keys
│   │   │   ├── testing/      # Testing utilities
│   │   │   ├── service-discovery/# Service discovery
│   │   │   ├── performance/   # Performance
│   │   │   └── ai/           # AI infrastructure
│   │   ├── integrations/      # External integrations
│   │   │   ├── cloud/        # AWS, Azure, GCP
│   │   │   ├── code/         # GitHub, GitLab
│   │   │   ├── communication/# Slack, Telegram
│   │   │   ├── e-commerce/   # Marketplaces
│   │   │   ├── project-management/# Jira, Salesforce
│   │   │   ├── core/         # Integration core
│   │   │   └── ai/           # AI provider integrations
│   │   └── shared/           # Backend shared libraries
│   │       ├── core/         # Core utilities (guards, services, types)
│   │       └── utilities/     # Technical utilities
│   ├── frontend/             # Frontend-specific libraries
│   │   ├── entities/         # Frontend data models
│   │   ├── features/        # Frontend features
│   │   └── shared/          # Frontend shared libraries
│   │       ├── core/        # Frontend core
│   │       ├── api/         # Frontend API client
│   │       └── ui/         # UI components
│   └── shared/               # Platform-agnostic shared libraries
│       └── utils/            # Common utilities
├── apps/
│   ├── api-gateway/         # API Gateway (port 7000)
│   ├── api-monolith/        # Monolith (port 7101)
│   ├── api-auth/           # Auth service (port 7200)
│   ├── app-admin/          # Admin frontend (port 7300)
│   ├── app-web/            # Web frontend (port 7301)
│   └── mcp-server/         # MCP server
```

## Development Phases

### Phase 1: Monolith (Current)

```
Client → API Gateway (7000) → Monolith API (7101) → PostgreSQL (5101)
```

**Benefits**: Single service, single DB, fast startup, simple testing, easy deploy

### Phase 2: Microservices (When Needed)

Split when:
- High load on specific module
- Security/compliance isolation needed
- Different teams per module
- Independent scaling required

## Database Strategy

### Monolith: Single DB
- All tables in `workix_main`
- Simple queries, transactions

### Microservices: Split DBs
- Each service has own DB
- Communication via message broker

## Library Structure

### Backend Domain Libraries (`libs/backend/domain/`)
- Business logic only
- No framework dependencies
- Testable independently

### Backend Infrastructure Libraries (`libs/backend/infrastructure/`)
- Framework integrations
- External service clients
- Shared infrastructure

### Backend Entities (`libs/backend/entities/`)
- Data models with business logic
- Organized by domain and infrastructure
- Encapsulate entity-specific operations

### Backend Integrations (`libs/backend/integrations/`)
- External service integrations
- Provider-agnostic abstractions
- AI provider integrations

### Backend Shared Libraries (`libs/backend/shared/`)
- Backend-specific utilities
- Core functionality (guards, services, types)
- Technical utilities

### Frontend Libraries (`libs/frontend/`)
- Frontend-specific libraries
- Entities, features, shared components
- UI components and core services

### Shared Libraries (`libs/shared/`)
- Platform-agnostic utilities
- Common utilities (date, string, validation)

## Principles

1. **NX Compliance**: All business logic in `libs/`, `apps/` only connects
2. **Backend/Frontend Separation**: Clear separation between backend and frontend libraries
3. **Separation of Concerns**: Clear responsibility boundaries
4. **Dependency Injection**: Use NestJS DI
5. **Type Safety**: 100% TypeScript, no `any`
6. **SOLID Principles**: Follow SOLID

## Migration Path

1. Start: Monolith with all modules
2. Identify: High-load modules
3. Extract: Create new `app`, move controllers
4. Split: Create separate DB if needed
5. Deploy: Independent services

## Related

- [Development Process](./development.md)
- [Platform Foundation](../architecture/platform.md)
- [Libraries Structure](./libraries.md)
