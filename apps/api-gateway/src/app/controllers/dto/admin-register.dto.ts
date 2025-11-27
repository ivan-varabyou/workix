import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class AdminRegisterDto {
  @ApiProperty({ example: 'admin@workix.com', description: 'Admin email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Admin password (min 12 characters)', minLength: 12 })
  @IsString()
  @MinLength(12)
  password!: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Admin name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'admin', description: 'Admin role', enum: ['admin', 'super_admin'], default: 'admin' })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'super_admin'])
  role?: string;
}
