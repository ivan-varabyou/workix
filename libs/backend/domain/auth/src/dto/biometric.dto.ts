import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Register Biometric DTO
 */
export class RegisterBiometricDto {
  @ApiProperty({
    description: 'Biometric type',
    enum: ['fingerprint', 'face'],
    example: 'fingerprint',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['fingerprint', 'face'])
  type?: string;

  @ApiProperty({
    description: 'Biometric template (encoded)',
    example: 'base64-encoded-template-data',
  })
  @IsString()
  @IsNotEmpty()
  template?: string;

  @ApiPropertyOptional({
    description: 'Device ID',
    example: 'device-123',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Device name',
    example: 'iPhone 14 Pro',
  })
  @IsOptional()
  @IsString()
  deviceName?: string;
}

/**
 * Verify Biometric DTO
 */
export class VerifyBiometricDto {
  @ApiProperty({
    description: 'Biometric type',
    enum: ['fingerprint', 'face'],
    example: 'fingerprint',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['fingerprint', 'face'])
  type?: string;

  @ApiProperty({
    description: 'Biometric template (encoded)',
    example: 'base64-encoded-template-data',
  })
  @IsString()
  @IsNotEmpty()
  template?: string;
}

/**
 * Biometric Response DTO
 */
export class BiometricResponseDto {
  @ApiProperty({
    description: 'Biometric ID',
  })
  id!: string;

  @ApiProperty({
    description: 'Biometric type',
  })
  type!: string;

  @ApiProperty({
    description: 'Device name',
  })
  deviceName!: string;

  @ApiProperty({
    description: 'Last used at',
  })
  lastUsedAt!: Date;

  @ApiProperty({
    description: 'Created at',
  })
  createdAt!: Date;
}

/**
 * Biometric Statistics DTO
 */
export class BiometricStatsDto {
  @ApiProperty({
    description: 'Total biometrics registered',
  })
  total!: number;

  @ApiProperty({
    description: 'Count by type',
  })
  byType!: Record<string, number>;
}

/**
 * Verify Biometric Response DTO
 */
export class VerifyBiometricResponseDto {
  @ApiProperty({
    description: 'Whether verification was successful',
  })
  verified!: boolean;

  @ApiProperty({
    description: 'Biometric ID that matched',
  })
  biometricId!: string;

  @ApiProperty({
    description: 'Match score (0-1)',
  })
  matchScore!: number;
}

/**
 * Register Biometric Response DTO
 */
export class RegisterBiometricResponseDto {
  @ApiProperty({
    description: 'Biometric ID',
  })
  biometricId!: string;

  @ApiProperty({
    description: 'Success message',
  })
  message!: string;
}
