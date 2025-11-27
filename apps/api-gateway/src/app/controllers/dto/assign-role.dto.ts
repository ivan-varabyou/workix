import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user_123',
  })
  @IsString()
  userId = '';

  @ApiProperty({
    description: 'Role ID',
    example: 'role_123',
  })
  @IsString()
  roleId = '';

  @ApiProperty({
    description: 'Role expiration date (optional)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
