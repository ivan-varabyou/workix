import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { IsValidEmail } from '../validators/email.validator';

export class LoginDto {
  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  @IsNotEmpty({ message: 'Email is required' })
  @IsValidEmail({ message: 'Invalid email format. Email must contain a valid domain and TLD (e.g., user@example.com)' })
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecureP@ssw0rd123',
    minLength: 8,
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}
