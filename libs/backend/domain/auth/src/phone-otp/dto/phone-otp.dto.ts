import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

/**
 * Send OTP to Phone DTO
 */
export class SendPhoneOtpDto {
  @ApiProperty({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  phoneNumber?: string;
}

/**
 * Verify OTP DTO
 */
export class VerifyPhoneOtpDto {
  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: 'OTP code (6 digits)',
    example: '123456',
  })
  @IsString()
  @Length(6, 10)
  code?: string;

  @ApiPropertyOptional({
    description: 'Email for auto-registration (if phone not linked)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Name for auto-registration',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

/**
 * Phone OTP Response DTO
 * Updated to work correctly with Swagger
 */
export class PhoneOtpResponseDto {
  @ApiProperty({ description: 'OTP ID', example: 'otp-id-123', type: String })
  id!: string;

  @ApiProperty({ description: 'Phone number (masked)', example: '+1234****90', type: String })
  phoneNumber!: string;

  @ApiProperty({ description: 'When OTP expires', example: '2025-11-17T23:00:00Z', type: Date })
  expiresAt!: Date;

  @ApiProperty({ description: 'Message', example: 'OTP sent successfully', type: String })
  message!: string;
}

/**
 * Phone OTP User Info DTO (simplified for Swagger)
 * Added to avoid circular dependency
 */
export class PhoneOtpUserInfoDto {
  @ApiProperty({ description: 'User ID', example: 'uuid', type: String })
  id!: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890', type: String })
  phoneNumber!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email?: string | undefined;

  @ApiProperty({ description: 'User name', example: 'John Doe', type: String, required: false })
  name?: string | undefined;
}

/**
 * Phone OTP Verify Response DTO
 * Updated to work correctly with Swagger (avoids circular dependency)
 */
export class PhoneOtpVerifyResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
    type: Number,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'User information',
    type: () => PhoneOtpUserInfoDto,
  })
  user!: PhoneOtpUserInfoDto;
}
