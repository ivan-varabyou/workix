# API Auth Service - All Endpoints

**Base URL**: `http://localhost:7102/api-auth/v1`

**Swagger UI**: `http://localhost:7102/docs`

---

## 🔐 Authentication Endpoints (`/auth`)

### POST `/auth/register`
- **Description**: Register new user account
- **Auth**: Public
- **Body**: `RegisterDto` (email, name, password)
- **Response**: `RegisterResponseDto`

### POST `/auth/login`
- **Description**: Authenticate user and get JWT tokens
- **Auth**: Public
- **Body**: `LoginDto` (email, password)
- **Response**: `LoginResponseDto` (accessToken, refreshToken, user)

### POST `/auth/verify`
- **Description**: Verify JWT access token
- **Auth**: Public
- **Body**: `VerifyTokenDto` (token)
- **Response**: Token verification result

### POST `/auth/refresh`
- **Description**: Refresh access token using refresh token
- **Auth**: Public
- **Body**: `RefreshTokenDto` (refreshToken)
- **Response**: `RefreshTokenResponseDto` (new accessToken, refreshToken)

### POST `/auth/logout`
- **Description**: Logout user (invalidate tokens)
- **Auth**: Bearer Token (JWT)
- **Body**: `RefreshTokenDto` (refreshToken)
- **Response**: `LogoutResponseDto`

### GET `/auth/me`
- **Description**: Get current authenticated user profile
- **Auth**: Bearer Token (JWT)
- **Response**: User profile data

### GET `/auth/health`
- **Description**: Health check endpoint
- **Auth**: Public
- **Response**: `HealthCheckResponseDto` (status, timestamp)

---

## 🔑 Password Reset Endpoints (`/auth/password-reset`)

### POST `/auth/password-reset/request`
- **Description**: Request password reset (sends email with reset link)
- **Auth**: Public
- **Body**: `RequestPasswordResetDto` (email)
- **Response**: Success message

### POST `/auth/password-reset/verify`
- **Description**: Verify password reset token
- **Auth**: Public
- **Body**: `VerifyResetTokenDto` (token)
- **Response**: `VerifyResetTokenResponseDto` (valid, expiresAt)

### POST `/auth/password-reset/confirm`
- **Description**: Confirm password reset with new password
- **Auth**: Public
- **Body**: `ResetPasswordDto` (token, newPassword)
- **Response**: `ResetPasswordResponseDto`

---

## 🔒 Two-Factor Authentication (2FA) Endpoints (`/auth/2fa`)

### POST `/auth/2fa/generate`
- **Description**: Generate 2FA secret and QR code
- **Auth**: Bearer Token (JWT)
- **Response**: `Generate2FASecretResponseDto` (secret, qrCode)

### POST `/auth/2fa/enable`
- **Description**: Enable 2FA for user account
- **Auth**: Bearer Token (JWT)
- **Body**: `Enable2FADto` (totpCode)
- **Response**: `Enable2FAResponseDto` (backupCodes)

### POST `/auth/2fa/verify`
- **Description**: Verify 2FA TOTP code during login
- **Auth**: Public
- **Body**: `VerifyTotpDto` (email, totpCode, accessToken)
- **Response**: `Verify2FAResponseDto` (tokens, user)

### DELETE `/auth/2fa/disable`
- **Description**: Disable 2FA for user account
- **Auth**: Bearer Token (JWT)
- **Body**: `VerifyTotpDto` (totpCode)
- **Response**: `Disable2FAResponseDto`

### GET `/auth/2fa/status`
- **Description**: Get 2FA status for current user
- **Auth**: Bearer Token (JWT)
- **Response**: `Get2FAStatusResponseDto` (enabled, backupCodesCount)

### POST `/auth/2fa/regenerate-backup-codes`
- **Description**: Regenerate 2FA backup codes
- **Auth**: Bearer Token (JWT)
- **Body**: `VerifyTotpDto` (totpCode)
- **Response**: `RegenerateBackupCodesResponseDto` (backupCodes)

---

## 🛡️ Security Code Endpoints (`/auth/security`)

### POST `/auth/security/verify-code`
- **Description**: Verify security code sent via email (for suspicious login)
- **Auth**: Public
- **Body**: `VerifySecurityCodeRequestDto` (email, code, accessToken)
- **Response**: `LoginResponseDto` (tokens, user)

### POST `/auth/security/resend-code`
- **Description**: Resend security code to email
- **Auth**: Public
- **Body**: `ResendSecurityCodeRequestDto` (email, accessToken)
- **Response**: `ResendSecurityCodeResponseDto`

---

## 📧 Email Verification Endpoints (`/auth/email-verification`)

### POST `/auth/email-verification/send`
- **Description**: Send email verification link
- **Auth**: Bearer Token (JWT) or Public (with email in body)
- **Body**: `SendVerificationEmailRequestDto` (email - optional if authenticated)
- **Response**: Success message

### POST `/auth/email-verification/verify`
- **Description**: Verify email using token from email link
- **Auth**: Public
- **Body**: `VerifyEmailRequestDto` (token)
- **Response**: Success message

### POST `/auth/email-verification/resend`
- **Description**: Resend email verification link
- **Auth**: Bearer Token (JWT) or Public (with email in body)
- **Body**: `ResendVerificationEmailRequestDto` (email - optional if authenticated)
- **Response**: Success message

### GET `/auth/email-verification/status`
- **Description**: Get email verification status
- **Auth**: Bearer Token (JWT) or Public (with email query param)
- **Query**: `?email=user@example.com` (optional if authenticated)
- **Response**: Email verification status

---

## 📱 Phone OTP Endpoints (`/auth/phone-otp`)

### POST `/auth/phone-otp/send`
- **Description**: Send OTP code to phone number
- **Auth**: Public
- **Body**: `SendPhoneOtpRequestDto` (phoneNumber, countryCode)
- **Response**: Success message with OTP ID

### POST `/auth/phone-otp/verify`
- **Description**: Verify OTP code and authenticate user
- **Auth**: Public
- **Body**: `VerifyPhoneOtpRequestDto` (phoneNumber, countryCode, otpCode)
- **Response**: `LoginResponseDto` (tokens, user)

---

## 🔗 OAuth2 Endpoints (`/auth/oauth`)

### GET `/auth/oauth/google`
- **Description**: Initiate Google OAuth2 login
- **Auth**: Public
- **Response**: Redirects to Google OAuth

### GET `/auth/oauth/google/callback`
- **Description**: Google OAuth2 callback handler
- **Auth**: Public
- **Query**: `code`, `state`
- **Response**: Redirects with tokens or error

### GET `/auth/oauth/github`
- **Description**: Initiate GitHub OAuth2 login
- **Auth**: Public
- **Response**: Redirects to GitHub OAuth

### GET `/auth/oauth/github/callback`
- **Description**: GitHub OAuth2 callback handler
- **Auth**: Public
- **Query**: `code`, `state`
- **Response**: Redirects with tokens or error

### GET `/auth/oauth/apple`
- **Description**: Initiate Apple OAuth2 login
- **Auth**: Public
- **Response**: Redirects to Apple OAuth

### GET `/auth/oauth/apple/callback`
- **Description**: Apple OAuth2 callback handler
- **Auth**: Public
- **Query**: `code`, `state`, `id_token`
- **Response**: Redirects with tokens or error

### GET `/auth/oauth/me/accounts`
- **Description**: Get linked OAuth2 accounts for current user
- **Auth**: Bearer Token (JWT)
- **Response**: List of linked OAuth accounts

### POST `/auth/oauth/:provider/unlink`
- **Description**: Unlink OAuth2 provider from user account
- **Auth**: Bearer Token (JWT)
- **Params**: `provider` (google, github, apple)
- **Response**: Success message

---

## 👤 User Management Endpoints (`/users`)

### GET `/users/me`
- **Description**: Get current authenticated user profile
- **Auth**: Bearer Token (JWT)
- **Response**: User profile data

### GET `/users/:userId`
- **Description**: Get user profile by ID
- **Auth**: Bearer Token (JWT)
- **Params**: `userId`
- **Response**: User profile data

### GET `/users`
- **Description**: Get list of users (with pagination)
- **Auth**: Bearer Token (JWT)
- **Query**: `page`, `limit`, `search`
- **Response**: List of users with pagination

### GET `/users/search`
- **Description**: Search users by query
- **Auth**: Bearer Token (JWT)
- **Query**: `q` (search query), `page`, `limit`
- **Response**: Search results with pagination

### PUT `/users/:userId`
- **Description**: Update user profile
- **Auth**: Bearer Token (JWT)
- **Params**: `userId`
- **Body**: User update data
- **Response**: Updated user profile

### POST `/users/:userId/avatar`
- **Description**: Upload user avatar
- **Auth**: Bearer Token (JWT)
- **Params**: `userId`
- **Body**: FormData with image file
- **Response**: Avatar URL

### DELETE `/users/:userId`
- **Description**: Delete user account
- **Auth**: Bearer Token (JWT)
- **Params**: `userId`
- **Response**: Success message

---

## 🔐 RBAC Endpoints (`/rbac`)

### POST `/rbac/roles`
- **Description**: Create new role
- **Auth**: Bearer Token (JWT) + Admin
- **Body**: Role creation data
- **Response**: Created role

### GET `/rbac/roles`
- **Description**: Get list of all roles
- **Auth**: Bearer Token (JWT) + Admin
- **Response**: List of roles

### GET `/rbac/roles/:id`
- **Description**: Get role by ID
- **Auth**: Bearer Token (JWT) + Admin
- **Params**: `id`
- **Response**: Role data

### PUT `/rbac/roles/:id`
- **Description**: Update role
- **Auth**: Bearer Token (JWT) + Admin
- **Params**: `id`
- **Body**: Role update data
- **Response**: Updated role

### DELETE `/rbac/roles/:id`
- **Description**: Delete role
- **Auth**: Bearer Token (JWT) + Admin
- **Params**: `id`
- **Response**: Success message

### POST `/rbac/permissions`
- **Description**: Create new permission
- **Auth**: Bearer Token (JWT) + Admin
- **Body**: Permission creation data
- **Response**: Created permission

### GET `/rbac/permissions`
- **Description**: Get list of all permissions
- **Auth**: Bearer Token (JWT) + Admin
- **Response**: List of permissions

### GET `/rbac/permissions/:id`
- **Description**: Get permission by ID
- **Auth**: Bearer Token (JWT) + Admin
- **Params**: `id`
- **Response**: Permission data

### POST `/rbac/permissions/grant`
- **Description**: Grant permission to role
- **Auth**: Bearer Token (JWT) + Admin
- **Body**: `{ roleId, permissionId }`
- **Response**: Success message

### DELETE `/rbac/permissions/:roleId/:id`
- **Description**: Revoke permission from role
- **Auth**: Bearer Token (JWT) + Admin
- **Params**: `roleId`, `id` (permissionId)
- **Response**: Success message

### POST `/rbac/assign-role`
- **Description**: Assign role to user
- **Auth**: Bearer Token (JWT) + Admin
- **Body**: `{ userId, roleId }`
- **Response**: Success message

### DELETE `/rbac/assign-role`
- **Description**: Remove role from user
- **Auth**: Bearer Token (JWT) + Admin
- **Body**: `{ userId, roleId }`
- **Response**: Success message

---

## 📊 Summary

**Total Endpoints**: ~50+

**Categories**:
- Authentication: 7 endpoints
- Password Reset: 3 endpoints
- 2FA: 6 endpoints
- Security Codes: 2 endpoints
- Email Verification: 4 endpoints
- Phone OTP: 2 endpoints
- OAuth2: 8 endpoints
- User Management: 7 endpoints
- RBAC: 12 endpoints

**Authentication Types**:
- **Public**: No authentication required
- **Bearer Token (JWT)**: Requires valid JWT access token
- **Admin**: Requires JWT token + admin role

**Base Path**: `/api-auth/v1`

**Swagger Documentation**: `http://localhost:7102/docs`
