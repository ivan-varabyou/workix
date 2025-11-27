# Workix Platform - Project Constitution

## 🎯 Mission Statement

Workix is a visual automation platform that empowers non-technical users to create, run, and monitor AI-driven workflows without writing code. We democratize automation by combining intuitive visual interfaces, explainable AI, and robust infrastructure.

## 🏗️ Core Principles

### 1. **No-Code First**

- Everything must be achievable through the visual editor
- AI-agent decisions must be explainable and transparent
- Users should never need to understand code or technical details

### 2. **Explainability & Trust**

- All AI-agent actions must be logged and explained
- Approval gating for write operations ensures human control
- Audit logs provide full traceability for compliance (GDPR)
- Users understand WHY the system made each decision

### 3. **Security First**

- Multi-tenant isolation with strong data boundaries (db-per-tenant or schema-per-tenant)
- Secrets scanning and prevention of credential leakage
- Approval flow for all critical operations
- GDPR compliance: export, deletion, retention policies
- No secrets in logs or UI outputs

### 4. **Reliability & Observability**

- Dry-run capability for all pipelines before execution
- Snapshot-based testing for reproducibility
- Rollback capability without data loss
- Full observability: dashboards, alerts, runbooks
- All operations are recoverable

### 5. **Clean Architecture**

- SOLID principles guide all design decisions
- DRY (Don't Repeat Yourself) - no code duplication
- YAGNI (You Aren't Gonna Need It) - implement only what's needed
- Configuration over hardcoding
- Modular design enables microservices extraction

### 6. **Performance & Scalability**

- Lazy loading and efficient rendering
- Serverless-ready sandbox execution for AI-agent
- Connection pooling and query optimization
- Horizontal scaling through microservices
- Caching strategies for high throughput

### 7. **Developer Experience**

- Type-safe throughout the stack (TypeScript)
- Swagger/OpenAPI auto-generation
- Clear API contracts
- Automated CI/CD with security gates
- Comprehensive test coverage (TDD approach)

### 8. **User Experience**

- Intuitive drag-and-drop visual editor
- Real-time feedback and validation
- Clear error messages with AI-suggested fixes
- Progressive disclosure of advanced options
- Responsive design for multiple devices

## 🛠️ Technical Standards

### Code Quality

- All code must be type-safe (TypeScript, strong typing)
- TDD approach: tests written before implementation
- All functions must be tested with realistic scenarios
- Code reviews mandatory before merge
- Zero hardcoded values - use configuration

### Testing Strategy

- **Unit Tests**: libs/\*_/**tests**/_.spec.ts (Vitest)
- **Snapshot Tests**: for UI and API responses
- **E2E Tests**: real workflows through the platform
- **Security Tests**: secrets scanning, injection attacks
- **Load Tests**: for scalability validation

### Architecture Layers

```
apps/
  ├── web-admin/          # Admin dashboard (Angular SSR)
  ├── web-client/         # Client app (Angular SSR)
  └── backend-api/        # NestJS backend

libs/
  ├── models/             # Entities, DTOs, interfaces
  ├── services/           # Business logic
  ├── repositories/       # Data access
  ├── config/             # Configuration, env validation
  ├── ai-agent/           # Windsurf integration, explainability
  ├── observability/      # Logging, metrics, tracing
  ├── multi-tenant/       # Tenant isolation logic
  └── shared/             # Utilities, guards, interceptors
```

### Database

- PostgreSQL with TypeORM
- Migrations tracked in version control
- Schema-per-tenant or db-per-tenant isolation
- Foreign keys and constraints enforced
- Audit logs for all data mutations

### Security

- API authentication via JWT or OAuth2
- Rate limiting and DDoS protection
- Input validation on all endpoints
- SQL injection prevention through ORM
- XSS and CSRF protection
- Secrets never in logs or version control
- Regular penetration testing

### Multi-Tenancy

- Complete data isolation between tenants
- Per-tenant quota and rate limiting
- Separate audit logs per tenant
- GDPR-compliant data export and deletion
- Tenant-scoped APIs and permissions

### CI/CD Pipeline

- GitHub Actions for automation
- Linting, type-checking, tests must pass
- Security scanning (secrets, dependencies, SAST)
- Docker image build and push
- Automated deployment to staging
- Manual approval for production

## 📊 Approval Flow & Governance

### Pipeline Execution

1. **Dry-Run**: Simulate execution without side effects ✓
2. **Snapshot**: Capture expected output state ✓
3. **Approval**: Human review for write operations ✓
4. **Execution**: Run with full logging ✓
5. **Validation**: Compare with snapshot, alert on divergence ✓

### AI-Agent Decisions

- Every AI decision must have an explanation
- Users can override AI decisions
- All overrides are logged for audit
- AI learns from user feedback (future)

## 🎪 Non-Negotiables

- ❌ **No secrets in code, logs, or UI**
- ❌ **No hardcoded values** - everything configurable
- ❌ **No single points of failure** - redundancy by design
- ❌ **No tech debt** - pay as you go
- ❌ **No scope creep** - YAGNI principle

## ✅ Success Metrics

1. **User Adoption**: Non-technical users can create workflows independently
2. **Platform Reliability**: 99.9% uptime, <5s response times
3. **Data Security**: Zero security incidents, 100% GDPR compliance
4. **Developer Productivity**: New features deployed weekly
5. **Explainability**: Users understand 100% of AI-agent decisions
6. **Scalability**: Support 10k+ concurrent users per tenant

## 🚀 Development Workflow

1. **Define**: Specification in speckit.specify.md
2. **Plan**: Technical implementation in speckit.plan.md
3. **Design**: Interfaces in libs/models/interfaces/
4. **Model**: Database entities in libs/models/entities/
5. **Test**: Vitest specs before implementation
6. **Code**: Implement to pass tests
7. **Review**: Security and architecture review
8. **Deploy**: Automated CI/CD pipeline

---

**Last Updated**: 2025-01-01
**Maintained By**: Workix Core Team
**Review Frequency**: Quarterly or when principles change
