import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

import { IsSecureEmail } from '../validators/email-security.validator';

/**
 * Request Password Reset DTO
 */
export class RequestPasswordResetDto {
  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  @IsSecureEmail({ message: 'Email contains invalid or dangerous characters' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email!: string;
}

/**
 * Verify Reset Token DTO
 */
export class VerifyResetTokenDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'a1b2c3d4e5f6...',
    minLength: 32,
    type: String,
  })
  @IsString()
  @MinLength(32)
  token?: string;
}

/**
 * Reset Password DTO
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'a1b2c3d4e5f6...',
    minLength: 32,
    type: String,
  })
  @IsString()
  @MinLength(32)
  token?: string;

  @ApiProperty({
    description: 'New password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)',
    example: 'NewP@ssw0rd123',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain: uppercase, lowercase, number, and special character',
  })
  newPassword?: string;
}

/**
 * Password Reset Response DTO
 */
export class PasswordResetResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'If an account exists with this email, a password reset link will be sent',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Reset token ID (for tracking)',
    example: 'abc123...',
  })
  resetTokenId?: string;
}

/**
 * Verify Token Response DTO
 */
export class VerifyTokenResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user-123',
  })
  userId!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;
}

/**
 * Reset Password Response DTO
 * Updated to work correctly with Swagger
 */
export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Password reset successfully',
    type: String,
  })
  message!: string;
}
