/**
 * Auth Security Controller Response DTOs
 * DTO классы для ответов контроллера Auth Security
 * Используются для Swagger документации
 */

import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

/**
 * Verify Security Code Request DTO
 */
export class VerifySecurityCodeRequestDto {
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
 * Resend Security Code Request DTO
 */
export class ResendSecurityCodeRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: String,
  })
  email!: string;
}

/**
 * Resend Security Code Response DTO
 */
export class ResendSecurityCodeResponseDto {
  @ApiProperty({
    description: 'Verification result',
    example: true,
    type: Boolean,
  })
  verified!: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Security code resent to user@example.com',
    type: String,
  })
  message!: string;

  @ApiProperty({
    description: 'Code expiration time',
    example: '2025-11-17T23:00:00Z',
    type: Date,
  })
  expiresAt!: Date;
}
