# Tasks: Admin API

**Input**: Design documents from `apps/api-admin/.specs/`
**Prerequisites**: ✅ plan.md (IMPLEMENTATION_PLAN.md), ✅ spec.md (ADMIN_API_PLAN.md)

**Organization**: Tasks are grouped by user story/feature to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story/feature this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure setup

- [ ] T001 Create `.specs/` directory structure in `apps/api-admin/.specs/`
- [ ] T002 [P] Verify Prisma schema exists at `apps/api-admin/src/prisma/schema.prisma`
- [ ] T003 [P] Verify database connection configuration in `apps/api-admin/src/prisma/prisma.module.ts`
- [ ] T004 [P] Verify environment variables in `apps/api-admin/env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Replace Auth Module with Admin Module

**⚠️ ВАЖНО**: Это **ручные действия**, не автоматические. TypeScript не удаляет файлы автоматически.

- [ ] T005 Replace `WorkixAuthModule` with `WorkixAdminModule` in `apps/api-admin/src/app/app.module.ts`
- [ ] T006 Remove `OAuth2Module` import from `apps/api-admin/src/app/app.module.ts` (не нужен для админов)
- [ ] T007 Remove `PhoneOtpModule` import from `apps/api-admin/src/app/app.module.ts` (не нужен, админы используют только 2FA/TOTP)
- [ ] T008 Remove `EmailVerificationModule` import from `apps/api-admin/src/app/app.module.ts` (не нужен, админы создаются вручную)
- [ ] T009 **ОСТАВИТЬ** `UsersModule` import in `apps/api-admin/src/app/app.module.ts` (нужен для управления пользователями в User Story 3)

### Remove Unnecessary Controllers

**⚠️ ВАЖНО**: Удалять файлы и директории нужно **вручную**, не автоматически.

- [ ] T010 [P] **Вручную удалить** `apps/api-admin/src/auth/oauth2/` directory (OAuth не нужен для админов)
- [ ] T011 [P] **Вручную удалить** `apps/api-admin/src/auth/phone-otp/` directory (Phone OTP не нужен для админов)
- [ ] T012 [P] **Вручную удалить** `apps/api-admin/src/auth/email-verification/` directory (Email verification не нужен для админов)
- [ ] T013 Remove `OAuth2Controller` from `apps/api-admin/src/app/app.module.ts` controllers array
- [ ] T014 Remove `PhoneOtpController` from `apps/api-admin/src/app/app.module.ts` controllers array
- [ ] T015 Remove `EmailVerificationController` from `apps/api-admin/src/app/app.module.ts` controllers array
- [ ] T016 **ЗАМЕНИТЬ** `UsersController` на `AdminsController` in `apps/api-admin/src/app/app.module.ts` (UsersController для админов не нужен, будет создан AdminsController в US2)

### Configure Guards and Security

- [ ] T017 Configure `AdminJwtGuard` globally in `apps/api-admin/src/app/app.module.ts`
- [ ] T018 [P] Create rate limiting middleware in `apps/api-admin/src/middleware/rate-limit.middleware.ts`
- [ ] T019 [P] Configure rate limits: auth (5 req/min), read (100 req/min), write (20 req/min) in `apps/api-admin/src/middleware/rate-limit.middleware.ts`
- [ ] T020 [P] Create error response interceptor in `apps/api-admin/src/interceptors/error-response.interceptor.ts` for standardized error format

### Update Swagger Documentation

- [ ] T021 Update Swagger title to "Workix Admin API" in `apps/api-admin/src/main.ts`
- [ ] T022 Update Swagger description in `apps/api-admin/src/main.ts`
- [ ] T023 Update base URL to `/api-admin/v1` in `apps/api-admin/src/main.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Admin Authentication (Priority: P1) 🎯 MVP

**Goal**: Complete admin authentication system with login, register, 2FA, sessions, and IP whitelist

**Independent Test**: Admin can register (as super_admin), login, enable 2FA, manage sessions, and configure IP whitelist. All endpoints return standardized responses.

### Implementation for User Story 1

- [ ] T024 [US1] Update `AuthController` to use `AdminAuthService` from `@workix/backend/domain/admin` in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T025 [US1] Replace `User` references with `Admin` in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T026 [US1] Implement `POST /api-admin/v1/auth/register` endpoint using `AdminRegisterDto` in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T027 [US1] Implement `POST /api-admin/v1/auth/login` endpoint using `AdminLoginDto` in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T028 [US1] Implement `POST /api-admin/v1/auth/logout` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T029 [US1] Implement `GET /api-admin/v1/auth/me` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T030 [US1] Implement `POST /api-admin/v1/auth/refresh` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T031 [US1] Implement `POST /api-admin/v1/auth/2fa/generate` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T032 [US1] Implement `POST /api-admin/v1/auth/2fa/enable` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T033 [US1] Implement `POST /api-admin/v1/auth/2fa/verify` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T034 [US1] Implement `DELETE /api-admin/v1/auth/2fa/disable` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T035 [US1] Implement `GET /api-admin/v1/auth/2fa/status` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T036 [US1] Implement `POST /api-admin/v1/auth/2fa/regenerate-backup-codes` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T037 [US1] Implement `POST /api-admin/v1/auth/password-reset/request` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T038 [US1] Implement `POST /api-admin/v1/auth/password-reset/verify` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T039 [US1] Implement `POST /api-admin/v1/auth/password-reset/confirm` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T040 [US1] Implement `POST /api-admin/v1/auth/change-password` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T041 [US1] Implement `GET /api-admin/v1/auth/sessions` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T042 [US1] Implement `DELETE /api-admin/v1/auth/sessions/:sessionId` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T043 [US1] Implement `DELETE /api-admin/v1/auth/sessions` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T044 [US1] Implement `GET /api-admin/v1/auth/ip-whitelist` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T045 [US1] Implement `POST /api-admin/v1/auth/ip-whitelist` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T046 [US1] Implement `DELETE /api-admin/v1/auth/ip-whitelist/:ipId` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T047 [US1] Implement `POST /api-admin/v1/auth/ip-whitelist/toggle` endpoint in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T048 [US1] Add Swagger documentation for all auth endpoints in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T049 [US1] Add `AdminJwtGuard` to all auth endpoints (except register/login) in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T050 [US1] Add `AdminRoleGuard` to register endpoint (super_admin only) in `apps/api-admin/src/auth/controllers/auth.controller.ts`
- [ ] T051 [US1] Add rate limiting to auth endpoints (5 req/min) in `apps/api-admin/src/auth/controllers/auth.controller.ts`

**Checkpoint**: Admin authentication system fully functional and testable independently

---

## Phase 4: User Story 2 - Admin Management (Priority: P1)

**Goal**: Complete CRUD operations for managing admins with security checks (cannot delete self, cannot delete last super_admin, etc.)

**Independent Test**: Super admin can create, read, update, block/unblock, and delete admins. All security checks work correctly. Cannot delete self or last super_admin.

### Implementation for User Story 2

- [ ] T052 [US2] Create `AdminsController` in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] [P] Create or extend `AdminManagementService` in `libs/backend/domain/admin/src/services/admin-management.service.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins` with pagination, filters, search in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `PUT /api-admin/v1/admins/:id` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `DELETE /api-admin/v1/admins/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement security check: cannot delete self in `libs/backend/domain/admin/src/services/admin-management.service.ts`
- [ ] T088 [US2] Implement security check: cannot delete last super_admin in `libs/backend/domain/admin/src/services/admin-management.service.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/block` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/unblock` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/suspend` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/activate` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/status` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `PUT /api-admin/v1/admins/:id/role` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement security check: cannot change role of last super_admin in `libs/backend/domain/admin/src/services/admin-management.service.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/permissions` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/capabilities` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/activity` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/sessions` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/sessions/:sessionId/revoke` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/sessions/revoke-all` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/login-history` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/2fa/generate` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/2fa/enable` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/2fa/disable` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/2fa/status` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/2fa/regenerate-backup-codes` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/ip-whitelist` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/ip-whitelist` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `DELETE /api-admin/v1/admins/:id/ip-whitelist/:ipId` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `POST /api-admin/v1/admins/:id/ip-whitelist/toggle` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/export` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Implement `GET /api-admin/v1/admins/:id/export` endpoint in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Add audit logging for all admin management operations in `libs/backend/domain/admin/src/services/admin-management.service.ts`
- [ ] T088 [US2] Add Swagger documentation for all admin management endpoints in `apps/api-admin/src/app/controllers/admins.controller.ts`
- [ ] T088 [US2] Add rate limiting to write endpoints (20 req/min) in `apps/api-admin/src/app/controllers/admins.controller.ts`

**Checkpoint**: Admin management system fully functional and testable independently

---

## Phase 5: User Story 3 - Services Management (Priority: P1)

**Goal**: Monitor and manage all Workix services (health checks, status, metrics, restart)

**Independent Test**: Admin can view all services, check their status, view metrics, and restart services (super_admin only). Cannot restart api-admin itself.

### Implementation for User Story 3

- [ ] T106 [US3] Create `libs/backend/domain/admin-services/` directory structure
- [ ] T106 [US3] [P] Create `ServiceMonitoringService` in `libs/backend/domain/admin-services/src/services/service-monitoring.service.ts`
- [ ] T106 [US3] [P] Create service configuration interface in `libs/backend/domain/admin-services/src/interfaces/service-config.interface.ts`
- [ ] T106 [US3] Create `ServicesController` in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services` endpoint (response time < 1s p95) in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/:serviceId/status` endpoint (response time < 1s p95, timeout 3s) in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/health` endpoint (response time < 5s p95, timeout 10s) in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/metrics` endpoint (response time < 2s p95, cache TTL 10s) in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `POST /api-admin/v1/services/:serviceId/restart` endpoint (super_admin only, async) in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement security check: cannot restart api-admin itself in `libs/backend/domain/admin-services/src/services/service-monitoring.service.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/:serviceId/config` endpoint in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `PUT /api-admin/v1/services/:serviceId/config` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/:serviceId/env` endpoint (mask secrets) in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/:serviceId/logs` endpoint in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/:serviceId/logs/tail` endpoint in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement `GET /api-admin/v1/services/:serviceId/errors` endpoint in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Implement caching for metrics using Redis in `libs/backend/domain/admin-services/src/services/service-monitoring.service.ts`
- [ ] T106 [US3] Add Swagger documentation for all services endpoints in `apps/api-admin/src/app/controllers/services.controller.ts`
- [ ] T106 [US3] Add rate limiting to read endpoints (100 req/min) in `apps/api-admin/src/app/controllers/services.controller.ts`

**Checkpoint**: Services management system fully functional and testable independently

---

## Phase 6: User Story 4 - Dashboard & Status (Priority: P1)

**Goal**: Main platform status and dashboard with aggregated metrics

**Independent Test**: Admin can view overall platform status and dashboard data with metrics for different time periods (1h, 24h, 7d, 30d).

### Implementation for User Story 4

- [ ] T107 [US4] Create `libs/backend/domain/admin-dashboard/` directory structure
- [ ] T108 [US4] [P] Create `DashboardService` in `libs/backend/domain/admin-dashboard/src/services/dashboard.service.ts`
- [ ] T109 [US4] [P] Create `StatusService` in `libs/backend/domain/admin-dashboard/src/services/status.service.ts`
- [ ] T110 [US4] Create `DashboardController` in `apps/api-admin/src/app/controllers/dashboard.controller.ts`
- [ ] T111 [US4] Implement `GET /api-admin/v1/status` endpoint (response time < 2s p95, timeout 5s) in `apps/api-admin/src/app/controllers/dashboard.controller.ts`
- [ ] T112 [US4] Implement `GET /api-admin/v1/dashboard` endpoint (response time < 3s p95, timeout 10s, cache TTL 30s) in `apps/api-admin/src/app/controllers/dashboard.controller.ts`
- [ ] T113 [US4] Implement `GET /api-admin/v1/metrics/realtime` endpoint in `apps/api-admin/src/app/controllers/dashboard.controller.ts`
- [ ] T114 [US4] Implement `GET /api-admin/v1/metrics/prometheus` endpoint in `apps/api-admin/src/app/controllers/dashboard.controller.ts`
- [ ] T115 [US4] Implement `GET /api-admin/v1/metrics/grafana` endpoint in `apps/api-admin/src/app/controllers/dashboard.controller.ts`
- [ ] T116 [US4] Implement Redis caching for dashboard data in `libs/backend/domain/admin-dashboard/src/services/dashboard.service.ts`
- [ ] T117 [US4] Add Swagger documentation for dashboard endpoints in `apps/api-admin/src/app/controllers/dashboard.controller.ts`
- [ ] T118 [US4] Add rate limiting to read endpoints (100 req/min) in `apps/api-admin/src/app/controllers/dashboard.controller.ts`

**Checkpoint**: Dashboard and status system fully functional and testable independently

---

## Phase 7: User Story 5 - Basic RBAC (Priority: P1)

**Goal**: Basic role-based access control for admins (admin, super_admin roles)

**Independent Test**: Role-based access control works correctly. Super_admin has full access, admin has limited access.

### Implementation for User Story 5

- [ ] T119 [US5] Verify `AdminRoleGuard` exists in `libs/backend/domain/admin/src/guards/admin-role.guard.ts`
- [ ] T120 [US5] Verify role permissions matrix implementation in `libs/backend/domain/admin/src/services/admin-auth.service.ts`
- [ ] T121 [US5] Add `AdminRoleGuard` to all endpoints requiring specific roles in `apps/api-admin/src/app/controllers/`
- [ ] T122 [US5] Test role-based access: super_admin can access all endpoints
- [ ] T123 [US5] Test role-based access: admin cannot access super_admin-only endpoints

**Checkpoint**: Basic RBAC system fully functional and testable independently

---

## Phase 8: User Story 6 - Billing Management (Priority: P2)

**Goal**: View and manage user subscriptions, block payments, manage plans

**Independent Test**: Admin can view subscriptions, block user payments, and manage billing plans.

### Implementation for User Story 6

- [ ] T124 [US6] Create `libs/backend/domain/admin-billing/` directory structure
- [ ] T125 [US6] [P] Create `BillingManagementService` in `libs/backend/domain/admin-billing/src/services/billing-management.service.ts`
- [ ] T126 [US6] Create `BillingController` in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T127 [US6] Implement `GET /api-admin/v1/billing/subscriptions` endpoint with pagination in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T128 [US6] Implement `GET /api-admin/v1/billing/subscriptions/:id` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T129 [US6] Implement `POST /api-admin/v1/billing/subscriptions/:id/cancel` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T130 [US6] Implement `POST /api-admin/v1/billing/subscriptions/:id/reactivate` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T131 [US6] Implement `PUT /api-admin/v1/billing/subscriptions/:id/plan` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T132 [US6] Implement `POST /api-admin/v1/billing/users/:userId/payments/block` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T133 [US6] Implement `POST /api-admin/v1/billing/users/:userId/payments/unblock` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T134 [US6] Implement `GET /api-admin/v1/billing/users/:userId/payments/status` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T135 [US6] Implement `GET /api-admin/v1/billing/payments` endpoint with pagination in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T136 [US6] Implement `GET /api-admin/v1/billing/payments/:id` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T137 [US6] Implement `GET /api-admin/v1/billing/users/:userId/payments` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T138 [US6] Implement `POST /api-admin/v1/billing/payments/:id/refund` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T139 [US6] Implement `GET /api-admin/v1/billing/plans` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T140 [US6] Implement `POST /api-admin/v1/billing/plans` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T141 [US6] Implement `PUT /api-admin/v1/billing/plans/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T142 [US6] Implement `DELETE /api-admin/v1/billing/plans/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T143 [US6] Implement `GET /api-admin/v1/billing/revenue` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T144 [US6] Implement `GET /api-admin/v1/billing/revenue/users/:userId` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T145 [US6] Implement `GET /api-admin/v1/billing/analytics` endpoint in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T146 [US6] Add Swagger documentation for all billing endpoints in `apps/api-admin/src/app/controllers/billing.controller.ts`
- [ ] T147 [US6] Add rate limiting to write endpoints (20 req/min) in `apps/api-admin/src/app/controllers/billing.controller.ts`

**Checkpoint**: Billing management system fully functional and testable independently

---

## Phase 9: User Story 7 - Database Access (Priority: P2)

**Goal**: Monitor databases (read-only), view statistics, manage backups

**Independent Test**: Super_admin can view database status, statistics, and create backups.

### Implementation for User Story 7

- [ ] T148 [US7] Create `libs/backend/infrastructure/database-admin/` directory structure
- [ ] T149 [US7] [P] Create `DatabaseAdminService` in `libs/backend/infrastructure/database-admin/src/services/database-admin.service.ts`
- [ ] T150 [US7] Create `DatabasesController` in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T151 [US7] Implement `GET /api-admin/v1/databases` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T152 [US7] Implement `GET /api-admin/v1/databases/:dbName/status` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T153 [US7] Implement `GET /api-admin/v1/databases/:dbName/metrics` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T154 [US7] Implement `GET /api-admin/v1/databases/:dbName/connections` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T155 [US7] Implement `GET /api-admin/v1/databases/:dbName/stats` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T156 [US7] Implement `GET /api-admin/v1/databases/:dbName/tables` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T157 [US7] Implement `GET /api-admin/v1/databases/:dbName/tables/:tableName/stats` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T158 [US7] Implement `GET /api-admin/v1/databases/:dbName/queries/slow` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T159 [US7] Implement `GET /api-admin/v1/databases/:dbName/backups` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T160 [US7] Implement `POST /api-admin/v1/databases/:dbName/backup` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T161 [US7] Implement `GET /api-admin/v1/databases/:dbName/migrations` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T162 [US7] Implement `POST /api-admin/v1/databases/:dbName/migrations/run` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T163 [US7] Add security: mask connection strings in responses in `libs/backend/infrastructure/database-admin/src/services/database-admin.service.ts`
- [ ] T164 [US7] Add security: prevent arbitrary SQL execution in `libs/backend/infrastructure/database-admin/src/services/database-admin.service.ts`
- [ ] T165 [US7] Add Swagger documentation for all database endpoints in `apps/api-admin/src/app/controllers/databases.controller.ts`
- [ ] T166 [US7] Add rate limiting to read endpoints (100 req/min) in `apps/api-admin/src/app/controllers/databases.controller.ts`

**Checkpoint**: Database access system fully functional and testable independently

---

## Phase 10: User Story 8 - Audit Logs & Security (Priority: P2)

**Goal**: Audit logging for all admin operations, IP blocking, security events

**Independent Test**: All admin operations are logged. Super_admin can view audit logs, block IPs, and view security events.

### Implementation for User Story 8

- [ ] T167 [US8] Create `libs/backend/domain/admin-security/` directory structure
- [ ] T168 [US8] [P] Create `AuditLogService` in `libs/backend/domain/admin-security/src/services/audit-log.service.ts`
- [ ] T169 [US8] [P] Create `SecurityService` in `libs/backend/domain/admin-security/src/services/security.service.ts`
- [ ] T170 [US8] Create `AuditController` in `apps/api-admin/src/app/controllers/audit.controller.ts`
- [ ] T171 [US8] Create `SecurityController` in `apps/api-admin/src/app/controllers/security.controller.ts`
- [ ] T172 [US8] Implement audit logging interceptor in `apps/api-admin/src/interceptors/audit-log.interceptor.ts`
- [ ] T173 [US8] Apply audit logging interceptor globally in `apps/api-admin/src/app/app.module.ts`
- [ ] T174 [US8] Implement `GET /api-admin/v1/audit/logs` endpoint with pagination in `apps/api-admin/src/app/controllers/audit.controller.ts`
- [ ] T175 [US8] Implement `GET /api-admin/v1/audit/logs/:id` endpoint in `apps/api-admin/src/app/controllers/audit.controller.ts`
- [ ] T176 [US8] Implement `GET /api-admin/v1/audit/users/:userId` endpoint in `apps/api-admin/src/app/controllers/audit.controller.ts`
- [ ] T177 [US8] Implement `GET /api-admin/v1/audit/export` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/audit.controller.ts`
- [ ] T178 [US8] Implement audit log retention policy (90 days normal, 1 year critical) in `libs/backend/domain/admin-security/src/services/audit-log.service.ts`
- [ ] T179 [US8] Implement log rotation in `libs/backend/domain/admin-security/src/services/audit-log.service.ts`
- [ ] T180 [US8] Implement log compression for old logs in `libs/backend/domain/admin-security/src/services/audit-log.service.ts`
- [ ] T181 [US8] Implement `GET /api-admin/v1/security/events` endpoint in `apps/api-admin/src/app/controllers/security.controller.ts`
- [ ] T182 [US8] Implement `GET /api-admin/v1/security/ip-blocks` endpoint in `apps/api-admin/src/app/controllers/security.controller.ts`
- [ ] T183 [US8] Implement `POST /api-admin/v1/security/ip-blocks` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/security.controller.ts`
- [ ] T184 [US8] Implement security check: cannot block current admin IP in `libs/backend/domain/admin-security/src/services/security.service.ts`
- [ ] T185 [US8] Implement `DELETE /api-admin/v1/security/ip-blocks/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/security.controller.ts`
- [ ] T186 [US8] Implement `GET /api-admin/v1/security/threats` endpoint in `apps/api-admin/src/app/controllers/security.controller.ts`
- [ ] T187 [US8] Add Swagger documentation for audit and security endpoints in `apps/api-admin/src/app/controllers/`
- [ ] T188 [US8] Add rate limiting to read endpoints (100 req/min) in `apps/api-admin/src/app/controllers/audit.controller.ts`

**Checkpoint**: Audit logs and security system fully functional and testable independently

---

## Phase 11: User Story 9 - RBAC Management (Priority: P2)

**Goal**: Create and manage roles and permissions

**Independent Test**: Super_admin can create roles, assign permissions, and manage RBAC.

### Implementation for User Story 9

- [ ] T189 [US9] Create `libs/backend/domain/admin-rbac/` directory structure
- [ ] T190 [US9] [P] Create `RbacManagementService` in `libs/backend/domain/admin-rbac/src/services/rbac-management.service.ts`
- [ ] T191 [US9] Create `RbacController` in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T192 [US9] Implement `GET /api-admin/v1/rbac/roles` endpoint in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T193 [US9] Implement `POST /api-admin/v1/rbac/roles` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T194 [US9] Implement `PUT /api-admin/v1/rbac/roles/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T195 [US9] Implement `DELETE /api-admin/v1/rbac/roles/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T196 [US9] Implement `GET /api-admin/v1/rbac/permissions` endpoint in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T197 [US9] Implement `GET /api-admin/v1/rbac/roles/:id/permissions` endpoint in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T198 [US9] Implement `PUT /api-admin/v1/rbac/roles/:id/permissions` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T199 [US9] Implement `GET /api-admin/v1/rbac/users/:userId/roles` endpoint in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T200 [US9] Implement `POST /api-admin/v1/rbac/users/:userId/roles` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T201 [US9] Implement `DELETE /api-admin/v1/rbac/users/:userId/roles/:roleId` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T202 [US9] Implement `POST /api-admin/v1/rbac/check` endpoint in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T203 [US9] Implement `GET /api-admin/v1/rbac/users/:userId/can` endpoint in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T204 [US9] Implement security check: cannot modify system roles in `libs/backend/domain/admin-rbac/src/services/rbac-management.service.ts`
- [ ] T205 [US9] Add Swagger documentation for all RBAC endpoints in `apps/api-admin/src/app/controllers/rbac.controller.ts`
- [ ] T206 [US9] Add rate limiting to write endpoints (20 req/min) in `apps/api-admin/src/app/controllers/rbac.controller.ts`

**Checkpoint**: RBAC management system fully functional and testable independently

---

## Phase 12: User Story 10 - Monitoring & Analytics (Priority: P3)

**Goal**: Integration with Grafana and Prometheus for monitoring and analytics

**Independent Test**: Admin can view Prometheus metrics, create Grafana datasources, and query analytics data.

### Implementation for User Story 10

- [ ] T207 [US10] Create `libs/backend/infrastructure/monitoring/` directory structure
- [ ] T208 [US10] [P] Create `PrometheusService` in `libs/backend/infrastructure/monitoring/src/services/prometheus.service.ts`
- [ ] T209 [US10] [P] Create `GrafanaService` in `libs/backend/infrastructure/monitoring/src/services/grafana.service.ts`
- [ ] T210 [US10] Create `MetricsController` in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T211 [US10] Implement Prometheus metrics export in `libs/backend/infrastructure/monitoring/src/services/prometheus.service.ts`
- [ ] T212 [US10] Implement `GET /api-admin/v1/grafana/datasources` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T213 [US10] Implement `POST /api-admin/v1/grafana/datasources` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T214 [US10] Implement `GET /api-admin/v1/grafana/dashboards` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T215 [US10] Implement `POST /api-admin/v1/grafana/dashboards` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T216 [US10] Implement `GET /api-admin/v1/grafana/query` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T217 [US10] Implement `GET /api-admin/v1/alerts` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T218 [US10] Implement `POST /api-admin/v1/alerts` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T219 [US10] Implement `PUT /api-admin/v1/alerts/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T220 [US10] Implement `POST /api-admin/v1/alerts/:id/trigger` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T221 [US10] Implement `GET /api-admin/v1/analytics/usage` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T222 [US10] Implement `GET /api-admin/v1/analytics/usage/ai` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T223 [US10] Implement `GET /api-admin/v1/analytics/usage/storage` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T224 [US10] Implement `GET /api-admin/v1/analytics/usage/api` endpoint in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T225 [US10] Add Swagger documentation for monitoring endpoints in `apps/api-admin/src/app/controllers/metrics.controller.ts`
- [ ] T226 [US10] Add rate limiting to read endpoints (100 req/min) in `apps/api-admin/src/app/controllers/metrics.controller.ts`

**Checkpoint**: Monitoring and analytics system fully functional and testable independently

---

## Phase 13: User Story 11 - Integrations Management (Priority: P3)

**Goal**: View and manage platform integrations

**Independent Test**: Admin can view integration status, enable/disable providers, and manage credentials.

### Implementation for User Story 11

- [ ] T227 [US11] Create `libs/backend/domain/admin-integrations/` directory structure
- [ ] T228 [US11] [P] Create `IntegrationsManagementService` in `libs/backend/domain/admin-integrations/src/services/integrations-management.service.ts`
- [ ] T229 [US11] Create `IntegrationsController` in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T230 [US11] Implement `GET /api-admin/v1/integrations/providers` endpoint in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T231 [US11] Implement `GET /api-admin/v1/integrations/providers/:id/status` endpoint in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T232 [US11] Implement `POST /api-admin/v1/integrations/providers/:id/enable` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T233 [US11] Implement `POST /api-admin/v1/integrations/providers/:id/disable` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T234 [US11] Implement `GET /api-admin/v1/integrations/health` endpoint in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T235 [US11] Implement `GET /api-admin/v1/integrations/metrics` endpoint in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T236 [US11] Implement `GET /api-admin/v1/integrations/errors` endpoint in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T237 [US11] Implement `GET /api-admin/v1/integrations/credentials` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T238 [US11] Implement `POST /api-admin/v1/integrations/credentials/rotate` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T239 [US11] Implement `POST /api-admin/v1/integrations/credentials/:id/revoke` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T240 [US11] Add Swagger documentation for integrations endpoints in `apps/api-admin/src/app/controllers/integrations.controller.ts`
- [ ] T241 [US11] Add rate limiting to write endpoints (20 req/min) in `apps/api-admin/src/app/controllers/integrations.controller.ts`

**Checkpoint**: Integrations management system fully functional and testable independently

---

## Phase 14: User Story 12 - Pipelines/Workflows/Workers Management (Priority: P3)

**Goal**: Manage pipelines, workflows, and workers

**Independent Test**: Admin can view pipelines/workflows/workers, pause/resume them, and view logs.

### Implementation for User Story 12

- [ ] T242 [US12] Create `libs/backend/domain/admin-automation/` directory structure
- [ ] T243 [US12] [P] Create `PipelinesManagementService` in `libs/backend/domain/admin-automation/src/services/pipelines-management.service.ts`
- [ ] T244 [US12] [P] Create `WorkflowsManagementService` in `libs/backend/domain/admin-automation/src/services/workflows-management.service.ts`
- [ ] T245 [US12] [P] Create `WorkersManagementService` in `libs/backend/domain/admin-automation/src/services/workers-management.service.ts`
- [ ] T246 [US12] Create `PipelinesController` in `apps/api-admin/src/app/controllers/pipelines.controller.ts`
- [ ] T247 [US12] Create `WorkflowsController` in `apps/api-admin/src/app/controllers/workflows.controller.ts`
- [ ] T248 [US12] Create `WorkersController` in `apps/api-admin/src/app/controllers/workers.controller.ts`
- [ ] T249 [US12] Implement `GET /api-admin/v1/pipelines` endpoint in `apps/api-admin/src/app/controllers/pipelines.controller.ts`
- [ ] T250 [US12] Implement `GET /api-admin/v1/pipelines/:id` endpoint in `apps/api-admin/src/app/controllers/pipelines.controller.ts`
- [ ] T251 [US12] Implement `POST /api-admin/v1/pipelines/:id/pause` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/pipelines.controller.ts`
- [ ] T252 [US12] Implement `POST /api-admin/v1/pipelines/:id/resume` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/pipelines.controller.ts`
- [ ] T253 [US12] Implement `DELETE /api-admin/v1/pipelines/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/pipelines.controller.ts`
- [ ] T254 [US12] Implement `GET /api-admin/v1/workflows` endpoint in `apps/api-admin/src/app/controllers/workflows.controller.ts`
- [ ] T255 [US12] Implement `GET /api-admin/v1/workflows/:id/executions` endpoint in `apps/api-admin/src/app/controllers/workflows.controller.ts`
- [ ] T256 [US12] Implement `GET /api-admin/v1/workflows/:id/metrics` endpoint in `apps/api-admin/src/app/controllers/workflows.controller.ts`
- [ ] T257 [US12] Implement `GET /api-admin/v1/workers` endpoint in `apps/api-admin/src/app/controllers/workers.controller.ts`
- [ ] T258 [US12] Implement `GET /api-admin/v1/workers/:id/status` endpoint in `apps/api-admin/src/app/controllers/workers.controller.ts`
- [ ] T259 [US12] Implement `POST /api-admin/v1/workers/:id/restart` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/workers.controller.ts`
- [ ] T260 [US12] Add Swagger documentation for automation endpoints in `apps/api-admin/src/app/controllers/`
- [ ] T261 [US12] Add rate limiting to write endpoints (20 req/min) in `apps/api-admin/src/app/controllers/`

**Checkpoint**: Pipelines/Workflows/Workers management system fully functional and testable independently

---

## Phase 15: User Story 13 - API Keys Management (Priority: P2)

**Goal**: Manage API keys for platform access

**Independent Test**: Super_admin can create, view, and revoke API keys.

### Implementation for User Story 13

- [ ] T262 [US13] Create `ApiKeysController` in `apps/api-admin/src/app/controllers/api-keys.controller.ts`
- [ ] T263 [US13] Implement `GET /api-admin/v1/api-keys` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/api-keys.controller.ts`
- [ ] T264 [US13] Implement `POST /api-admin/v1/api-keys` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/api-keys.controller.ts`
- [ ] T265 [US13] Implement `DELETE /api-admin/v1/api-keys/:id` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/api-keys.controller.ts`
- [ ] T266 [US13] Implement `GET /api-admin/v1/api-keys/:id/usage` endpoint (super_admin only) in `apps/api-admin/src/app/controllers/api-keys.controller.ts`
- [ ] T267 [US13] Add Swagger documentation for API keys endpoints in `apps/api-admin/src/app/controllers/api-keys.controller.ts`
- [ ] T268 [US13] Add rate limiting to write endpoints (20 req/min) in `apps/api-admin/src/app/controllers/api-keys.controller.ts`

**Checkpoint**: API keys management system fully functional and testable independently

---

## Phase 16: Final Phase - Polish & Cross-Cutting Concerns

**Purpose**: Final polish, optimization, and cross-cutting concerns

### Type Safety & Code Quality

- [ ] T269 [P] Remove all `as` type assertions from `apps/api-admin/src/`
- [ ] T270 [P] Remove all `any` types from `apps/api-admin/src/` (except documented exceptions)
- [ ] T271 [P] Add type guards where needed in `apps/api-admin/src/`
- [ ] T272 [P] Run TypeScript type check: `nx run api-admin:typecheck`
- [ ] T273 [P] Run linter: `nx run api-admin:lint`
- [ ] T274 [P] Fix all linting errors

### Testing

- [ ] T275 [P] Write unit tests for all services (minimum 85% coverage for shared libraries)
- [ ] T276 [P] Write integration tests for all controllers
- [ ] T277 [P] Write security tests for all endpoints
- [ ] T278 [P] Run all tests: `nx test api-admin`
- [ ] T279 [P] Verify test coverage meets requirements

### Documentation

- [ ] T280 [P] Update Swagger documentation for all endpoints
- [ ] T281 [P] Verify all endpoints have proper Swagger annotations
- [ ] T282 [P] Update README.md with new endpoints
- [ ] T283 [P] Create API documentation in `apps/api-admin/.specs/API.md`

### Performance & Optimization

- [ ] T284 [P] Verify Redis caching is working for metrics and dashboard
- [ ] T285 [P] Verify pagination is implemented for all list endpoints
- [ ] T286 [P] Verify performance requirements are met (response times)
- [ ] T287 [P] Add database indexes if needed

### Security Review

- [ ] T288 [P] Review all security checks are implemented
- [ ] T289 [P] Verify audit logging is working for all operations
- [ ] T290 [P] Verify rate limiting is configured correctly
- [ ] T291 [P] Verify IP whitelist is working
- [ ] T292 [P] Verify secrets are masked in responses

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-15)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Foundational
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 16)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Admin Authentication**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1) - Admin Management**: Can start after Foundational - Depends on US1 (uses AdminAuthService)
- **User Story 3 (P1) - Services Management**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (P1) - Dashboard**: Can start after Foundational - May use US3 for service data
- **User Story 5 (P1) - Basic RBAC**: Can start after Foundational - Depends on US1 (uses AdminRoleGuard)
- **User Story 6 (P2) - Billing**: Can start after Foundational - No dependencies on other stories
- **User Story 7 (P2) - Database Access**: Can start after Foundational - No dependencies on other stories
- **User Story 8 (P2) - Audit Logs**: Can start after Foundational - Should be integrated early for logging
- **User Story 9 (P2) - RBAC Management**: Can start after Foundational - Depends on US5
- **User Story 10 (P3) - Monitoring**: Can start after Foundational - May use US3, US4
- **User Story 11 (P3) - Integrations**: Can start after Foundational - No dependencies on other stories
- **User Story 12 (P3) - Automation**: Can start after Foundational - No dependencies on other stories
- **User Story 13 (P2) - API Keys**: Can start after Foundational - No dependencies on other stories

### Within Each User Story

- Models before services
- Services before controllers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Tasks marked [P] within a story can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Can run in parallel:
- T024 [US1] Update AuthController
- T025 [US1] Replace User references with Admin
- T026 [US1] Implement register endpoint
- T027 [US1] Implement login endpoint
```

---

## Parallel Example: User Story 2

```bash
# Can run in parallel:
- T052 [US2] Create AdminManagementService
- T088 [US2] Implement GET /admins endpoint
- T088 [US2] Implement GET /admins/:id endpoint
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Admin Authentication)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication)
   - Developer B: User Story 3 (Services Management)
   - Developer C: User Story 4 (Dashboard)
3. Stories complete and integrate independently

---

## Summary

- **Total Tasks**: 292
- **Tasks per User Story**:
  - US1 (Admin Authentication): 28 tasks
  - US2 (Admin Management): 37 tasks
  - US3 (Services Management): 19 tasks
  - US4 (Dashboard): 12 tasks
  - US5 (Basic RBAC): 5 tasks
  - US6 (Billing): 24 tasks
  - US7 (Database Access): 19 tasks
  - US8 (Audit Logs & Security): 22 tasks
  - US9 (RBAC Management): 18 tasks
  - US10 (Monitoring): 20 tasks
  - US11 (Integrations): 15 tasks
  - US12 (Automation): 20 tasks
  - US13 (API Keys): 7 tasks
  - Polish: 24 tasks
  - Setup: 4 tasks
  - Foundational: 18 tasks

- **Parallel Opportunities**: Many tasks marked [P] can run in parallel
- **Independent Test Criteria**: Each user story has clear test criteria
- **Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 - Admin Authentication)
- **Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, labels, file paths)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
