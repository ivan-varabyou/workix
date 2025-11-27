import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { IsValidEmail } from '../validators/email.validator';
import { IsSecureEmail } from '../validators/email-security.validator';
import { IsSecureName } from '../validators/name-security.validator';

export class RegisterDto {
  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  @IsNotEmpty({ message: 'Email is required' })
  @IsSecureEmail({ message: 'Email contains invalid or dangerous characters' })
  @IsValidEmail({ message: 'Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 3,
    maxLength: 255,
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @IsSecureName({ message: 'Name contains invalid or dangerous characters' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name!: string;

  @ApiProperty({
    description: 'User password (min 12 chars, 1 upper, 1 lower, 1 number, 1 special)',
    example: 'SecureP@ssw0rd123',
    minLength: 12,
    maxLength: 128,
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password!: string;
}
