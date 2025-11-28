# Admin API - Security Cases

**Version**: 1.0
**Date**: 2025-11-27
**Status**: Planning

## Overview

Document describes all security cases for Admin API, including endpoint protection, access control checks, and business rules.

## Security Principles

1. **Least privilege** - each admin has only necessary permissions
2. **Self-destruction protection** - cannot delete/block yourself
3. **Critical operations protection** - super_admin operations require additional checks
4. **Audit logging** - all actions are logged
5. **IP Whitelist** - required for super_admin
6. **2FA mandatory** - 2FA required for super_admin

## Security Cases by Category

### 1. Admin Registration

#### Case 1.1: Register New Admin

- **Endpoint**: `POST /api-admin/v1/auth/register`
- **Requirements**:
  - ✅ Only `super_admin` can create admins
  - ✅ Requires `AdminJwtGuard` authorization
  - ✅ Role check via `AdminRoleGuard` with `ADMIN_ROLES_KEY: ['super_admin']`
  - ✅ Creator must be active (`isActive = true`)
  - ✅ Creator must not be locked (`lockedUntil = null`)
- **Protection**:
  ```typescript
  @Post('register')
  @UseGuards(AdminJwtGuard, AdminRoleGuard)
  @SetMetadata(ADMIN_ROLES_KEY, ['super_admin'])
  async register(@Body() dto: AdminRegisterDto, @Request() req: AdminRequest)
  ```
- **Business Rules**:
  - Email must be unique
  - Password must meet requirements (min 12 characters)
  - Default role: `admin` (cannot create `super_admin` via API)
  - Audit log: records who created admin

#### Case 1.2: Registration Attempt Without Authorization

- **Protection**: Endpoint protected by `AdminJwtGuard` - access denied without token
- **Result**: `401 Unauthorized`

#### Case 1.3: Registration Attempt by Regular Admin

- **Protection**: `AdminRoleGuard` checks role - only `super_admin`
- **Result**: `403 Forbidden`

#### Case 1.4: Attempt to Create super_admin via API

- **Protection**: DTO validation - `super_admin` role cannot be set via API
- **Result**: `400 Bad Request` - "Cannot create super_admin through API"

### 2. Admin Management

#### Case 2.1: View Admin List

- **Endpoint**: `GET /api-admin/v1/admins`
- **Requirements**:
  - ✅ Requires authorization
  - ✅ `admin` and above can view
- **Limitations**:
  - Regular `admin` sees only `admin` (not `super_admin`)
  - `super_admin` sees all
  - Blocked admins not shown (optional, via filter)

#### Case 2.2: View Admin Details

- **Endpoint**: `GET /api-admin/v1/admins/:adminId`
- **Requirements**:
  - ✅ Requires authorization
  - ✅ `admin` can view only other `admin`
  - ✅ `super_admin` can view all
- **Protection**:
  - Check requester has permission to see this admin
  - `passwordHash` not shown in response

#### Case 2.3: Update Admin

- **Endpoint**: `PUT /api-admin/v1/admins/:adminId`
- **Requirements**:
  - ✅ Requires authorization
  - ✅ `admin` can update only other `admin` (not `super_admin`)
  - ✅ `super_admin` can update all
  - ❌ Cannot update yourself (use separate profile endpoint)
- **Protection**:
  - Check `adminId !== currentAdminId`
  - Check target admin role
  - Audit log: records who changed what

#### Case 2.4: Change Admin Role

- **Endpoint**: `PUT /api-admin/v1/admins/:adminId/role`
- **Requirements**:
  - ✅ Only `super_admin` can change roles
  - ❌ Cannot change last `super_admin` role
  - ❌ Cannot change own role
  - ❌ Cannot create `super_admin` via API (only manually in DB)
- **Protection**:
  ```typescript
  const superAdminCount = await prisma.admin.count({
    where: { role: 'super_admin', isActive: true },
  });
  if (superAdminCount <= 1 && targetAdmin.role === 'super_admin') {
    throw new ForbiddenException('Cannot change role of last super_admin');
  }
  ```

#### Case 2.5: Delete Admin

- **Endpoint**: `DELETE /api-admin/v1/admins/:adminId`
- **Requirements**:
  - ✅ Only `super_admin` can delete
  - ❌ Cannot delete yourself
  - ❌ Cannot delete last `super_admin`
  - ❌ Cannot delete active admin (block first)
- **Protection**:
  ```typescript
  if (adminId === currentAdminId) {
    throw new ForbiddenException('Cannot delete yourself');
  }
  if (targetAdmin.role === 'super_admin') {
    const superAdminCount = await prisma.admin.count({
      where: { role: 'super_admin', isActive: true },
    });
    if (superAdminCount <= 1) {
      throw new ForbiddenException('Cannot delete last super_admin');
    }
  }
  ```

### 3. Admin Blocking

#### Case 3.1: Block Admin

- **Endpoint**: `POST /api-admin/v1/admins/:adminId/block`
- **Requirements**:
  - ✅ `admin` can block only other `admin`
  - ✅ `super_admin` can block all
  - ❌ Cannot block yourself
  - ❌ Cannot block last `super_admin`
- **Protection**:
  - Check `adminId !== currentAdminId`
  - Check not last `super_admin`
  - Revoke all active sessions of blocked admin
  - Audit log

#### Case 3.2: Unblock Admin

- **Endpoint**: `POST /api-admin/v1/admins/:adminId/unblock`
- **Requirements**:
  - ✅ Only `super_admin` can unblock
  - ✅ Can unblock any admin

### 4. Session Management

#### Case 4.1: View Admin Sessions

- **Endpoint**: `GET /api-admin/v1/admins/:adminId/sessions`
- **Requirements**:
  - ✅ Admin can view only own sessions
  - ✅ `super_admin` can view all sessions
- **Protection**:
  ```typescript
  if (currentAdmin.role !== 'super_admin' && adminId !== currentAdminId) {
    throw new ForbiddenException('Can only view own sessions');
  }
  ```

#### Case 4.2: Revoke Session

- **Endpoint**: `DELETE /api-admin/v1/admins/:adminId/sessions/:sessionId`
- **Requirements**:
  - ✅ Admin can revoke only own sessions
  - ✅ `super_admin` can revoke all sessions
  - ❌ Cannot revoke current session (use `/auth/sessions/:sessionId`)
- **Protection**:
  - Check session belongs to admin
  - Check not current session (if admin revokes own)

### 5. IP Whitelist

#### Case 5.1: View IP Whitelist

- **Endpoint**: `GET /api-admin/v1/admins/:adminId/ip-whitelist`
- **Requirements**:
  - ✅ Admin can view only own IP whitelist
  - ✅ `super_admin` can view all IP whitelists
- **Protection**: Access permission check

#### Case 5.2: Add IP to Whitelist

- **Endpoint**: `POST /api-admin/v1/admins/:adminId/ip-whitelist`
- **Requirements**:
  - ✅ Only `super_admin` can manage IP whitelist
  - ✅ IP must be valid (IPv4 or IPv6)
  - ✅ Cannot add IP if whitelist not enabled
- **Protection**:
  ```typescript
  @UseGuards(AdminJwtGuard, AdminRoleGuard)
  @SetMetadata(ADMIN_ROLES_KEY, ['super_admin'])
  ```

#### Case 5.3: Enable IP Whitelist

- **Endpoint**: `POST /api-admin/v1/admins/:adminId/ip-whitelist/toggle`
- **Requirements**:
  - ✅ Only `super_admin` can enable/disable IP whitelist
  - ✅ At least one IP must exist before enabling
- **Protection**: Check IP exists before enabling

### 6. Services Management

#### Case 6.1: View Services Status

- **Endpoint**: `GET /api-admin/v1/services`
- **Requirements**:
  - ✅ Requires authorization
  - ✅ `admin` and above can view
- **Limitations**: Secret configurations not shown

#### Case 6.2: Restart Service

- **Endpoint**: `POST /api-admin/v1/services/:serviceId/restart`
- **Requirements**:
  - ✅ Only `super_admin` can restart services
  - ❌ Cannot restart api-admin (self)
- **Protection**:
  ```typescript
  if (serviceId === 'api-admin') {
    throw new ForbiddenException('Cannot restart api-admin service');
  }
  ```

#### Case 6.3: View Service Configuration

- **Endpoint**: `GET /api-admin/v1/services/:serviceId/config`
- **Requirements**:
  - ✅ Only `super_admin` can view configuration
  - ❌ Secrets not shown (JWT_SECRET, DATABASE_URL, etc.)
- **Protection**: Mask secrets: `JWT_SECRET=***`, `DATABASE_URL=postgresql://***`

#### Case 6.4: Update Configuration

- **Endpoint**: `PUT /api-admin/v1/services/:serviceId/config`
- **Requirements**:
  - ✅ Only `super_admin` can update configuration
  - ❌ Cannot update secrets via API (only via env files)
  - ✅ Configuration validation before applying
- **Protection**:
  - Check not attempting to change secrets
  - Audit log: records configuration change

### 7. Database Access

#### Case 7.1: View Database Status

- **Endpoint**: `GET /api-admin/v1/databases/:dbName/status`
- **Requirements**:
  - ✅ Only `super_admin` can view DB status
  - ❌ Connection string not shown
- **Protection**: Mask connection string

#### Case 7.2: View Database Data

- **Endpoint**: `GET /api-admin/v1/databases/:dbName/tables`
- **Requirements**:
  - ✅ Only `super_admin` can view tables
  - ❌ Cannot execute arbitrary SQL queries
- **Protection**:
  - Read-only operations only
  - No DELETE, UPDATE, DROP capability

#### Case 7.3: Create Backup

- **Endpoint**: `POST /api-admin/v1/databases/:dbName/backup`
- **Requirements**:
  - ✅ Only `super_admin` can create backups
  - ✅ Backup created asynchronously
  - ✅ Audit log: records backup creation

### 8. Billing Management

#### Case 8.1: View Subscriptions

- **Endpoint**: `GET /api-admin/v1/billing/subscriptions`
- **Requirements**:
  - ✅ `admin` and above can view
  - ❌ Card data, CVV not shown
- **Protection**: Mask card data: `**** **** **** 1234`

#### Case 8.2: Block User Payments

- **Endpoint**: `POST /api-admin/v1/billing/users/:userId/payments/block`
- **Requirements**:
  - ✅ Only `super_admin` can block payments
  - ✅ Audit log: records blocking
- **Protection**:
  - Check user exists
  - Notify user of blocking

#### Case 8.3: Change Subscription Plan

- **Endpoint**: `PUT /api-admin/v1/billing/subscriptions/:subscriptionId/plan`
- **Requirements**:
  - ✅ Only `super_admin` can change plans
  - ✅ New plan validation
  - ✅ Audit log: records plan change

### 9. RBAC Management

#### Case 9.1: Create Role

- **Endpoint**: `POST /api-admin/v1/rbac/roles`
- **Requirements**:
  - ✅ Only `super_admin` can create roles
  - ❌ Cannot create role named `super_admin` or `admin`
- **Protection**:
  - Role name validation
  - Check role doesn't exist

#### Case 9.2: Change Role Permissions

- **Endpoint**: `PUT /api-admin/v1/rbac/roles/:roleId/permissions`
- **Requirements**:
  - ✅ Only `super_admin` can change permissions
  - ❌ Cannot change `super_admin` role permissions
  - ❌ Cannot remove all permissions from `admin` role
- **Protection**:
  - Check role not system role
  - Permission validation

### 10. Audit Logs

#### Case 10.1: View Audit Logs

- **Endpoint**: `GET /api-admin/v1/audit/logs`
- **Requirements**:
  - ✅ `admin` and above can view
  - ✅ `support` can view only own actions
  - ❌ Secret data not shown in details
- **Protection**:
  - Filter by role
  - Mask secrets in details

#### Case 10.2: Export Audit Logs

- **Endpoint**: `GET /api-admin/v1/audit/export`
- **Requirements**:
  - ✅ Only `super_admin` can export logs
  - ✅ Export only last 90 days
- **Protection**:
  - Export period limit
  - Rate limiting on export

### 11. Security

#### Case 11.1: Block IP

- **Endpoint**: `POST /api-admin/v1/security/ip-blocks`
- **Requirements**:
  - ✅ Only `super_admin` can block IP
  - ❌ Cannot block current admin IP
  - ✅ IP address validation
- **Protection**:
  - Check IP is valid
  - Check not blocking own IP

#### Case 11.2: View Security Events

- **Endpoint**: `GET /api-admin/v1/security/events`
- **Requirements**:
  - ✅ `admin` and above can view
  - ✅ Filter by severity (critical, high, medium, low)
- **Protection**: Pagination for large data volumes

### 12. Password Change

#### Case 12.1: Change Own Password

- **Endpoint**: `POST /api-admin/v1/auth/change-password`
- **Requirements**:
  - ✅ Requires current password
  - ✅ New password must be strong
  - ✅ Revoke all other sessions except current
- **Protection**:
  - Check current password
  - Validate new password

#### Case 12.2: Reset Another Admin's Password

- **Endpoint**: `POST /api-admin/v1/admins/:adminId/password-reset`
- **Requirements**:
  - ✅ Only `super_admin` can reset other passwords
  - ❌ Cannot reset own password (use change-password)
  - ✅ Generate temporary password
  - ✅ Send password to admin email
- **Protection**:
  - Check `adminId !== currentAdminId`
  - Audit log: records password reset

### 13. 2FA Management

#### Case 13.1: Enable 2FA (TOTP)

- **Endpoint**: `POST /api-admin/v1/auth/2fa/enable`
- **Requirements**:
  - ✅ Admin can enable 2FA only for self
  - ✅ 2FA mandatory for `super_admin` (cannot disable)
  - ✅ Method: `totp` requires secret and verification code
- **Protection**:
  ```typescript
  if (currentAdmin.role === 'super_admin' && !twoFactorEnabled) {
    throw new ForbiddenException('2FA is required for super_admin');
  }
  ```

#### Case 13.2: Enable 2FA (Telegram)

- **Endpoint**: `POST /api-admin/v1/auth/2fa/enable`
- **Requirements**:
  - ✅ Method: `telegram` requires active Telegram integration
  - ✅ Telegram chat ID must be verified
  - ✅ Admin can enable only for self
  - ✅ 2FA mandatory for `super_admin`
- **Protection**:
  - Verify Telegram integration exists and is active
  - Send test code to verify chat ID
  - Check role restrictions

#### Case 13.3: Disable 2FA

- **Endpoint**: `DELETE /api-admin/v1/auth/2fa/disable`
- **Requirements**:
  - ✅ Admin can disable 2FA only for self
  - ❌ `super_admin` cannot disable 2FA
  - ✅ Only `super_admin` can disable another admin's 2FA
- **Protection**:
  - Check role
  - Check not attempting to disable super_admin 2FA

#### Case 13.4: Telegram 2FA Login Flow

- **Endpoints**:
  - `POST /api-admin/v1/auth/login` (returns `requires2FA: true, method: 'telegram'`)
  - `POST /api-admin/v1/auth/2fa/telegram/send-code` (sends code to Telegram)
  - `POST /api-admin/v1/auth/2fa/verify` (verifies code)
- **Requirements**:
  - ✅ Code sent to Telegram chat (6-digit, expires in 5 minutes)
  - ✅ Rate limiting: 3 codes per 10 minutes
  - ✅ Code can be used only once
- **Protection**:
  - Verify Telegram integration is active
  - Check code expiration
  - Prevent code reuse
  - Rate limit code generation

### 14. Attack Protection

#### Case 14.1: Brute Force Protection

- **Endpoint**: `POST /api-admin/v1/auth/login`
- **Protection**:
  - Rate limiting: 5 attempts per minute
  - Block after 5 failed attempts for 15 minutes
  - Increase block time on repeated attempts
- **Implementation**:
  ```typescript
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @UseGuards(ThrottlerGuard)
  ```

#### Case 14.2: SQL Injection Protection

- **Protection**:
  - Use Prisma (parameterized queries)
  - Validate all input data
  - Type guards for all parameters

#### Case 14.3: XSS Protection

- **Protection**:
  - Validate all string inputs
  - Sanitize HTML in responses
  - Content Security Policy headers

#### Case 14.4: CSRF Protection

- **Protection**:
  - Use JWT tokens (not cookies)
  - Check Origin header
  - SameSite cookies (if used)

### 15. Special Cases

#### Case 15.1: First super_admin

- **Problem**: How to create first super_admin if registration requires super_admin?
- **Solution**:
  - First super_admin created manually in DB or via seed script
  - Seed script runs only on DB initialization
  - After first super_admin created, API registration available only to them

#### Case 15.2: Last super_admin Blocked

- **Problem**: What if last super_admin is blocked?
- **Solution**:
  - Check before blocking: cannot block last super_admin
  - If all super_admin blocked, unblock via direct DB access
  - Access recovery documentation

#### Case 15.3: Lost 2FA Access

- **Problem**: What if super_admin lost access to 2FA device?
- **Solution**:
  - Backup codes for recovery
  - If backup codes lost, another super_admin can disable 2FA
  - If no other super_admin, recovery via direct DB access

#### Case 15.4: IP Whitelist Blocks Access

- **Problem**: What if IP whitelist blocks super_admin access?
- **Solution**:
  - IP whitelist check only when flag enabled
  - If whitelist blocks, can disable via direct DB access
  - Access recovery documentation

## Endpoint Protection Matrix

| Endpoint                                 | Guard          | Role Check  | Additional Checks              |
| ---------------------------------------- | -------------- | ----------- | ------------------------------ |
| `POST /auth/register`                    | AdminJwtGuard  | super_admin | Active, not locked             |
| `POST /auth/login`                       | ThrottlerGuard | -           | IP whitelist, 2FA              |
| `GET /auth/me`                           | AdminJwtGuard  | -           | -                              |
| `GET /admins`                            | AdminJwtGuard  | admin+      | Filter by role                 |
| `GET /admins/:id`                        | AdminJwtGuard  | admin+      | Permission to see admin        |
| `PUT /admins/:id`                        | AdminJwtGuard  | admin+      | Not self, target role          |
| `PUT /admins/:id/role`                   | AdminJwtGuard  | super_admin | Not last super_admin           |
| `DELETE /admins/:id`                     | AdminJwtGuard  | super_admin | Not self, not last super_admin |
| `POST /admins/:id/block`                 | AdminJwtGuard  | admin+      | Not self, not last super_admin |
| `GET /services`                          | AdminJwtGuard  | admin+      | -                              |
| `POST /services/:id/restart`             | AdminJwtGuard  | super_admin | Not api-admin                  |
| `GET /databases/:name/status`            | AdminJwtGuard  | super_admin | -                              |
| `POST /billing/users/:id/payments/block` | AdminJwtGuard  | super_admin | -                              |
| `POST /rbac/roles`                       | AdminJwtGuard  | super_admin | Name validation                |
| `GET /audit/logs`                        | AdminJwtGuard  | admin+      | Filter by role                 |

## Implementation Recommendations

1. **Use Guards**:

   - `AdminJwtGuard` - for all protected endpoints
   - `AdminRoleGuard` - for role checks
   - `ThrottlerGuard` - for rate limiting

2. **Use Decorators**:

   - `@SetMetadata(ADMIN_ROLES_KEY, ['super_admin'])` - specify required roles
   - `@Throttle()` - configure rate limiting

3. **Data Validation**:

   - Use DTOs with class-validator
   - Type guards for all parameters
   - UUID format check for IDs

4. **Audit Logging**:

   - Log all changes
   - Include: who, what, when, where (IP)
   - Don't log secrets

5. **Error Handling**:
   - Don't expose error details in production
   - Unified error format
   - Log all errors

## Security Testing

1. **Unit Tests**:

   - Guard checks
   - Business rule checks
   - Validation checks

2. **Integration Tests**:

   - Access without token
   - Access with wrong role
   - Self-destruction protection
   - Last super_admin protection

3. **Security Tests**:
   - SQL Injection tests
   - XSS tests
   - CSRF tests
   - Brute Force tests
