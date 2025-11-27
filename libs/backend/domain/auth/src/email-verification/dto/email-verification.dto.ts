import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

/**
 * Send Verification Email DTO
 */
export class SendVerificationEmailDto {
  @ApiHideProperty() // Temporarily hide email to test if this is causing circular dependency
  @IsEmail()
  email?: string;
}

/**
 * Verify Email DTO
 */
export class VerifyEmailDto {
  @ApiProperty({
    description: 'Verification token',
    example: 'token-abc-123...',
  })
  @IsString()
  @Length(20, 255)
  token?: string;
}

/**
 * Resend Verification Email DTO
 */
export class ResendVerificationEmailDto {
  @ApiHideProperty() // Temporarily hide email to test if this is causing circular dependency
  @IsEmail()
  email?: string;
}

/**
 * Email Verification Response DTO
 * Updated to work correctly with Swagger (avoids circular dependencies)
 */
export class EmailVerificationResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Verification email sent successfully',
    type: String,
  })
  message!: string;

  @ApiProperty({
    description: 'When email verification expires',
    example: '2025-11-17T23:00:00Z',
    type: Date,
  })
  expiresAt!: Date;
}

/**
 * Email Verified User Info DTO (separate to avoid circular dependency)
 * Updated to work correctly with Swagger
 */
export class EmailVerifiedUserInfoDto {
  @ApiProperty({ description: 'User ID', example: 'uuid', type: String })
  id!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;

  @ApiProperty({ description: 'Email verified status', example: true, type: Boolean })
  emailVerified!: boolean;
}

/**
 * Email Verified Response DTO
 * Updated to work correctly with Swagger
 */
export class EmailVerifiedResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Email verified successfully',
    type: String,
  })
  message!: string;

  @ApiProperty({
    description: 'User information',
    type: () => EmailVerifiedUserInfoDto,
  })
  user!: EmailVerifiedUserInfoDto;

  @ApiPropertyOptional({
    description: 'Access token (if generated)',
    example: 'eyJhbGciOiJIUzI1NiIs...',
    type: String,
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'Refresh token (if generated)',
    example: 'eyJhbGciOiJIUzI1NiIs...',
    type: String,
  })
  refreshToken?: string;
}

/**
 * Get Verification Status Response DTO
 * Added for Swagger documentation
 */
export class GetVerificationStatusResponseDto {
  @ApiProperty({
    description: 'Email verification status',
    example: true,
    type: Boolean,
  })
  verified!: boolean;

  @ApiPropertyOptional({
    description: 'When email verification expires',
    example: '2025-11-17T23:00:00Z',
    type: Date,
  })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Number of resend attempts',
    example: 2,
    type: Number,
  })
  resendCount?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of resends allowed',
    example: 5,
    type: Number,
  })
  maxResends?: number;
}
