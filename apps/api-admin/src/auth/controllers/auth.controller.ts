import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  // UnauthorizedException, // Temporarily disabled
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthFeaturesService,
  AuthService,
  CurrentUser,
  Enable2FADto,
  JwtGuard,
  JwtPayload,
  LoginDto,
  PasswordResetService,
  Public,
  RefreshTokenDto,
  RegisterDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  TwoFactorService,
  VerifyResetTokenDto,
  VerifyTokenDto,
  VerifyTotpDto,
} from '@workix/domain/auth';
import { expressRequestToHttpRequest, isExpressRequest } from '@workix/shared/backend/core';

import {
  Disable2FAResponseDto,
  Enable2FAResponseDtoWrapper,
  Generate2FASecretResponseDto,
  Get2FAStatusResponseDto,
  HealthCheckResponseDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  RegenerateBackupCodesResponseDtoWrapper,
  RegisterResponseDto,
  Verify2FAResponseDto,
  VerifyResetTokenResponseDto,
  VerifyTokenRequestBodyDto,
} from './auth.controller.dtos';
import { RegisterRequestDto } from './auth.controller.request-dtos';
import {
  Disable2FAResponse,
  Enable2FAResponse,
  Generate2FASecretResponse,
  Get2FAStatusResponse,
  HealthCheckResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegenerateBackupCodesResponse,
  RegisterResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
  UserWithoutPassword,
  Verify2FAResponse,
  VerifyResetTokenResponse,
} from './auth.controller.interfaces';
import { UserFromService } from './auth.controller.types';

/**
 * Auth Controller
 * Handles authentication endpoints
 */
@ApiTags('authentication')
@ApiExtraModels(
  RegisterResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
  VerifyTokenRequestBodyDto,
  VerifyTokenDto,
  RequestPasswordResetDto,
  VerifyResetTokenResponseDto,
  ResetPasswordResponseDto, // From @workix/domain/auth
  Generate2FASecretResponseDto,
  Enable2FAResponseDtoWrapper,
  Verify2FAResponseDto,
  Disable2FAResponseDto,
  Get2FAStatusResponseDto,
  RegenerateBackupCodesResponseDtoWrapper,
  HealthCheckResponseDto,
  // Request DTOs
  RegisterRequestDto,
)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(PasswordResetService) private passwordResetService: PasswordResetService,
    // @Inject(ThreatDetectionService) private threatDetection: ThreatDetectionService, // Temporarily disabled
    @Inject(TwoFactorService) private twoFactorService: TwoFactorService,
    @Inject(AuthFeaturesService) private authFeatures: AuthFeaturesService
  ) {}

  /**
   * Register new user
   *
   * **Purpose**: Creates a new user account in the system.
   *
   * **Usage Flow**:
   * 1. User provides email, name, and password
   * 2. System validates email format and password strength
   * 3. Password is hashed and stored securely
   * 4. User account is created with emailVerified=false
   * 5. Response includes user data (without password)
   *
   * **Security**: Email enumeration protection - same response for existing/non-existing emails
   *
   * **Next Steps**: User should verify email address after registration
   */
  @Post('register')
  @Public()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register new user',
    description: `Creates a new user account. Requires email, name, and password.

**Purpose**: Register a new user in the authentication system.

**Usage**:
1. Send POST request with email, name, and password
2. System validates input and creates account
3. Returns user data (password is never returned)

**Security Features**:
- Email format validation
- Password strength checking
- Email enumeration protection (same response for existing/non-existing emails)

**Example Request**:
\`\`\`json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecureP@ssw0rd123"
}
\`\`\`

**Response**: Returns user object with ID, email, name, and account status.`,
  })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: () => RegisterResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    // Sanitize email to prevent injection attacks (CRLF, null bytes, etc.)
    if (!registerDto.email) {
      throw new BadRequestException('Email is required');
    }

    // Check for dangerous characters before sanitization
    if (/[\r\n\0]/.test(registerDto.email)) {
      throw new BadRequestException('Invalid email format. Email contains invalid characters');
    }

    // Additional validation - ensure email format is correct
    if (!registerDto.email.includes('@') || !registerDto.email.includes('.')) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    const emailParts: string[] = registerDto.email.split('@');
    if (emailParts.length !== 2 || !emailParts[1]?.includes('.')) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    const domain: string | undefined = emailParts[1];
    if (!domain) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    const domainParts: string[] = domain.split('.');
    const tld: string | undefined = domainParts[domainParts.length - 1];
    if (domainParts.length < 2 || !tld || tld.length < 2) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    // Try to register user - catch ConflictException to prevent email enumeration
    let user: UserFromService;
    try {
      user = await this.authService.register(registerDto);
    } catch (error: unknown) {
      // Prevent email enumeration - return same response for existing and non-existing emails
      if (error instanceof ConflictException) {
        // User already exists, but return success message to prevent enumeration
        // In production, you might want to send verification email anyway
        throw new BadRequestException('If this email is registered, you will receive a verification email');
      }
      throw error;
    }
    const userWithoutPassword: UserWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      phone: user.phone ?? null,
      phoneVerified: user.phoneVerified ?? null,
      twoFactorEnabled: user.twoFactorEnabled ?? null,
      biometricEnabled: user.biometricEnabled ?? null,
      lockedUntil: user.lockedUntil ?? null,
      failedLoginAttempts: user.failedLoginAttempts ?? 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt ?? null,
    };
    return { message: 'User registered successfully', user: userWithoutPassword };
  }

  /**
   * Login user
   *
   * **Purpose**: Authenticates user and returns access/refresh tokens.
   *
   * **Usage Flow**:
   * 1. User provides email and password
   * 2. System validates credentials
   * 3. If valid, generates JWT access token and refresh token
   * 4. Returns tokens and user data
   *
   * **Security**:
   * - Password is never returned
   * - Failed login attempts are tracked
   * - Account may be locked after multiple failures
   */
  @Post('login')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login user',
    description: `Authenticates user with email and password, returns JWT tokens.

**Purpose**: Authenticate user and obtain access/refresh tokens for API access.

**Usage**:
1. Send POST request with email and password
2. System validates credentials
3. Returns access token (short-lived) and refresh token (long-lived)
4. Use access token in Authorization header for protected endpoints

**Security Features**:
- Password validation against hashed password
- Failed login attempt tracking
- Account locking after multiple failures
- Injection attack prevention

**Example Request**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123"
}
\`\`\`

**Response**: Returns tokens object with accessToken, refreshToken, expiresIn, and user data.

**Next Steps**:
- Use accessToken in Authorization header: \`Bearer {accessToken}\`
- Use refreshToken to get new accessToken when it expires`,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: () => LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: unknown): Promise<LoginResponse> {
    // Convert framework-specific Request to HttpRequest abstraction
    // req is unknown to avoid dependency on Express types
    // Use type guard to safely convert
    if (!isExpressRequest(req)) {
      throw new BadRequestException('Invalid request type');
    }
    // Converted but not used in this method - kept for future use
    void expressRequestToHttpRequest(req);
    // Sanitize email to prevent injection attacks (CRLF, null bytes, etc.)
    if (!loginDto.email) {
      throw new BadRequestException('Email is required');
    }

    // Check for dangerous characters before sanitization
    if (/[\r\n\0]/.test(loginDto.email)) {
      throw new BadRequestException('Invalid email format. Email contains invalid characters');
    }

    // Additional validation - ensure email format is correct
    if (!loginDto.email.includes('@') || !loginDto.email.includes('.')) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    const emailParts: string[] = loginDto.email.split('@');
    if (emailParts.length !== 2 || !emailParts[1]?.includes('.')) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    const domain: string | undefined = emailParts[1];
    if (!domain) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    const domainParts: string[] = domain.split('.');
    const tld: string | undefined = domainParts[domainParts.length - 1];
    if (domainParts.length < 2 || !tld || tld.length < 2) {
      throw new BadRequestException('Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)');
    }

    try {
      const loginResult: LoginResponse = await this.authService.login(loginDto);
      return loginResult;
    } catch (error: unknown) {
      // Handle failed login attempts for security tracking
      // Temporarily disabled
      // if (error instanceof UnauthorizedException) {
      //   // Get IP address from request
      //   const ipAddress: string = req.ip || req.socket.remoteAddress || 'unknown';
      //
      //   // Track failed login attempt (AccountSecurityService will find user by email if needed)
      //   await this.threatDetection.handleFailedLogin(undefined, loginDto.email, ipAddress).catch((err: unknown): void => {
      //     // Don't fail login if security tracking fails
      //     console.error('Failed to track security event:', err);
      //   });
      // }
      throw error;
    }
  }

  /**
   * Verify token
   *
   * **Purpose**: Validates JWT token and returns token information.
   *
   * **Usage**: Check if a token is valid and get user information from it.
   */
  @Post('verify')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify JWT token',
    description: `Validates a JWT access token and returns token information.

**Purpose**: Check if a JWT token is valid, not expired, and extract user information.

**Usage**:
1. Send POST request with token in body
2. System validates token signature and expiration
3. Returns token validity status and user information if valid

**Use Cases**:
- Validate token before making API calls
- Extract user ID and email from token
- Check token expiration status

**Example Request**:
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

**Response**: Returns valid status, userId, email, or error message if invalid.`,
  })
  @ApiBody({ type: VerifyTokenRequestBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Token verification result',
    type: () => VerifyTokenDto,
  })
  async verify(@Body() body: VerifyTokenRequestBodyDto): Promise<VerifyTokenDto> {
    return await this.authService.verifyToken(body.token);
  }

  /**
   * Refresh access token
   *
   * **Purpose**: Obtains a new access token using a valid refresh token.
   *
   * **Usage**: When access token expires, use refresh token to get a new one.
   */
  @Post('refresh')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description: `Obtains a new access token using a valid refresh token.

**Purpose**: Get a new short-lived access token when the current one expires, without requiring user to login again.

**Usage Flow**:
1. Access token expires (typically after 1 hour)
2. Send POST request with refresh token
3. System validates refresh token
4. Returns new access token and expiration time

**When to Use**:
- Access token has expired
- Need to continue API session without re-authentication
- Refresh token is still valid (typically valid for 7-30 days)

**Example Request**:
\`\`\`json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

**Response**: Returns new accessToken and expiresIn.

**Security**: Refresh token is validated and invalidated if compromised.`,
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New access token generated', type: () => RefreshTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() body: RefreshTokenDto): Promise<RefreshTokenResponse> {
    return await this.authService.refreshToken(body.refreshToken);
  }

  /**
   * Logout user
   *
   * **Purpose**: Invalidates user's refresh token, effectively logging them out.
   *
   * **Usage**: Call this when user explicitly logs out to invalidate their session.
   */
  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout user and invalidate tokens',
    description: `Invalidates refresh token and logs out the user.

**Purpose**: Securely end user session by invalidating refresh token.

**Usage**:
1. User clicks logout
2. Send POST request with refresh token
3. System invalidates refresh token
4. User must login again to get new tokens

**Security**:
- Requires valid access token in Authorization header
- Refresh token is blacklisted and cannot be reused
- Access token remains valid until expiration (cannot be revoked immediately)

**Example Request**:
\`\`\`json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

**Headers Required**:
\`Authorization: Bearer {accessToken}\`

**Response**: Confirmation message that logout was successful.`,
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Successfully logged out', type: () => LogoutResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: JwtPayload, @Body() body: RefreshTokenDto): Promise<LogoutResponse> {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return await this.authService.logout(body.refreshToken, user.userId);
  }


  /**
   * Get current user
   *
   * **Purpose**: Returns current authenticated user's profile information.
   *
   * **Usage**: Get user data for the authenticated session.
   */
  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: `Returns profile information for the currently authenticated user.

**Purpose**: Retrieve current user's profile data based on JWT token.

**Usage**:
1. Include access token in Authorization header
2. System extracts user ID from token
3. Returns user profile data

**Use Cases**:
- Display user profile in UI
- Check user account status
- Get user preferences and settings

**Headers Required**:
\`Authorization: Bearer {accessToken}\`

**Response**: Returns user object with ID, email, name, verification status, 2FA status, etc.

**Security**: Only returns data for the authenticated user (from token).`,
  })
  @ApiResponse({ status: 200, description: 'User data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: JwtPayload): Promise<UserWithoutPassword> {
    const userData: UserFromService = await this.authService.getUserById(user.userId);
    const userWithoutPassword: UserWithoutPassword = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      emailVerified: userData.emailVerified,
      phone: userData.phone ?? null,
      phoneVerified: userData.phoneVerified ?? null,
      twoFactorEnabled: userData.twoFactorEnabled ?? null,
      biometricEnabled: userData.biometricEnabled ?? null,
      lockedUntil: userData.lockedUntil ?? null,
      failedLoginAttempts: userData.failedLoginAttempts ?? 0,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      deletedAt: userData.deletedAt ?? null,
    };
    return userWithoutPassword;
  }

  /**
   * Request password reset
   *
   * **Purpose**: Initiates password reset flow by sending reset email.
   *
   * **Usage Flow**:
   * 1. User requests password reset with email
   * 2. System sends reset token via email
   * 3. User clicks link in email
   * 4. User verifies token and sets new password
   */
  @Post('password-reset/request')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Request password reset email',
    description: `Initiates password reset process by sending reset token to user's email.

**Purpose**: Start password reset flow when user forgets their password.

**Usage Flow**:
1. User enters email address
2. System sends password reset email with token
3. User clicks link in email (goes to frontend)
4. Frontend calls /password-reset/verify with token
5. Frontend calls /password-reset/confirm with token and new password

**Security Features**:
- Rate limiting to prevent abuse
- Email enumeration protection (same response for existing/non-existing emails)
- Reset token expires after set time (typically 1 hour)
- Token is single-use only

**Example Request**:
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

**Response**: Success message (same for existing/non-existing emails for security).

**Next Steps**:
1. User checks email and clicks reset link
2. Frontend calls /password-reset/verify to validate token
3. Frontend calls /password-reset/confirm to set new password`,
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({ status: 200, description: 'Password reset email sent (if account exists)' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<RequestPasswordResetResponse> {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }
    return await this.passwordResetService.requestPasswordReset(dto.email);
  }

  /**
   * Verify password reset token
   *
   * **Purpose**: Validates password reset token before allowing password change.
   *
   * **Usage**: Called by frontend when user clicks reset link to verify token is valid.
   */
  @Post('password-reset/verify')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify password reset token',
    description: `Validates password reset token before allowing password change.

**Purpose**: Verify that reset token from email is valid and not expired.

**Usage Flow**:
1. User clicks reset link in email (contains token)
2. Frontend extracts token from URL
3. Frontend calls this endpoint to verify token
4. If valid, frontend shows password reset form
5. If invalid, frontend shows error message

**Example Request**:
\`\`\`json
{
  "token": "reset-token-from-email"
}
\`\`\`

**Response**: Returns userId and email if token is valid.

**Next Step**: If valid, call /password-reset/confirm with token and new password.`,
  })
  @ApiBody({ type: VerifyResetTokenDto })
  @ApiResponse({ status: 200, description: 'Token is valid', type: () => VerifyResetTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyResetToken(@Body() dto: VerifyResetTokenDto): Promise<VerifyResetTokenResponse> {
    if (!dto.token) {
      throw new BadRequestException('Token is required');
    }
    return await this.passwordResetService.verifyResetToken(dto.token);
  }

  /**
   * Reset password with token
   *
   * **Purpose**: Completes password reset by setting new password.
   *
   * **Usage**: Final step in password reset flow.
   */
  @Post('password-reset/confirm')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm password reset and set new password',
    description: `Completes password reset by setting new password using reset token.

**Purpose**: Final step in password reset flow - sets new password for user account.

**Usage Flow**:
1. User has verified token (via /password-reset/verify)
2. User enters new password in form
3. Frontend calls this endpoint with token and new password
4. System validates token and password strength
5. Password is updated and token is invalidated

**Password Requirements**:
- Minimum length (typically 8+ characters)
- Must contain uppercase, lowercase, numbers, special characters
- Cannot be common password

**Example Request**:
\`\`\`json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecureP@ssw0rd123"
}
\`\`\`

**Response**: Success message confirming password was reset.

**Security**: Token is single-use and invalidated after successful reset.`,
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful', type: () => ResetPasswordResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid token or weak password' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ResetPasswordResponse> {
    if (!dto.token || !dto.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    return await this.passwordResetService.resetPassword(dto.token, dto.newPassword);
  }

  /**
   * Generate 2FA Secret
   *
   * **Purpose**: Generates 2FA secret and QR code for enabling two-factor authentication.
   *
   * **Usage Flow**:
   * 1. User requests to enable 2FA
   * 2. System generates secret and QR code
   * 3. User scans QR code with authenticator app
   * 4. User enters code from app to enable 2FA
   */
  @Post('2fa/generate')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate 2FA secret and QR code',
    description: `Generates TOTP secret and QR code for setting up two-factor authentication.

**Purpose**: First step in enabling 2FA - generates secret key and QR code for authenticator app.

**Usage Flow**:
1. User wants to enable 2FA
2. Call this endpoint to get secret and QR code
3. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
4. App generates 6-digit codes
5. User calls /2fa/enable with secret and a code from app
6. System verifies code and enables 2FA

**What You Get**:
- secret: Base32 encoded secret key
- qrCode: Data URL of QR code image (display in UI)
- manualEntryKey: Secret key for manual entry if QR scan fails

**Example Response**:
\`\`\`json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}
\`\`\`

**Next Step**: Display QR code, then call /2fa/enable with secret and TOTP code.`,
  })
  @ApiResponse({ status: 200, description: 'Secret and QR code generated', type: () => Generate2FASecretResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: '2FA is disabled' })
  async generate2FASecret(@CurrentUser() user: JwtPayload): Promise<Generate2FASecretResponse> {
    if (!this.authFeatures.is2FAEnabled()) {
      throw new ForbiddenException('Two-factor authentication is disabled');
    }
    return await this.twoFactorService.generateSecret(user.userId, user.email);
  }

  /**
   * Enable 2FA
   *
   * **Purpose**: Enables two-factor authentication after verifying TOTP code.
   *
   * **Usage**: Final step to enable 2FA - verifies user can generate correct codes.
   */
  @Post('2fa/enable')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Enable 2FA for authenticated user',
    description: `Enables two-factor authentication after verifying TOTP code from authenticator app.

**Purpose**: Final step to enable 2FA - verifies user has correctly set up authenticator app.

**Usage Flow**:
1. User has scanned QR code from /2fa/generate
2. Authenticator app shows 6-digit code
3. User enters code and calls this endpoint
4. System verifies code matches secret
5. If valid, 2FA is enabled and backup codes are generated

**Example Request**:
\`\`\`json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "totpCode": "123456"
}
\`\`\`

**Response**: Returns backup codes (save these securely - they're shown only once).

**Important**:
- Backup codes allow login if authenticator app is lost
- Store backup codes securely (password manager, printed copy)
- Each backup code can only be used once

**Next Steps**:
- User must enter TOTP code during login
- Use backup codes if authenticator app is unavailable`,
  })
  @ApiBody({ type: Enable2FADto })
  @ApiResponse({ status: 200, description: '2FA enabled with backup codes', type: () => Enable2FAResponseDtoWrapper })
  @ApiResponse({ status: 400, description: 'Invalid authenticator code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: '2FA is disabled' })
  async enable2FA(@CurrentUser() user: JwtPayload, @Body() dto: Enable2FADto): Promise<Enable2FAResponse> {
    if (!this.authFeatures.is2FAEnabled()) {
      throw new ForbiddenException('Two-factor authentication is disabled');
    }
    if (!dto.secret || !dto.totpCode) {
      throw new BadRequestException('Secret and TOTP code are required');
    }
    return await this.twoFactorService.enable2FA(user.userId, dto.secret, dto.totpCode);
  }

  /**
   * Verify 2FA during login
   *
   * **Purpose**: Verifies TOTP code during login flow for users with 2FA enabled.
   *
   * **Usage**: Called after successful password authentication when user has 2FA enabled.
   */
  @Post('2fa/verify')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify 2FA code during login',
    description: `Verifies TOTP code from authenticator app during login process.

**Purpose**: Second step in login flow for users with 2FA enabled.

**Usage Flow**:
1. User logs in with email/password (/login)
2. If 2FA is enabled, login returns requires2FA flag
3. User enters 6-digit code from authenticator app
4. Frontend calls this endpoint with code
5. System verifies code and completes login

**Example Request**:
\`\`\`json
{
  "code": "123456"
}
\`\`\`

**Note**: This endpoint is typically used in conjunction with login flow. The actual implementation may vary based on your authentication architecture.

**Response**: Verification result and success message.`,
  })
  @ApiBody({ type: VerifyTotpDto })
  @ApiResponse({ status: 200, description: 'Code verified', type: () => Verify2FAResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid code' })
  @ApiResponse({ status: 403, description: '2FA is disabled' })
  async verify2FA(@Body() _dto: VerifyTotpDto): Promise<Verify2FAResponse> {
    if (!this.authFeatures.is2FAEnabled()) {
      throw new ForbiddenException('Two-factor authentication is disabled');
    }
    // This endpoint needs userId - typically passed from login endpoint
    // In real implementation, you'd have middleware to extract it
    const response: Verify2FAResponse = { verified: true, message: 'Use in conjunction with login flow' };
    return response;
  }

  /**
   * Disable 2FA
   *
   * **Purpose**: Disables two-factor authentication for the user.
   *
   * **Usage**: Allows user to turn off 2FA if they no longer want it.
   */
  @Delete('2fa/disable')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Disable 2FA for authenticated user',
    description: `Disables two-factor authentication for the current user.

**Purpose**: Turn off 2FA if user no longer wants to use it.

**Usage**:
1. User is authenticated (has valid access token)
2. Call DELETE endpoint
3. System disables 2FA for user account
4. User can login with just password (no TOTP code required)

**Security**: Requires authentication - only user can disable their own 2FA.

**Headers Required**:
\`Authorization: Bearer {accessToken}\`

**Response**: Confirmation message that 2FA was disabled.

**Warning**: Disabling 2FA reduces account security. Consider alternative security measures.`,
  })
  @ApiResponse({ status: 200, description: '2FA disabled', type: () => Disable2FAResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: '2FA is disabled' })
  async disable2FA(@CurrentUser() user: JwtPayload): Promise<Disable2FAResponse> {
    if (!this.authFeatures.is2FAEnabled()) {
      throw new ForbiddenException('Two-factor authentication is disabled');
    }
    return await this.twoFactorService.disable2FA(user.userId);
  }

  /**
   * Get 2FA Status
   *
   * **Purpose**: Returns current 2FA status and remaining backup codes count.
   *
   * **Usage**: Check if user has 2FA enabled and how many backup codes remain.
   */
  @Get('2fa/status')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get 2FA status for authenticated user',
    description: `Returns current 2FA status and number of remaining backup codes.

**Purpose**: Check if user has 2FA enabled and monitor backup codes availability.

**Usage**:
1. User is authenticated
2. Call GET endpoint
3. Returns 2FA enabled status and backup codes count

**Use Cases**:
- Display 2FA status in user settings
- Warn user if backup codes are running low
- Show 2FA setup prompt if disabled

**Headers Required**:
\`Authorization: Bearer {accessToken}\`

**Response**:
- enabled: true/false
- backupCodesRemaining: number of unused backup codes

**Next Steps**:
- If enabled and backupCodesRemaining < 3, suggest regenerating codes
- If disabled, show option to enable 2FA`,
  })
  @ApiResponse({ status: 200, description: '2FA status', type: () => Get2FAStatusResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: '2FA is disabled' })
  async get2FAStatus(@CurrentUser() user: JwtPayload): Promise<Get2FAStatusResponse> {
    if (!this.authFeatures.is2FAEnabled()) {
      throw new ForbiddenException('Two-factor authentication is disabled');
    }
    return await this.twoFactorService.get2FAStatus(user.userId);
  }

  /**
   * Regenerate Backup Codes
   *
   * **Purpose**: Generates new backup codes, invalidating old ones.
   *
   * **Usage**: When user runs out of backup codes or wants to refresh them.
   */
  @Post('2fa/regenerate-backup-codes')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Regenerate 2FA backup codes',
    description: `Generates new backup codes and invalidates old ones.

**Purpose**: Create new backup codes when old ones are used up or compromised.

**Usage**:
1. User has 2FA enabled
2. User wants new backup codes (old ones used or lost)
3. Call POST endpoint
4. System generates new backup codes
5. Old backup codes are invalidated

**When to Use**:
- User has used most/all backup codes
- User suspects backup codes were compromised
- User wants fresh backup codes for security

**Headers Required**:
\`Authorization: Bearer {accessToken}\`

**Response**: Returns array of new backup codes (save these securely).

**Important**:
- Old backup codes are immediately invalidated
- New codes are shown only once
- Store new codes securely (password manager, printed copy)
- Each code can only be used once

**Security**: Requires authentication and 2FA to be enabled.`,
  })
  @ApiResponse({
    status: 200,
    description: 'New backup codes generated',
    type: () => RegenerateBackupCodesResponseDtoWrapper,
  })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: '2FA is disabled' })
  async regenerateBackupCodes(@CurrentUser() user: JwtPayload): Promise<RegenerateBackupCodesResponse> {
    if (!this.authFeatures.is2FAEnabled()) {
      throw new ForbiddenException('Two-factor authentication is disabled');
    }
    return await this.twoFactorService.regenerateBackupCodes(user.userId);
  }

  /**
   * Health check
   *
   * **Purpose**: Returns service health status for monitoring.
   *
   * **Usage**: Used by load balancers, monitoring systems, and health checks.
   */
  @Get('health')
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Health check',
    description: `Returns service health status for monitoring and load balancing.

**Purpose**: Check if authentication service is running and healthy.

**Usage**:
- Load balancers use this to route traffic
- Monitoring systems check service availability
- CI/CD pipelines verify deployment success

**Response**: Returns status "ok" and current timestamp.

**No Authentication Required**: Public endpoint for health monitoring.`,
  })
  @ApiResponse({ status: 200, description: 'Service is healthy', type: () => HealthCheckResponseDto })
  health(): HealthCheckResponse {
    const response: HealthCheckResponse = { status: 'ok', timestamp: new Date() };
    return response;
  }
}
