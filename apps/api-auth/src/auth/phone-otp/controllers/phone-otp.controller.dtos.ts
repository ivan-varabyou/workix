import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Simplified Request DTO for Send OTP
 */
export class SendPhoneOtpRequestDto {
  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
    type: String,
  })
  phoneNumber!: string;
}

/**
 * Simplified Request DTO for Verify OTP
 */
export class VerifyPhoneOtpRequestDto {
  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    type: String,
  })
  phoneNumber!: string;

  @ApiProperty({
    description: 'OTP code (6 digits)',
    example: '123456',
    type: String,
  })
  code!: string;

  @ApiPropertyOptional({
    description: 'Email for auto-registration (optional)',
    example: 'user@example.com',
    type: String,
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Name for auto-registration (optional)',
    example: 'John Doe',
    type: String,
  })
  name?: string;
}
