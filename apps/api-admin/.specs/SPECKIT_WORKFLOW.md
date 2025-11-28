# Speckit Workflow - Admin API

**Version**: 1.0
**Date**: 2025-11-27

## Overview

Guide for using speckit commands for Admin API development, considering NX monorepo and logic reuse from `libs/backend/domain`.

## Important Notes

### NX Monorepo

- **Logic in libraries**: All business logic in `libs/backend/domain/`
- **Reuse**: `api-auth` and `api-admin` use shared libraries:
  - `@workix/backend/domain/auth` - for users (User)
  - `@workix/backend/domain/admin` - for admins (Admin)
- **Change impact**: Library changes affect all using applications
- **Consistency**: Security rules and business logic must be consistent between User and Admin API

## Speckit Command Order

> **Important**: Documents stored in `.specs/` folder of each app.

### 1. `/speckit.specify` - Create Specification

**When to use**: At start of new feature or module development.

**What it does**:
- Creates `spec.md` with functional requirements
- Defines user stories, edge cases, success criteria
- Sets context and feature boundaries
- **Stored in**: `apps/{app-name}/.specs/spec.md` or `ADMIN_API_PLAN.md`

**For Admin API**: ✅ Done → `.specs/ADMIN_API_PLAN.md`

### 2. `/speckit.clarify` - Clarify Ambiguities

**When to use**: After creating specification, before planning.

**What it does**:
- Identifies ambiguities in requirements
- Asks clarifying questions (up to 5)
- Integrates answers into specification
- **Stored in**: Updates `spec.md` in `.specs/`

**For Admin API**: ✅ Done (5 questions asked and answers integrated)

### 3. `/speckit.plan` - Technical Planning

**When to use**: After clarifying specification, before creating tasks.

**What it does**:
- Creates `plan.md` with technical details
- Defines architecture, stack, dependencies
- Plans implementation phases
- Considers existing libraries in monorepo
- **Stored in**: `apps/{app-name}/.specs/plan.md` or `IMPLEMENTATION_PLAN.md`

**⚠️ CRITICAL for Admin API (NX monorepo)**:

1. **Existing libraries**:
   - `@workix/backend/domain/auth` - used in `api-auth` for users (User)
   - `@workix/backend/domain/admin` - used in `api-admin` for admins (Admin)
   - These are **different libraries**, but may have shared logic

2. **Impact on api-auth**:
   - If changing shared libraries (e.g., `@workix/backend/infrastructure/*`) - affects `api-auth`
   - If changing `@workix/backend/domain/auth` - **critical**, need to update tests in `api-auth`
   - Admin API uses `@workix/backend/domain/admin` - **does not affect** `api-auth`

3. **What to define in plan**:
   - Which libraries to create new (`libs/backend/domain/admin-*`)
   - Which libraries to extend (if shared logic needed)
   - What to reuse from existing libraries
   - How to ensure security rules consistency between User and Admin

**What to check after execution**:
- [ ] Specified libraries from `libs/backend/domain/`
- [ ] Defined what to create new, what to extend
- [ ] Considered impact on `api-auth` (if changing shared libraries)
- [ ] Phase planning matches `IMPLEMENTATION_PLAN.md`
- [ ] Tasks for security rules synchronization specified

### 4. `/speckit.tasks` - Generate Tasks

**When to use**: After creating plan, before starting implementation.

**What it does**:
- Creates `tasks.md` with detailed tasks
- Organizes tasks by user stories
- Defines dependencies between tasks
- Specifies exact files for changes
- **Stored in**: `apps/{app-name}/.specs/tasks.md` or `TASKS.md` in project root

**⚠️ IMPORTANT for Admin API**:
- Tasks must reference libraries in `libs/backend/domain/`
- Specify which libraries to create/extend
- Consider tasks for synchronization with `api-auth` (if needed)

**What to check after execution**:
- [ ] Tasks reference libraries in `libs/`
- [ ] Tasks for integration with existing libraries specified
- [ ] Tasks for testing impact on `api-auth` exist

### 5. `/speckit.checklist` - Requirements Quality Checklist

**When to use**: After creating tasks (`/speckit.tasks`), for specification quality check.

**What it does**:
- Creates checklist for requirements quality check
- Checks completeness, clarity, consistency
- Identifies specification gaps
- **Stored in**: `apps/{app-name}/.specs/checklists/{domain}.md`

**For Admin API**: ✅ Done → `.specs/checklists/requirements-quality.md`
**Note**: Executed before plan/tasks for demo, but correct order is after tasks

### 6. `/speckit.analyze` - Consistency Analysis

**When to use**: After generating tasks (`/speckit.tasks`), before starting implementation.

**What it does**:
- Analyzes consistency between `spec.md`, `plan.md`, `tasks.md`
- Identifies duplications, mismatches, gaps
- Checks constitution principles compliance
- **Stored in**: `apps/{app-name}/.specs/analysis.md` or `ANALYSIS_REPORT.md`

**For Admin API**: ✅ Done → `.specs/ANALYSIS_REPORT.md`
**Note**: Executed before plan/tasks for demo, but correct order is after tasks

### 7. `/speckit.implement` - Implementation (optional)

**When to use**: For automatic code generation (if supported).

**What it does**:
- Generates code based on specification and plan
- Creates file structure, base classes
- **Caution**: May require manual refinement

**For Admin API**: Not recommended (better manual implementation considering NX structure)

### 8. `/speckit.test` - Test Plan ✅

**When to use**: After implementation or before starting for test planning.

**What it does**:
- Generates test plan based on spec.md, plan.md, tasks.md
- Analyzes test requirements (unit, integration, E2E)
- Checks existing test coverage
- Creates test templates
- Generates `test-plan.md` in `.specs/`

**Status**: ✅ Command created in `.cursor/commands/speckit.test.md`

### 9. `/speckit.docs` - Documentation ✅

**When to use**: After implementation for documentation generation.

**What it does**:
- Generates API documentation
- Creates/updates README
- Generates user guides
- Suggests Swagger annotations
- Creates usage examples

**Status**: ✅ Command created in `.cursor/commands/speckit.docs.md`

### 10. `/speckit.review` - Code Review ✅

**When to use**: After implementation before commit.

**What it does**:
- Checks code quality
- Checks type safety (no `any`, `as`, `!`)
- Checks architecture compliance
- Checks security
- Checks test coverage
- Generates `review-report.md` in `.specs/`

**Status**: ✅ Command created in `.cursor/commands/speckit.review.md`

## Recommended Order for Admin API

### Correct Command Order:

```
1. /speckit.specify      → Create specification
2. /speckit.clarify      → Clarify ambiguities
3. /speckit.plan         → Technical planning
4. /speckit.tasks        → Generate tasks
5. /speckit.checklist    → Quality checklist (after tasks)
6. /speckit.analyze      → Consistency analysis (after tasks)
7. /speckit.implement    → Implementation (optional)
```

### Current Admin API Status:

1. ✅ `/speckit.specify` → `.specs/ADMIN_API_PLAN.md` created
2. ✅ `/speckit.clarify` → 5 questions asked and integrated
3. ⏳ `/speckit.plan` → **NEXT STEP** (correct order)
4. ⏳ `/speckit.tasks` → Waits for plan
5. ✅ `/speckit.checklist` → `.specs/checklists/requirements-quality.md` (executed earlier for demo)
6. ✅ `/speckit.analyze` → `.specs/ANALYSIS_REPORT.md` (executed earlier for demo)

### Next Step: `/speckit.plan`

**Why now**:
- Specification clarified and ready
- Need technical plan considering NX monorepo
- Need to define what to reuse from `libs/backend/domain/auth`
- Need to plan impact on `api-auth`

**What to consider when executing**:
- Existing libraries in `libs/backend/domain/`
- `api-auth` structure and how it uses libraries
- What can be reused, what needs extension
- Impact of changes on `api-auth` (if changing shared libraries)

## Impact on api-auth (NX Monorepo)

### Library Structure:

1. **`@workix/backend/domain/auth`** (libs/backend/domain/auth):
   - Used **only** in `api-auth` for users (User)
   - Contains: `WorkixAuthModule`, `AuthService`, `JwtGuard`, `JwtService`
   - **Not used** in `api-admin`

2. **`@workix/backend/domain/admin`** (libs/backend/domain/admin):
   - Used **only** in `api-admin` for admins (Admin)
   - Contains: `WorkixAdminModule`, `AdminAuthService`, `AdminJwtGuard`, `AdminJwtService`
   - **Not used** in `api-auth`
   - ✅ **Changes DO NOT affect api-auth**

3. **Shared libraries** (may affect both APIs):
   - `@workix/backend/infrastructure/prisma` - shared DB infrastructure
   - `@workix/backend/infrastructure/i18n` - internationalization
   - `@workix/backend/infrastructure/message-broker` - message queues
   - ⚠️ Changes affect **both** APIs

4. **Guards and Security**:
   - `AdminJwtGuard` (admin) vs `JwtGuard` (auth) - **different implementations**
   - Security rules must be **consistent**, but implementation independent

### Recommendations:

1. **When creating new libraries for Admin API**:
   - ✅ Create in `libs/backend/domain/admin-*` (e.g., `admin-services`, `admin-management`)
   - ✅ Use existing `libs/backend/domain/admin` as base
   - ❌ **DO NOT touch** `libs/backend/domain/auth` without need

2. **When changing shared libraries**:
   - ⚠️ Check impact on `api-auth`
   - Update tests in `api-auth`
   - Ensure changes are backward compatible
   - Use feature flags if different behavior needed

3. **Security rules synchronization**:
   - Rules must be **consistent** (e.g., rate limiting, password requirements)
   - But implementation can be **independent** (User vs Admin)
   - Document differences in `ADMIN_API_SECURITY.md`

4. **Testing**:
   - Admin API tests in `apps/api-admin/**/*.spec.ts`
   - Library tests in `libs/backend/domain/admin/**/*.spec.ts`
   - After shared library changes - run `api-auth` tests

## Quick Command Reference

| # | Command | When | Admin API Status | Stored in |
|---|---------|------|------------------|-----------|
| 1 | `/speckit.specify` | Start development | ✅ Done | `.specs/ADMIN_API_PLAN.md` |
| 2 | `/speckit.clarify` | After specify | ✅ Done | Updates spec.md |
| 3 | `/speckit.plan` | After clarify | ⏳ **Next step** | `.specs/plan.md` |
| 4 | `/speckit.tasks` | After plan | ⏳ Waits | `.specs/tasks.md` or `TASKS.md` |
| 5 | `/speckit.checklist` | After tasks | ✅ Done* | `.specs/checklists/` |
| 6 | `/speckit.analyze` | After tasks | ✅ Done* | `.specs/analysis.md` |
| 7 | `/speckit.implement` | Optional | ❌ Not recommended | - |

\* Executed earlier for demo, but correct order is after tasks

## Next Actions

### ✅ Current Admin API Status:

1. ✅ `/speckit.specify` → `.specs/ADMIN_API_PLAN.md` created
2. ✅ `/speckit.clarify` → 5 questions asked and integrated
3. ⏳ `/speckit.plan` → **NEXT STEP** (correct order)
4. ⏳ `/speckit.tasks` → Waits for plan
5. ✅ `/speckit.checklist` → `.specs/checklists/requirements-quality.md` (executed earlier for demo)
6. ✅ `/speckit.analyze` → `.specs/ANALYSIS_REPORT.md` (executed earlier for demo)

### ⏳ Next Step:

**Run `/speckit.plan`** to create technical plan considering:
- NX monorepo
- Existing libraries `libs/backend/domain/`
- Impact on `api-auth` (if changing shared libraries)
- Logic reuse from `libs/backend/domain/admin`

**After plan**:
1. Run `/speckit.tasks` to generate detailed tasks
2. After tasks → can run `/speckit.checklist` and `/speckit.analyze` (if needed)
3. Start implementation per `.specs/IMPLEMENTATION_PLAN.md` and `TASKS.md`
4. When changing shared libraries - check impact on `api-auth`

## .specs/ Folder Structure

```
apps/api-admin/.specs/
├── README.md                          # This file
├── ADMIN_API_PLAN.md                  # Specification (spec.md)
├── ADMIN_API_SECURITY.md              # Security cases
├── IMPLEMENTATION_PLAN.md             # Technical plan (plan.md)
├── SPECKIT_WORKFLOW.md                # Commands guide
├── ANALYSIS_REPORT.md                 # Consistency analysis
└── checklists/
    └── requirements-quality.md        # Requirements quality checklist
```

## Related Documents

- [ADMIN_API_PLAN.md](./ADMIN_API_PLAN.md) - Feature specification
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Implementation plan
- [ADMIN_API_SECURITY.md](./ADMIN_API_SECURITY.md) - Security cases
- [ANALYSIS_REPORT.md](./ANALYSIS_REPORT.md) - Consistency analysis
- [checklists/requirements-quality.md](./checklists/requirements-quality.md) - Quality checklist
- [../../TASKS.md](../../TASKS.md) - Project task list
