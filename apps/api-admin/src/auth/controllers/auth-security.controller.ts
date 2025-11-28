import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AccountSecurityService,
  AuthService,
  JwtService,
  Public,
  SecurityCodeService,
  TokensResponse,
} from '@workix/domain/auth';
import type { HttpRequest } from '@workix/shared/backend/core';
import { expressRequestToHttpRequest, isExpressRequest } from '@workix/shared/backend/core';

import { LoginResponseDto } from './auth.controller.dtos';
import {
  ResendSecurityCodeRequestDto,
  ResendSecurityCodeResponseDto,
  VerifySecurityCodeRequestDto,
} from './auth-security.controller.dtos';

/**
 * Auth Security Controller
 * Handles security-related authentication endpoints (security codes, location verification)
 */
@ApiTags('authentication-security')
@ApiExtraModels(
  VerifySecurityCodeRequestDto,
  ResendSecurityCodeRequestDto,
  ResendSecurityCodeResponseDto,
  LoginResponseDto,
)
@Controller('auth/security')
export class AuthSecurityController {
  constructor(
    private readonly securityCode: SecurityCodeService,
    private readonly accountSecurity: AccountSecurityService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Verify security code and complete login
   *
   * **Purpose**: Verifies security code sent via email and completes login process.
   *
   * **Usage**: Second step in login flow when security code is required.
   */
  @Post('verify-code')
  @Public()
  @ApiOperation({
    summary: 'Verify security code and complete login',
    description: `Verifies security code sent via email and completes login with tokens.

**Purpose**: Complete login process when security code verification is required (e.g., suspicious location, new device).

**Usage Flow**:
1. User attempts login (/auth/login)
2. System detects suspicious activity or new location
3. System sends 6-digit security code to user's email
4. User enters code from email
5. Frontend calls this endpoint with email and code
6. System verifies code and returns login tokens

**When Security Code is Required**:
- Login from new/unusual location
- Suspicious activity detected
- New device detected
- Account security settings require it

**Example Request**:
\`\`\`json
{
  "email": "user@example.com",
  "code": "123456"
}
\`\`\`

**Response**: Returns access token, refresh token, and user data (same as /login).

**Security**:
- Code expires after set time (typically 10-15 minutes)
- Code can only be used once
- Failed attempts are tracked

**Next Steps**: Use returned tokens for API authentication.`,
  })
  @ApiBody({ description: 'Security code verification request', type: () => VerifySecurityCodeRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Security code verified, login tokens returned',
    type: () => LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifySecurityCodeAndLogin(
    @Body() dto: VerifySecurityCodeRequestDto
  ): Promise<LoginResponseDto> {
    // Find user by email
    const normalizedEmail: string = dto.email.toLowerCase().trim();
    const userId: string | undefined = await this.accountSecurity.getUserIdByEmail(normalizedEmail);

    if (!userId) {
      throw new BadRequestException('User not found');
    }

    // Verify security code
    const result: { valid: boolean; message?: string } = await this.securityCode.verifyCode(userId, normalizedEmail, dto.code);

    if (!result.valid) {
      throw new BadRequestException(result.message || 'Invalid security code');
    }

    // Code verified - generate tokens and complete login
    // getUserById returns Omit<User, 'passwordHash'> where id and email are always strings
    const user: Awaited<ReturnType<typeof this.authService.getUserById>> = await this.authService.getUserById(userId);
    const tokens: TokensResponse = await this.jwtService.generateTokens(user.id, user.email);

    // Reset failed login attempts after successful verification
    await this.accountSecurity.resetFailedAttempts(userId);

    return {
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      user: {
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
      },
      message: 'Login completed successfully',
    };
  }

  /**
   * Resend security code
   *
   * **Purpose**: Resends security code to user's email if they didn't receive it or it expired.
   *
   * **Usage**: When user needs a new security code during login flow.
   */
  @Post('resend-code')
  @Public()
  @ApiOperation({
    summary: 'Resend security code to email',
    description: `Resends security code to user's email if original code wasn't received or expired.

**Purpose**: Request new security code when user didn't receive original or code expired.

**Usage Flow**:
1. User attempted login and security code was required
2. User didn't receive email or code expired
3. User clicks "Resend code" in UI
4. Frontend calls this endpoint with email
5. System generates new code and sends to email
6. User enters new code via /verify-code endpoint

**When to Use**:
- User didn't receive security code email
- Security code expired (typically 10-15 minutes)
- User wants fresh code

**Example Request**:
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

**Response**: Confirmation that new code was sent and expiration time.

**Security**:
- Requires pending security code to exist
- Rate limiting prevents abuse
- New code invalidates old code

**Next Step**: User checks email and calls /verify-code with new code.`,
  })
  @ApiBody({ description: 'Resend security code request', type: () => ResendSecurityCodeRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Security code resent',
    type: () => ResendSecurityCodeResponseDto,
  })
  async resendSecurityCode(@Body() body: ResendSecurityCodeRequestDto, @Req() req: unknown): Promise<ResendSecurityCodeResponseDto> {
    // Convert framework-specific Request to HttpRequest abstraction
    // req is unknown to avoid dependency on Express types
    // Use type guard to safely convert
    if (!isExpressRequest(req)) {
      throw new BadRequestException('Invalid request type');
    }
    const httpReq: HttpRequest = expressRequestToHttpRequest(req);

    const normalizedEmail: string = body.email.toLowerCase().trim();
    const userId: string | undefined = await this.accountSecurity.getUserIdByEmail(normalizedEmail);

    if (!userId) {
      throw new BadRequestException('User not found');
    }

    // Check if there's a pending code
    // getPendingCodeInfo returns info without the actual code for security
    const pendingCode: {
      reason: string;
      country?: string;
      countryName?: string;
      expiresAt: Date;
    } | null = await this.securityCode.getPendingCodeInfo(userId, normalizedEmail);

    if (!pendingCode) {
      throw new BadRequestException('No pending security code found. Please login again.');
    }

    // Get IP address from HttpRequest abstraction
    const ipAddress: string = httpReq.ip || 'unknown';

    // Get location for email (location is optional for resend, use pending code location if available)
    const location: { country?: string; countryName?: string } = {};
    if (pendingCode.country !== undefined) {
      location.country = pendingCode.country;
    }
    if (pendingCode.countryName !== undefined) {
      location.countryName = pendingCode.countryName;
    }

    // Generate and send new code
    const reason: 'location_change' | 'suspicious_activity' | 'new_device' =
      pendingCode.reason === 'location_change' || pendingCode.reason === 'suspicious_activity' || pendingCode.reason === 'new_device'
        ? pendingCode.reason
        : 'location_change';
    const codeResult: { code: string; expiresAt: Date } = await this.securityCode.generateAndSendCode(
      userId,
      normalizedEmail,
      reason,
      ipAddress,
      location.country,
      location.countryName
    );
    const expiresAt: Date = codeResult.expiresAt;

    return {
      verified: true,
      message: `Security code resent to ${normalizedEmail}`,
      expiresAt,
    };
  }
}
