import { ApiProperty } from '@nestjs/swagger';

/**
 * Simplified Request DTOs for Email Verification Controller
 * Created to avoid circular dependency issues
 */

export class SendVerificationEmailRequestDto {
  @ApiProperty({
    description: 'Email address to verify',
    example: 'user@example.com',
    type: String,
  })
  email!: string;
}

export class VerifyEmailRequestDto {
  @ApiProperty({
    description: 'Verification token from email',
    example: 'token-abc-123...',
    type: String,
  })
  token!: string;
}

export class ResendVerificationEmailRequestDto {
  @ApiProperty({
    description: 'Email address to resend verification',
    example: 'user@example.com',
    type: String,
  })
  email!: string;
}
