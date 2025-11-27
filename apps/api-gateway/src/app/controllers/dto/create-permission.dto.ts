import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name (unique identifier)',
    example: 'pipelines:create',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  name = '';

  @ApiProperty({
    description: 'Resource name',
    example: 'pipelines',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  resource = '';

  @ApiProperty({
    description: 'Action name',
    example: 'create',
    enum: ['create', 'read', 'update', 'delete', 'execute'],
  })
  @IsString()
  action = '';

  @ApiProperty({
    description: 'Permission description',
    example: 'Allows creating new pipelines',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
