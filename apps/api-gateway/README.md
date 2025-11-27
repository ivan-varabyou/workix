# Workix API Gateway

Central entry point for all API requests. Routes to appropriate services, handles authentication, rate limiting, and observability.

## Overview

API Gateway routes requests to backend services (monolith or microservices) based on path patterns. Provides unified API interface, authentication, rate limiting, and request logging.

## Port

- **Port**: `7000` (особый случай, без версии)
- **Database Port**: `5000` (API 7000 → DB 5000, правило: 7→5)
- **Database Name**: `workix_gateway`
- **Connection**: `postgresql://postgres:postgres@localhost:5000/workix_gateway`
- **Swagger**: `http://localhost:7000/docs`
- **Health**: `http://localhost:7000/health`

## Features

- Request routing to services
- Authentication & authorization
- Rate limiting
- Health checks
- Request/response logging
- CORS configuration

## Routing

Routes requests based on path:
- `/api/v1/auth/*` → Auth service (port 7102)
- `/api/v1/users/*` → Auth service (port 7102)
- `/api/v1/pipelines/*` → Monolith API (port 7101)
- `/api/v1/*` → Monolith API (port 7101)

## Database

Gateway uses PostgreSQL to store:
- Service configuration (URLs, ports, versions)
- Health check status
- Endpoint whitelist
- API keys (encrypted)
- Admin authentication (separate from api-auth)
- Audit logs

## Documentation

- **Project Specifications**: [.specify/specs-optimized/index.md](../../.specify/specs-optimized/index.md)
- **API Gateway**: [.specify/specs-optimized/architecture/api-gateway.md](../../.specify/specs-optimized/architecture/api-gateway.md)
- **Architecture**: [.specify/specs-optimized/core/architecture.md](../../.specify/specs-optimized/core/architecture.md)

## Related

- [Auth Service](../api-auth/README.md)
- [Monolith API](../api-monolith/README.md)
