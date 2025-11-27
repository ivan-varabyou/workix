import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO for requesting password reset
 */
export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@workix.com', description: 'Admin email address' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

/**
 * Response for forgot password request
 */
export class ForgotPasswordResponseDto {
  @ApiProperty({ example: 'If an admin with this email exists, a reset link has been sent' })
  message!: string;
}

/**
 * DTO for verifying reset token
 */
export class VerifyResetTokenDto {
  @ApiProperty({ example: 'abc123def456...', description: 'Password reset token from email' })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

/**
 * Response for verify reset token
 */
export class VerifyResetTokenResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  adminId!: string;

  @ApiProperty({ example: 'admin@workix.com' })
  email!: string;
}

/**
 * DTO for resetting password
 */
export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456...', description: 'Password reset token from email' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'NewSecureP@ssw0rd123', description: 'New password (min 12 characters)', minLength: 12 })
  @IsString()
  @MinLength(12)
  newPassword!: string;
}

/**
 * Response for reset password
 */
export class ResetPasswordResponseDto {
  @ApiProperty({ example: 'Password reset successfully. All sessions have been invalidated.' })
  message!: string;
}

