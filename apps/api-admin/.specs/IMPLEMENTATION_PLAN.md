# Admin API - Technical Implementation Plan

**Version**: 2.0
**Date**: 2025-01-27
**Status**: Technical Planning (Phase 1)

## Overview

Technical implementation plan for Admin API - centralized service for managing Workix platform. Based on `ADMIN_API_PLAN.md` specification and follows `constitution.md` principles.

## Technical Context

### Project Architecture

**NX Monorepo structure**:
```
workix/
├── apps/
│   ├── api-admin/          # Admin API (port 7100, DB 5100)
│   ├── api-auth/           # Auth API (port 7102, DB 5102)
│   ├── api-gateway/        # Gateway (port 7000, DB 5000)
│   └── ...
├── libs/
│   └── backend/
│       ├── domain/         # Business logic
│       │   ├── admin/      # ✅ Exists - basic admin services
│       │   ├── auth/       # Exists - for users (User)
│       │   ├── users/      # Exists - user management
│       │   └── ...
│       ├── infrastructure/ # Infrastructure
│       │   ├── prisma/     # Prisma clients
│       │   ├── i18n/       # Internationalization
│       │   └── message-broker/ # Message queues
│       └── shared/         # Shared utilities
└── .specify/               # Project specifications
```

### Current api-admin State

**Base**: `api-admin` created as copy of `api-auth` with adaptation:
- ✅ Port: 7100 (instead of 7102)
- ✅ DB: `workix_admin` on port 5100 (instead of `workix_auth` on 5102)
- ✅ Prisma schema: adapted for `Admin` model
- ✅ Integrated `WorkixAuthModule` (needs replacement with `WorkixAdminModule`)

**Issues**:
- ❌ Uses `WorkixAuthModule` instead of `WorkixAdminModule`
- ❌ Controllers use `User` instead of `Admin`
- ❌ Unnecessary modules (OAuth2, PhoneOtp, EmailVerification)
- ❌ No admin-specific controllers

### Technologies

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (via `@workix/backend/domain/admin`)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Vitest
- **Type Safety**: TypeScript strict mode

### Service Dependencies

**api-admin → libs/backend/domain/admin**:
- ✅ `WorkixAdminModule` - main module
- ✅ `AdminAuthService` - admin authentication
- ✅ `AdminJwtService` - JWT token generation
- ✅ `AdminIpWhitelistService` - IP whitelist
- ✅ `AdminTokenCacheService` - token caching

**api-admin → libs/backend/infrastructure/**:
- ✅ `PrismaModule` - DB operations
- ✅ `I18nModule` - internationalization
- ✅ `MessageBrokerModule` - message queues

**api-admin → other domain libraries** (for user management):
- ⚠️ `@workix/backend/domain/users` - for viewing users
- ⚠️ `@workix/backend/domain/billing` - for billing management (if exists)
- ⚠️ `@workix/backend/domain/rbac` - for RBAC management (if exists)

### Needs Clarification

1. **NEEDS CLARIFICATION**: Does `@workix/backend/domain/billing` exist?
   - If not - need to create or use external API

2. **NEEDS CLARIFICATION**: Does `@workix/backend/domain/rbac` exist?
   - If not - need to create or use external API

3. **NEEDS CLARIFICATION**: How to monitor other services (api-gateway, api-auth, etc.)?
   - Health check endpoints?
   - Service discovery?
   - Direct DB connections?

4. **NEEDS CLARIFICATION**: How to integrate with Grafana/Prometheus?
   - Existing endpoints?
   - Need to create new ones?

5. **NEEDS CLARIFICATION**: How to work with other services' databases?
   - Direct Prisma connections?
   - Via other services' APIs?
   - Read-only access?

## Constitution Check

### ✅ 1. No-Code First
- **Status**: ✅ PASS
- **Rationale**: Admin API is backend service for admins, doesn't require no-code approach

### ✅ 2. Explainability & Trust
- **Status**: ✅ PASS
- **Rationale**: All admin actions logged in audit logs, full traceability

### ✅ 3. Security First
- **Status**: ✅ PASS
- **Rationale**:
  - IP whitelist for super_admin
  - Audit logging all operations
  - Self-destruction protection
  - Rate limiting
  - JWT authentication

### ✅ 4. Reliability & Observability
- **Status**: ✅ PASS
- **Rationale**:
  - Health checks for all services
  - Monitoring via Prometheus/Grafana
  - Dashboard with metrics
  - Logging all operations

### ✅ 5. Clean Architecture
- **Status**: ✅ PASS
- **Rationale**:
  - Business logic in `libs/backend/domain/`
  - API only connects and calls libraries
  - SOLID principles
  - DRY - library reuse

### ✅ 6. Performance & Scalability
- **Status**: ✅ PASS
- **Rationale**:
  - Metrics caching (Redis)
  - Pagination for large lists
  - Async processing for heavy operations
  - Performance requirements defined in spec

### ✅ 7. Developer Experience
- **Status**: ✅ PASS
- **Rationale**:
  - TypeScript strict mode
  - Swagger documentation
  - Full typing without `as`, `any`
  - Type guards for type checking

### ✅ 8. User Experience
- **Status**: ✅ PASS
- **Rationale**:
  - Standardized error responses
  - Clear error messages
  - Swagger for API testing

### Gates Evaluation

**Gate 1: Security Review** ✅ PASS
- All endpoints protected
- Audit logging
- IP whitelist
- Self-destruction protection

**Gate 2: Architecture Review** ✅ PASS
- Logic in libraries
- API only connects
- Reuse existing libraries

**Gate 3: Type Safety** ✅ PASS
- TypeScript strict mode
- No `as`, `any` (except documented exceptions)
- Type guards for type checking

## Phase 0: Research & Clarification

### Research Tasks

1. **Research existing libraries**:
   - Check `@workix/backend/domain/billing` existence
   - Check `@workix/backend/domain/rbac` existence
   - Check monitoring libraries existence

2. **Research integrations**:
   - How do other services provide health checks?
   - How to integrate with Grafana/Prometheus?
   - How to access other services' databases?

3. **Research best practices**:
   - Admin API patterns in microservice architecture
   - Security patterns for admin panels
   - Monitoring patterns for multiple services

### Research Findings

**TODO**: Execute research tasks and fill findings here

## Phase 1: Design & Contracts

### Data Model

#### Admin Entity (from Prisma schema)

```prisma
model Admin {
  id                    String   @id @default(uuid())
  email                 String   @unique
  passwordHash          String
  name                  String?
  role                  AdminRole @default(ADMIN)
  isActive              Boolean  @default(true)
  twoFactorEnabled      Boolean  @default(false)
  twoFactorSecret       String?
  backupCodes           String[] @default([])
  ipWhitelistEnabled    Boolean  @default(false)
  lockedUntil           DateTime?
  failedLoginAttempts   Int      @default(0)
  lastLoginAt           DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  sessions              AdminSession[]
  ipWhitelist           AdminIpWhitelist[]
  auditLogs             AuditLog[]
}
```

#### AdminSession Entity

```prisma
model AdminSession {
  id          String   @id @default(uuid())
  adminId     String
  token       String   @unique
  ipAddress   String?
  userAgent   String?
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  admin       Admin    @relation(fields: [adminId], references: [id])
}
```

#### AuditLog Entity

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  adminId     String?
  action      String
  resource    String?
  resourceId  String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  admin       Admin?   @relation(fields: [adminId], references: [id])
}
```

### API Contracts

#### Authentication Endpoints

**POST** `/api-admin/v1/auth/register`
```typescript
Request: {
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'super_admin';
}

Response: {
  admin: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

**POST** `/api-admin/v1/auth/login`
```typescript
Request: {
  email: string;
  password: string;
  twoFactorCode?: string;
}

Response: {
  admin: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

#### Admin Management Endpoints

**GET** `/api-admin/v1/admins`
```typescript
Query: {
  page?: number;      // default: 1
  limit?: number;     // default: 20, max: 100
  role?: string;
  isActive?: boolean;
  search?: string;    // search by email, name
  sortBy?: string;    // createdAt, lastLoginAt, email
  sortOrder?: 'asc' | 'desc';
}

Response: {
  data: Admin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**GET** `/api-admin/v1/admins/:id`
```typescript
Response: {
  id: string;
  email: string;
  name?: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  ipWhitelistEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  sessions: AdminSession[];
  ipWhitelist: AdminIpWhitelist[];
}
```

**PUT** `/api-admin/v1/admins/:id`
```typescript
Request: {
  name?: string;
  role?: 'admin' | 'super_admin';  // super_admin only
  isActive?: boolean;
}

Response: {
  id: string;
  email: string;
  name?: string;
  role: string;
  isActive: boolean;
  updatedAt: string;
}
```

#### Services Management Endpoints

**GET** `/api-admin/v1/services`
```typescript
Response: {
  services: Array<{
    id: string;
    name: string;
    port: number;
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: string;
    responseTime?: number;
  }>;
}
```

**GET** `/api-admin/v1/services/:serviceId/status`
```typescript
Response: {
  serviceId: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheck: string;
  details?: {
    version?: string;
    uptime?: number;
    memory?: number;
    cpu?: number;
  };
}
```

## Phase 2: Implementation Plan

### Phase 1: Basic Infrastructure (P1) - 3-4 days

**Goal**: Setup basic infrastructure and replace auth module with admin module.

**Tasks**:
1. ✅ Replace `WorkixAuthModule` with `WorkixAdminModule` in `app.module.ts`
2. ✅ Remove unnecessary modules (OAuth2, PhoneOtp, EmailVerification)
3. ✅ Remove unnecessary controllers
4. ✅ Adapt `AuthController` for admins
5. ✅ Configure guards (`AdminJwtGuard`, `AdminRoleGuard`)
6. ✅ Configure rate limiting
7. ✅ Configure Swagger documentation

**Libraries**:
- Use `@workix/backend/domain/admin`

**Tests**:
- Unit tests for guards
- Integration tests for auth endpoints
- Security tests

### Phase 2: Admin Management (P1) - 3-4 days

**Goal**: Implement CRUD operations for admin management.

**Tasks**:
1. Create `libs/backend/domain/admin-management/` or extend existing
2. Implement `AdminManagementService`
3. Create `AdminsController`
4. Implement all CRUD endpoints
5. Implement block/unblock
6. Implement session management
7. Implement IP whitelist management

**Security**:
- Cannot delete/block yourself
- Cannot delete/block last super_admin
- Cannot change last super_admin role
- Audit log all actions

**Tests**:
- Unit tests for all security checks
- Integration tests for CRUD operations
- Security tests

### Phase 3: Services Management (P1) - 2-3 days

**Goal**: Implement monitoring and management of all services.

**Tasks**:
1. Create `libs/backend/domain/admin-services/`
2. Implement `ServiceMonitoringService`
3. Create `ServicesController`
4. Implement health check for all services
5. Implement metrics retrieval
6. Implement service restart (super_admin)

**Tests**:
- Unit tests
- Integration tests
- Security tests

### Phase 4: Dashboard & Status (P1) - 2-3 days

**Goal**: Implement main dashboard and platform status.

**Tasks**:
1. Create `libs/backend/domain/admin-dashboard/`
2. Implement `DashboardService`
3. Create `DashboardController`
4. Implement `/api-admin/v1/status`
5. Implement `/api-admin/v1/dashboard`
6. Metrics caching (Redis)

**Tests**:
- Unit tests
- Integration tests

### Phase 5-10: Other Features

See existing `IMPLEMENTATION_PLAN.md` for details of other phases.

## Output Files

After executing this plan, will be created:

- ✅ `IMPLEMENTATION_PLAN.md` (this file) - updated
- ⏳ `data-model.md` - detailed data model
- ⏳ `contracts/` - OpenAPI specifications
- ⏳ `quickstart.md` - quick start
- ⏳ `research.md` - research results (if needed)

## Next Steps

1. ⏳ Execute research tasks (Phase 0)
2. ⏳ Create data-model.md (Phase 1)
3. ⏳ Create API contracts (Phase 1)
4. ⏳ Create quickstart.md (Phase 1)
5. ⏳ Start Phase 1 implementation (Phase 2)

## Related Documents

- [ADMIN_API_PLAN.md](./ADMIN_API_PLAN.md) - Feature specification
- [ADMIN_API_SECURITY.md](./ADMIN_API_SECURITY.md) - Security cases
- [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project Constitution
- [../../.specify/specs-optimized/core/development.md](../../.specify/specs-optimized/core/development.md) - Development Process
