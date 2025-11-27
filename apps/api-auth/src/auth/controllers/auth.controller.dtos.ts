/**
 * Auth Controller Response DTOs
 * DTO классы для ответов контроллера аутентификации
 * Используются для Swagger документации вместо интерфейсов
 */

import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

/**
 * User without password hash DTO
 */
export class UserWithoutPasswordDto {
  @ApiProperty({ description: 'User ID', example: 'uuid', type: String })
  id!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;

  @ApiProperty({ description: 'User name', example: 'John Doe', type: String, required: false, nullable: true })
  name!: string | null;

  @ApiProperty({ description: 'Email verified status', example: true, type: Boolean })
  emailVerified!: boolean;

  @ApiProperty({ description: 'Phone number', example: '+1234567890', type: String, required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ description: 'Phone verified status', example: false, type: Boolean, required: false, nullable: true })
  phoneVerified?: boolean | null;

  @ApiProperty({ description: '2FA enabled status', example: false, type: Boolean, required: false, nullable: true })
  twoFactorEnabled?: boolean | null;

  @ApiProperty({ description: 'Biometric enabled status', example: false, type: Boolean, required: false, nullable: true })
  biometricEnabled?: boolean | null;

  @ApiProperty({ description: 'Account locked until', example: '2025-11-17T23:00:00Z', type: Date, required: false, nullable: true })
  lockedUntil?: Date | null;

  @ApiProperty({ description: 'Failed login attempts count', example: 0, type: Number, required: false })
  failedLoginAttempts?: number;

  @ApiProperty({ description: 'Account creation date', example: '2025-11-17T23:00:00Z', type: Date })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2025-11-17T23:00:00Z', type: Date })
  updatedAt!: Date;

  @ApiProperty({ description: 'Account deletion date', example: null, type: Date, required: false, nullable: true })
  deletedAt?: Date | null;
}

/**
 * Register Response DTO
 */
export class RegisterResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'User registered successfully',
    type: String,
  })
  message!: string;

  @ApiProperty({ description: 'Registered user data', type: () => UserWithoutPasswordDto })
  user!: UserWithoutPasswordDto;
}

/**
 * Tokens Response DTO
 */
export class TokensResponseDto {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: String })
  accessToken!: string;

  @ApiProperty({ description: 'JWT refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: String })
  refreshToken!: string;

  @ApiProperty({ description: 'Token expiration time in seconds', example: 3600, type: Number })
  expiresIn!: number;
}

/**
 * Login Response DTO
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Authentication tokens',
    type: () => TokensResponseDto,
    required: false,
  })
  tokens?: TokensResponseDto;

  @ApiProperty({ description: 'User data', type: () => UserWithoutPasswordDto })
  user!: UserWithoutPasswordDto;

  @ApiHideProperty() // Hide message to avoid circular dependency
  message?: string;
}

/**
 * Refresh Token Response DTO
 */
export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'New JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: String })
  accessToken!: string;

  @ApiProperty({ description: 'Token expiration time in seconds', example: 3600, type: Number })
  expiresIn!: number;
}

/**
 * Logout Response DTO
 */
export class LogoutResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Logged out successfully',
    type: String,
  })
  message!: string;
}

/**
 * Request Password Reset Response DTO
 */
export class RequestPasswordResetResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Password reset email sent',
    type: String,
  })
  message!: string;

  @ApiHideProperty() // Hide resetTokenId for security (internal use only)
  resetTokenId!: string;
}

/**
 * Verify Reset Token Response DTO
 */
export class VerifyResetTokenResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid', type: String })
  userId!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;
}

/**
 * Generate 2FA Secret Response DTO
 */
export class Generate2FASecretResponseDto {
  @ApiProperty({ description: '2FA secret key', example: 'JBSWY3DPEHPK3PXP', type: String })
  secret!: string;

  @ApiProperty({ description: 'QR code data URL', example: 'data:image/png;base64,...', type: String })
  qrCode!: string;

  @ApiProperty({ description: 'Manual entry key', example: 'JBSWY3DPEHPK3PXP', type: String })
  manualEntryKey!: string;
}

/**
 * Enable 2FA Response DTO (wrapper to avoid circular dependency)
 * Uses domain DTO but hides message field
 */
export class Enable2FAResponseDtoWrapper {
  @ApiHideProperty() // Hide message to avoid circular dependency
  message!: string;

  @ApiProperty({ description: 'Backup codes', type: () => [String] })
  backupCodes!: string[];
}

/**
 * Verify 2FA Response DTO
 */
export class Verify2FAResponseDto {
  @ApiProperty({ description: 'Verification result', example: true, type: Boolean })
  verified!: boolean;

  @ApiProperty({ description: 'Response message', example: '2FA verified successfully', type: String })
  message!: string;
}

/**
 * Disable 2FA Response DTO
 */
export class Disable2FAResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: '2FA disabled successfully',
    type: String,
  })
  message!: string;
}

/**
 * Get 2FA Status Response DTO
 */
export class Get2FAStatusResponseDto {
  @ApiProperty({ description: '2FA enabled status', example: true, type: Boolean })
  enabled!: boolean;

  @ApiProperty({ description: 'Number of remaining backup codes', example: 8, type: Number })
  backupCodesRemaining!: number;
}

/**
 * Regenerate Backup Codes Response DTO (wrapper to avoid circular dependency)
 * Uses domain DTO but hides message field
 */
export class RegenerateBackupCodesResponseDtoWrapper {
  @ApiHideProperty() // Hide message to avoid circular dependency
  message!: string;

  @ApiProperty({ description: 'New backup codes', type: () => [String] })
  backupCodes!: string[];
}

/**
 * Health Check Response DTO
 */
export class HealthCheckResponseDto {
  @ApiProperty({ description: 'Service status', example: 'ok', type: String })
  status!: string;

  @ApiProperty({ description: 'Check timestamp', example: '2025-11-17T23:00:00Z', type: Date })
  timestamp!: Date;
}

/**
 * Verify Token Request Body DTO
 */
export class VerifyTokenRequestBodyDto {
  @ApiProperty({
    description: 'JWT token to verify',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  token!: string;
}

/**
 * Security code verification DTO
 */
export class VerifySecurityCodeDto {
  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;

  @ApiProperty({
    description: 'Security verification code (6 digits)',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    type: String,
  })
  code!: string;
}

/**
 * Security code verification response DTO
 */
export class VerifySecurityCodeResponseDto {
  @ApiProperty({
    description: 'Verification result',
    example: true,
    type: Boolean,
  })
  verified!: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Security code verified successfully',
    type: String,
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Code expiration time',
    example: '2025-11-17T23:00:00Z',
    type: Date,
    required: false,
  })
  expiresAt?: Date;
}
