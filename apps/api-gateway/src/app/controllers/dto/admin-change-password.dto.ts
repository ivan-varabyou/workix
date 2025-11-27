import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO for changing admin password
 */
export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentP@ssw0rd123', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecureP@ssw0rd123', description: 'New password (min 12 characters)', minLength: 12 })
  @IsString()
  @MinLength(12)
  newPassword!: string;
}

/**
 * Response for change password
 */
export class ChangePasswordResponseDto {
  @ApiProperty({ example: 'Password changed successfully. All other sessions have been invalidated.' })
  message!: string;
}

