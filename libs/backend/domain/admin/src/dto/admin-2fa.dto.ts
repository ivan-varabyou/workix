import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * DTO for generating 2FA secret
 */
export class Generate2FASecretDto {
  // No fields needed - uses authenticated admin from token
}

/**
 * Response for 2FA secret generation
 */
export class Generate2FASecretResponseDto {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: 'Base32 secret for manual entry' })
  secret!: string;

  @ApiProperty({ example: 'data:image/png;base64,iVBORw0KGgo...', description: 'QR code as data URL' })
  qrCode!: string;

  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: 'Manual entry key (same as secret)' })
  manualEntryKey!: string;
}

/**
 * DTO for enabling 2FA
 */
export class Enable2FADto {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: '2FA secret from generate endpoint' })
  @IsString()
  @IsNotEmpty()
  secret!: string;

  @ApiProperty({ example: '123456', description: '6-digit TOTP code from authenticator app' })
  @IsString()
  @Length(6, 6)
  totpCode!: string;
}

/**
 * Response for enabling 2FA
 */
export class Enable2FAResponseDto {
  @ApiProperty({ example: '2FA has been enabled successfully' })
  message!: string;

  @ApiProperty({ example: ['ABC12345', 'DEF67890'], description: 'Backup codes (save these!)' })
  backupCodes!: string[];
}

/**
 * DTO for verifying 2FA during login
 */
export class Verify2FADto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code or backup code' })
  @IsString()
  @IsNotEmpty()
  totpCode!: string;
}

/**
 * Response for verifying 2FA
 */
export class Verify2FAResponseDto {
  @ApiProperty({ example: true })
  verified!: boolean;

  @ApiProperty({ example: '2FA code verified successfully' })
  message!: string;
}

/**
 * Response for 2FA status
 */
export class Get2FAStatusResponseDto {
  @ApiProperty({ example: true })
  enabled!: boolean;

  @ApiProperty({ example: true })
  hasBackupCodes!: boolean;
}

/**
 * Response for regenerating backup codes
 */
export class RegenerateBackupCodesResponseDto {
  @ApiProperty({ example: ['ABC12345', 'DEF67890'], description: 'New backup codes (save these!)' })
  backupCodes!: string[];
}
