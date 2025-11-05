# Workix Platform - Foundation Specification

## 📋 Feature Overview

**Feature Name**: Platform Foundation  
**Feature ID**: 001-platform-foundation  
**Scope**: Architectural foundation and core infrastructure for the Workix visual automation platform  
**Priority**: P0 (Critical - required for all other features)  

## 🎯 Business Objectives

1. Establish scalable, secure multi-tenant architecture
2. Implement core platform infrastructure (auth, tenancy, observability)
3. Create modular structure enabling rapid feature development
4. Ensure compliance with security, GDPR, and audit requirements
5. Provide foundation for AI-agent integration and explainability

## 👥 User Stories

### Story 1: Tenant Admin Onboarding
**As a** tenant administrator  
**I want to** provision a new workspace/organization  
**So that** my team can start using Workix for automation

**Acceptance Criteria**:
- [ ] Admin can create organization through API
- [ ] Each org gets unique database schema or separate database
- [ ] Default quotas are applied (pipelines, executions, users)
- [ ] Audit log records org creation with metadata
- [ ] Email confirmation workflow works (future: UI)

### Story 2: User Authentication & Authorization
**As a** user  
**I want to** authenticate securely and access only my organization's data  
**So that** my workflows and data remain private and secure

**Acceptance Criteria**:
- [ ] JWT-based authentication implemented
- [ ] Multi-tenant isolation at API level (tenant context from JWT)
- [ ] Role-based access control (RBAC) working
- [ ] Logout/token invalidation implemented
- [ ] Password requirements enforced
- [ ] Failed login attempts logged with rate limiting

### Story 3: Core API Foundation
**As a** frontend developer  
**I want to** have documented, type-safe API endpoints  
**So that** I can integrate with the backend efficiently

**Acceptance Criteria**:
- [ ] NestJS project scaffolding complete
- [ ] Swagger/OpenAPI auto-generation working
- [ ] Health check endpoint available
- [ ] Error handling standardized (400, 401, 403, 500)
- [ ] Request/response DTOs type-safe
- [ ] Logging middleware for all requests

### Story 4: Database & Migration System
**As a** developer  
**I want to** manage database schema with version control  
**So that** deployments are reproducible and auditable

**Acceptance Criteria**:
- [ ] PostgreSQL running in Docker
- [ ] TypeORM migration system working
- [ ] Initial schema includes: users, organizations, audit_logs, quotas
- [ ] Migrations tracked in git
- [ ] Migration rollback capability verified

### Story 5: Observability & Monitoring
**As a** operations engineer  
**I want to** monitor platform health and debug issues  
**So that** we can maintain 99.9% uptime

**Acceptance Criteria**:
- [ ] Structured logging implemented (JSON format)
- [ ] Metrics collection (Prometheus)
- [ ] Health/status endpoints for monitoring
- [ ] Error tracking integration ready
- [ ] Dashboards in Grafana/dashboard tool
- [ ] Alert rules defined

### Story 6: Multi-Tenant Data Isolation
**As a** security officer  
**I want to** ensure complete data isolation between tenants  
**So that** we meet compliance requirements

**Acceptance Criteria**:
- [ ] Tenant ID required for all queries
- [ ] Database-level constraints enforce tenant isolation
- [ ] Cross-tenant data access impossible even with SQL injection
- [ ] Audit logs verify access patterns
- [ ] Tests prove isolation (cannot access other tenant data)

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Angular SSR Apps                      │
│        (Admin Dashboard + Client Application)           │
└────────────────────┬────────────────────────────────────┘
                     │ REST/gRPC
┌────────────────────▼────────────────────────────────────┐
│                   NestJS API Gateway                    │
│    (Auth, Routing, Rate Limiting, Observability)       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──┐  ┌──────▼──┐  ┌──────▼──┐
│ Services │  │ Config  │  │AI-Agent │
│ (Logic)  │  │(Env Val)│  │(Sandbox)│
└───────┬──┘  └─────────┘  └─────────┘
        │
┌───────▼──────────────────────────────┐
│      PostgreSQL Database             │
│  (Multi-tenant with audit logs)      │
└──────────────────────────────────────┘
```

### Environment & Infrastructure

- **Container Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **Database**: PostgreSQL 15+
- **Caching**: Redis (optional, for future)
- **Message Queue**: (to be determined)
- **Secrets Management**: Vault / Docker Secrets
- **Observability Stack**: Prometheus + Grafana
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
workix/
├── .specify/
│   ├── memory/
│   │   └── constitution.md
│   ├── specs/
│   │   └── 001-platform-foundation/
│   │       ├── spec.md (this file)
│   │       ├── plan.md
│   │       ├── tasks.md
│   │       └── contracts/
│   └── scripts/
├── apps/
│   ├── backend-api/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   └── ...
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── web-admin/
│   │   └── ... (Angular app)
│   └── web-client/
│       └── ... (Angular app)
├── libs/
│   ├── models/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── organization.entity.ts
│   │   │   └── ...
│   │   └── dtos/
│   ├── services/
│   │   ├── auth/
│   │   ├── tenant/
│   │   └── ...
│   ├── repositories/
│   ├── config/
│   └── shared/
├── docker-compose.yml
├── Makefile
├── nx.json
└── tsconfig.base.json
```

## 🔐 Security & Compliance

### Authentication
- [ ] JWT tokens with short expiration (15 min access, refresh tokens)
- [ ] Refresh token rotation
- [ ] Secure cookie handling
- [ ] API key support for service-to-service

### Multi-Tenancy
- [ ] Tenant context middleware
- [ ] Database-level row-level security (RLS) or schema isolation
- [ ] Query builders automatically filter by tenant ID
- [ ] Audit logs include tenant ID and user ID

### Data Protection
- [ ] Secrets never logged or displayed
- [ ] .env files in .gitignore
- [ ] Password hashing (bcrypt, scrypt)
- [ ] API rate limiting per user/tenant
- [ ] HTTPS enforced in production

### Audit & Compliance
- [ ] All mutations logged (CREATE, UPDATE, DELETE)
- [ ] User actions traced to user ID
- [ ] GDPR data export/deletion capability
- [ ] Retention policies configurable per tenant
- [ ] Compliance reports generatable

## 📊 Data Model - Initial Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('admin', 'user', 'viewer'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
  max_users INT DEFAULT 5,
  max_pipelines INT DEFAULT 10,
  max_executions_per_month INT DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing Strategy

### Unit Tests
- Service business logic
- DTO validation
- Utility functions
- Database query builders

### Integration Tests
- API endpoint testing
- Multi-tenant isolation verification
- Database migrations
- Authentication flows

### E2E Tests
- Full user workflows
- API chains
- Multi-user scenarios

### Security Tests
- SQL injection attempts
- Cross-tenant access attempts
- Missing authentication
- Invalid token handling

## 📋 Acceptance Checklist

- [ ] NestJS project scaffolded and running
- [ ] PostgreSQL database with schema set up
- [ ] User authentication flow working
- [ ] Multi-tenant isolation verified
- [ ] API documentation (Swagger) complete
- [ ] Observability stack operational
- [ ] Docker Compose configuration complete
- [ ] CI/CD pipeline working
- [ ] Security gates passing
- [ ] Code coverage >80%

## 🔄 Dependencies & Blockers

- **Blockers**: None (foundation feature)
- **Dependencies**: None (first feature)

## 📅 Timeline

- **Duration**: 2 weeks (can be adjusted based on team capacity)
- **Phases**:
  1. Backend scaffolding (3 days)
  2. Database & migration system (3 days)
  3. Auth & multi-tenancy (4 days)
  4. Observability setup (2 days)
  5. Testing & security gates (3 days)
  6. Documentation (1 day)

---

**Version**: 1.0  
**Created**: 2025-01-01  
**Last Updated**: 2025-01-01  
**Status**: Ready for planning  
