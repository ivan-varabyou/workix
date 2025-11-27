import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'admin',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  name = '';

  @ApiProperty({
    description: 'Role description',
    example: 'Administrator role with full access',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Role level (0-100, higher = more privileges)',
    example: 100,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  level?: number;
}
