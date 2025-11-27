import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * Generate 2FA Secret Request DTO
 */
export class Generate2FASecretDto {
  // No parameters needed - uses authenticated user
}

/**
 * Enable 2FA DTO
 */
export class Enable2FADto {
  @ApiProperty({
    description: 'Secret from QR code',
    example: 'JBSWY3DPEBLW64TMMQ====',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  secret?: string;

  @ApiProperty({
    description: 'TOTP code from authenticator (6 digits)',
    example: '123456',
    type: String,
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'TOTP code must be 6 digits',
  })
  totpCode?: string;
}

/**
 * Verify TOTP During Login DTO
 */
export class VerifyTotpDto {
  @ApiProperty({
    description: 'TOTP code from authenticator app or backup code',
    example: '123456 or XXXX-XXXX-XXXX',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code?: string;
}

/**
 * 2FA Status Response DTO
 */
export class TwoFactorStatusDto {
  @ApiProperty({
    description: 'Whether 2FA is enabled',
    example: true,
  })
  enabled!: boolean;

  @ApiProperty({
    description: 'Number of remaining backup codes',
    example: 10,
  })
  backupCodesRemaining!: number;
}

/**
 * 2FA Secret Response DTO
 */
export class GenerateSecretResponseDto {
  @ApiProperty({
    description: 'Base32 encoded secret',
    example: 'JBSWY3DPEBLW64TMMQ====',
  })
  secret!: string;

  @ApiProperty({
    description: 'QR code as data URL',
    example: 'data:image/png;base64,...',
  })
  qrCode!: string;

  @ApiProperty({
    description: 'Manual entry key (base32)',
    example: 'JBSWY3DPEBLW64TMMQ====',
  })
  manualEntryKey!: string;
}

/**
 * Enable 2FA Response DTO
 */
export class Enable2FAResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: '2FA has been enabled successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Backup codes for account recovery',
    type: () => [String],
    example: ['XXXX-XXXX-XXXX', 'YYYY-YYYY-YYYY'],
  })
  backupCodes!: string[];
}

/**
 * Verify TOTP Response DTO
 */
export class VerifyTotpResponseDto {
  @ApiProperty({
    description: 'Whether code was valid',
    example: true,
  })
  verified!: boolean;

  @ApiProperty({
    description: 'Message about verification',
    example: 'TOTP code verified',
  })
  message!: string;
}

/**
 * Regenerate Backup Codes Response DTO
 */
export class RegenerateBackupCodesResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Backup codes have been regenerated',
  })
  message!: string;

  @ApiProperty({
    description: 'New backup codes',
    type: () => [String],
    example: ['XXXX-XXXX-XXXX', 'YYYY-YYYY-YYYY'],
  })
  backupCodes!: string[];
}
