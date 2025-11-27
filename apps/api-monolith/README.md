# Workix Monolith API

Monolithic API service containing all backend modules in single application.

## Overview

Phase 1 implementation: all services consolidated in single application for rapid development and testing. Can be split into microservices when needed.

## Port

- **Port**: `7101` (структура: 7vnn, где v=1, nn=01)
- **Database Port**: `5101` (API 7101 → DB 5101, правило: 7→5)
- **Database Name**: `workix_monolith`
- **Connection**: `postgresql://postgres:postgres@localhost:5101/workix_monolith`
- **Swagger**: `http://localhost:7101/docs`

## Modules

- Authentication (`libs/domain/auth`)
- Users (`libs/domain/users`)
- Pipelines (`libs/domain/pipelines`)
- RBAC (`libs/domain/rbac`)
- Workers (`libs/domain/workers`)
- Integrations (`libs/integrations/*`)

## Architecture

- Business logic: `libs/domain/*`
- Controllers: `apps/api-monolith/src/app/*`
- Database: Prisma with PostgreSQL

## Documentation

- **Project Specifications**: [.specify/specs-optimized/index.md](../../.specify/specs-optimized/index.md)
- **Architecture**: [.specify/specs-optimized/core/architecture.md](../../.specify/specs-optimized/core/architecture.md)
- **Development**: [.specify/specs-optimized/core/development.md](../../.specify/specs-optimized/core/development.md)

## Related

- [API Gateway](../api-gateway/README.md)
- [Auth Service](../api-auth/README.md)
