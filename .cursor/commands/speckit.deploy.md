---
description: Verify deployment readiness and generate deployment plan based on implementation, but do NOT perform actual deployment
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Verify deployment readiness, check prerequisites, generate deployment plan, and provide deployment commands. This command **does NOT** perform actual deployment - it only prepares and verifies readiness.

## Operating Constraints

**READ-ONLY for deployment operations**: This command:
- ✅ Verifies deployment readiness
- ✅ Generates deployment plan
- ✅ Provides deployment commands
- ❌ **Does NOT** execute deployment
- ❌ **Does NOT** modify production systems
- ❌ **Does NOT** run migrations automatically

**User must manually**:
- Review deployment plan
- Execute deployment commands
- Monitor deployment
- Verify deployment success

## Execution Steps

### 1. Initialize Context

Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:
- SPEC = FEATURE_DIR/spec.md (or {APP}_PLAN.md)
- PLAN = FEATURE_DIR/plan.md (or IMPLEMENTATION_PLAN.md)
- TASKS = FEATURE_DIR/tasks.md
- CODE = Implementation files

For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

### 2. Load Deployment Configuration

Check for deployment configurations:
- `k8s/*.yml` - Kubernetes deployments
- `docker-compose.prod.yml` - Docker Compose production
- `.github/workflows/*.yml` - CI/CD pipelines
- `apps/{app}/Dockerfile` - Dockerfiles

### 3. Verify Prerequisites

Check deployment readiness:

**Code Quality**:
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Linting passed
- [ ] No critical security issues

**Database**:
- [ ] Migration files exist (if schema changed)
- [ ] Migration scripts tested
- [ ] Backup strategy defined
- [ ] Rollback plan exists

**Configuration**:
- [ ] Environment variables documented
- [ ] Secrets management configured
- [ ] Production configs verified

**Dependencies**:
- [ ] All dependencies up to date
- [ ] No known vulnerabilities
- [ ] Build successful

### 4. Generate Deployment Plan

Create `FEATURE_DIR/deployment-plan.md`:

```markdown
# Deployment Plan - {Feature Name}

## Overview
{Summary of what will be deployed}

## Prerequisites Checklist
- [ ] All tests passing
- [ ] Database migrations ready
- [ ] Configuration verified
- [ ] Dependencies updated
- [ ] Security review passed

## Deployment Steps

### 1. Pre-Deployment
- [ ] Backup database
- [ ] Verify environment
- [ ] Check service health
- [ ] Notify team

### 2. Database Migration (if needed)
```bash
# Commands for database migration
npx prisma migrate deploy --schema=apps/{app}/prisma/schema.prisma
```

### 3. Build
```bash
# Build commands
nx build {app-name}
```

### 4. Deploy

#### Option A: Kubernetes
```bash
# Kubernetes deployment commands
kubectl set image deployment/{app} {app}=ghcr.io/workix/{app}:v{version} -n workix
kubectl rollout status deployment/{app} -n workix
```

#### Option B: Docker Compose
```bash
# Docker Compose deployment
docker-compose -f docker-compose.prod.yml up -d {app}
```

#### Option C: Manual
```bash
# Manual deployment commands
npm run {app}:build
npm run {app}:start
```

### 5. Post-Deployment
- [ ] Verify service health
- [ ] Check logs
- [ ] Run smoke tests
- [ ] Monitor metrics

## Rollback Plan

If deployment fails:
```bash
# Rollback commands
kubectl rollout undo deployment/{app} -n workix
# OR
docker-compose -f docker-compose.prod.yml down
# Restore previous version
```

## Monitoring

- Health check endpoint: `{url}/health`
- Logs: `kubectl logs -f deployment/{app} -n workix`
- Metrics: {metrics_url}

## Risk Assessment

- **Risk Level**: {Low|Medium|High}
- **Impact**: {Description}
- **Mitigation**: {Steps to mitigate}
```

### 5. Check Database Migrations

If schema changed:
- List migration files
- Verify migration order
- Check for breaking changes
- Generate migration commands

### 6. Generate Deployment Scripts

Create `FEATURE_DIR/deploy.sh`:

```bash
#!/bin/bash
# Deployment script for {app-name}
# WARNING: Review before executing!

set -e

APP_NAME="{app-name}"
VERSION="{version}"
ENVIRONMENT="production"

echo "🚀 Deploying ${APP_NAME} v${VERSION} to ${ENVIRONMENT}"

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."
npm run test:run
npx tsc --noEmit
npx nx lint ${APP_NAME}

# Build
echo "🔨 Building..."
nx build ${APP_NAME}

# Database migration (if needed)
# echo "🗄️ Running migrations..."
# npx prisma migrate deploy --schema=apps/${APP_NAME}/prisma/schema.prisma

# Deploy (choose one)
# Kubernetes:
# kubectl set image deployment/${APP_NAME} ${APP_NAME}=ghcr.io/workix/${APP_NAME}:v${VERSION} -n workix

# Docker Compose:
# docker-compose -f docker-compose.prod.yml up -d ${APP_NAME}

echo "✅ Deployment script ready. Review and execute manually."
```

### 7. Generate Health Check Commands

Create health check verification:

```bash
# Health check commands
curl -f http://{service-url}/health || exit 1
curl -f http://{service-url}/api/health || exit 1
```

### 8. Generate Rollback Plan

Create `FEATURE_DIR/rollback-plan.md`:

```markdown
# Rollback Plan

## Quick Rollback

### Kubernetes
```bash
kubectl rollout undo deployment/{app} -n workix
```

### Docker Compose
```bash
docker-compose -f docker-compose.prod.yml down
# Restore previous version
```

## Database Rollback

If migrations were applied:
```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back {migration-name} --schema=apps/{app}/prisma/schema.prisma
```

## Verification

After rollback:
- [ ] Service health check
- [ ] Verify previous version running
- [ ] Check logs for errors
- [ ] Notify team
```

## Output Files

- `FEATURE_DIR/deployment-plan.md` - Comprehensive deployment plan
- `FEATURE_DIR/deploy.sh` - Deployment script (manual execution)
- `FEATURE_DIR/rollback-plan.md` - Rollback procedures

## Deployment Strategies

Based on project configuration, support:
- **Kubernetes Rolling Update**: Zero-downtime via k8s
- **Docker Compose**: Simple container deployment
- **Manual**: Step-by-step manual deployment

## Safety Features

- Pre-deployment verification
- Health checks
- Rollback procedures
- Database backup reminders
- Team notification reminders

## Related Documentation

- [Kubernetes Deployment](../../apps/api-gateway/KUBERNETES_DEPLOYMENT_GUIDE.md)
- [Zero-Downtime Deployment](../../apps/api-gateway/ZERO_DOWNTIME_DEPLOYMENT_PLAN.md)
- [Development Process](../../.specify/specs-optimized/core/development.md)
