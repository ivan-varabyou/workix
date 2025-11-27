import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'User bio',
    example: 'Software developer passionate about automation',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'User preferences (JSON object)',
    example: { theme: 'dark', language: 'en' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
