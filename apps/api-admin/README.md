# API Admin Service

Admin microservice for Workix Platform.

## Port

**7100** (according to specification)

## Features

- Admin authentication and authorization
- Admin session management
- Two-factor authentication (2FA/TOTP)
- IP whitelist management
- Password reset flow
- Audit logging
- Service routing management
- Endpoint whitelist management

## Database

- **Database**: `workix_admin`
- **Port**: 5100 (PostgreSQL, API 7100 → DB 5100)
- **Environment Variable**: `DATABASE_URL_ADMIN`

## Environment Variables

```bash
# Database
DATABASE_URL_ADMIN=postgresql://postgres:postgres@localhost:5100/workix_admin

# Service Configuration
API_ADMIN_PORT=7100
API_HOST=0.0.0.0
NODE_ENV=development

# JWT
ADMIN_JWT_SECRET=your-secret-key-minimum-32-characters-long
GATEWAY_ADMIN_JWT_SECRET=your-secret-key-minimum-32-characters-long

# Redis
REDIS_HOST=localhost
REDIS_PORT=5900
REDIS_PASSWORD=
REDIS_DB=1

# Service Key (for inter-service communication)
SERVICE_KEY=dev-service-key
```

## Running

```bash
# Development
nx serve api-admin

# Production build
nx build api-admin

# Run tests
nx test api-admin
```

## API Documentation

Swagger UI available at: `http://localhost:7100/docs`

## Health Check

```bash
curl http://localhost:7100/health
```

## Architecture

This service uses:
- `@workix/domain/admin` - Admin domain logic
- `@workix/shared/backend/core` - Shared backend utilities
- Prisma for database access
- Redis for caching
- JWT for authentication
