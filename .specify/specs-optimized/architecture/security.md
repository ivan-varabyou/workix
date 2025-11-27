# Security Architecture

**Version**: 3.0

## Overview

Multi-layer security: Authentication → Authorization → Rate Limiting → Audit Logging.

## Authentication Methods

### JWT Authentication

**Location**: `libs/domain/auth`

**Features**:
- JWT token generation and validation
- Token expiration (configurable)
- JWT blacklist for logout
- Refresh tokens

**Usage**:
```typescript
@UseGuards(JwtGuard)
@Get('/protected')
getProtected(@CurrentUser('userId') userId: string) {}
```

**Configuration**:
- `JWT_SECRET`: Required, minimum 32 characters
- `JWT_EXPIRES_IN`: Token expiration time

### OAuth2

**Providers**: Google, GitHub, Apple

**Location**: `libs/domain/auth/src/oauth2/`

**Features**:
- OAuth2 flow implementation
- Provider-specific strategies
- Token refresh

**Configuration**:
- `AUTH_ENABLE_OAUTH2`: Enable OAuth2
- `AUTH_ENABLE_OAUTH2_GOOGLE`: Enable Google
- `AUTH_ENABLE_OAUTH2_GITHUB`: Enable GitHub
- `AUTH_ENABLE_OAUTH2_APPLE`: Enable Apple

### Two-Factor Authentication (2FA)

**Location**: `libs/domain/auth/src/services/two-factor.service.ts`

**Features**:
- TOTP-based 2FA
- QR code generation
- Backup codes

**Configuration**:
- `AUTH_ENABLE_2FA`: Enable 2FA

### Phone OTP

**Location**: `libs/domain/auth/src/phone-otp/`

**Features**:
- SMS-based OTP
- OTP generation and validation
- Rate limiting for OTP requests

**Configuration**:
- `AUTH_ENABLE_PHONE_OTP`: Enable Phone OTP
- Requires SMS provider configuration

### Email Verification

**Location**: `libs/domain/auth/src/services/email-verification.service.ts`

**Features**:
- Email verification tokens
- Verification link generation

**Configuration**:
- `AUTH_ENABLE_EMAIL_VERIFICATION`: Enable email verification

## Authorization (RBAC)

**Location**: `libs/domain/rbac`

**Features**:
- Role-based access control
- Permission-based access control
- Role assignment to users
- Permission assignment to roles

**Usage**:
```typescript
@UseGuards(JwtGuard, RoleGuard)
@Roles('admin', 'moderator')
@Get('/admin')
getAdmin() {}
```

**Guards**:
- `RoleGuard`: Checks user roles
- `HasPermission`: Checks user permissions

**Decorators**:
- `@Roles('admin', 'moderator')`: Require roles
- `@HasPermission('users.create')`: Require permission

## API Keys

**Location**: `libs/infrastructure/api-keys`

**Features**:
- API key generation
- API key validation
- Permission-based API keys
- Rate limiting per API key

**Usage**:
```typescript
@UseGuards(ApiKeyGuard)
@RequirePermission('pipelines.read')
@Get('/pipelines')
getPipelines() {}
```

## Rate Limiting

**Location**: `libs/domain/auth/src/middleware/rate-limit.middleware.ts`

**Limits**:
- Login/Register: 5 requests/minute
- Password Reset: 3 requests/minute
- 2FA: 10 requests/minute
- General: 100 requests/minute

**Configuration**:
- `RATE_LIMIT_TTL`: Time window (default: 60000ms)
- `RATE_LIMIT_MAX`: Max requests per window
- `RATE_LIMIT_AUTH_TTL`: Auth-specific TTL
- `RATE_LIMIT_AUTH_MAX`: Auth-specific max

## Security Headers

**Headers**:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

**Implementation**: Applied at API Gateway level

## Audit Logging

**Location**: `libs/domain/audit-logs`

**Events Logged**:
- Authentication events (login, logout, failed login)
- Authorization events (role changes, permission changes)
- Data access events (read, write, delete)
- Security events (suspicious activity, rate limit exceeded)

**Fields**:
- User ID
- Action
- Resource
- Timestamp
- IP address
- User agent

## Public Endpoints

**Decorator**: `@Public()`

**Usage**:
```typescript
@Public()
@Post('/register')
register(@Body() dto: RegisterDto) {}
```

**Public Endpoints**:
- `/auth/register`
- `/auth/login`
- `/auth/verify`
- `/health`
- Public pipelines/templates

## Security Best Practices

### Required
- ✅ JWT_SECRET minimum 32 characters
- ✅ HTTPS in production
- ✅ Rate limiting on all endpoints
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection
- ✅ CSRF protection

### Recommended
- ✅ 2FA for admin accounts
- ✅ API keys for service-to-service communication
- ✅ Audit logging for sensitive operations
- ✅ Regular security audits
- ✅ Penetration testing

## Related

- [Authentication Library](../core/libraries.md#auth)
- [RBAC Library](../core/libraries.md#rbac)
- [API Keys](../core/libraries.md#api-keys)
- [Development Process](../core/development.md)



