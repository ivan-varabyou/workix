# API Gateway Operations

## Purpose

Central entry point for all API requests. Routes to appropriate services, handles authentication, rate limiting, and observability.

## Features

- Request routing to services
- Authentication & authorization
- Rate limiting
- Health checks
- Request/response logging
- CORS configuration

## Port Configuration

- **API Gateway**: `7000` → Database `5000` (workix_gateway)
- **Monolith API**: `7101` → Database `5101` (workix_monolith)
- **Auth Service**: `7102` → Database `5102` (workix_auth)
- **Notifications Service**: `7103` → Database `5103` (workix_notifications)

**Port Structure**: `7vnn` where v=version, nn=service number
**Port Mapping Rule**: Database ports logically map to API service ports by changing first digit from 7 to 5 (API 7xxx → DB 5xxx).

## API Structure

### Gateway Routes

**Base URL**: `http://localhost:7000/api/v1`

**Routes**:
- `/api/v1/auth/*` → Auth service (7102) or Monolith (7101)
- `/api/v1/users/*` → Auth service (users endpoints) or Monolith (7101)
- `/api/v1/pipelines/*` → Pipeline service or Monolith (7101)
- `/api/v1/executions/*` → Execution service or Monolith (7101)
- `/api/v1/rbac/*` → RBAC service or Monolith (7101)
- `/api/v1/analytics/*` → Analytics service (Monolith 7101)
- `/api/v1/integrations/*` → Integrations service (Monolith 7101)
- `/api/v1/workers/*` → Workers service (Monolith 7101)
- `/api/v1/ab-tests/*` → A/B Testing service (Monolith 7101)

### Monolith Routes

**Base URL**: `http://localhost:7101/api-monolith/v1`

**All services consolidated**:
- Users, Pipelines, RBAC, Analytics, Integrations, Workers, A/B Testing
- Auth handled by separate service (7102) or can be integrated

## Routing Logic

Gateway detects service based on path prefix:
- Removes `/api/v1` or `/api` prefix
- Routes to appropriate service (monolith or microservice)
- Supports versioned paths: `/api/v1/{service}/{endpoint}`

## Related

- [Architecture](../core/architecture.md)
- [Platform Foundation](./platform.md)
