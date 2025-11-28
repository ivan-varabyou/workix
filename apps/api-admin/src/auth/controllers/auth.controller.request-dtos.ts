import { ApiProperty } from '@nestjs/swagger';

/**
 * Simplified Request DTOs for Auth Controller
 * Created to avoid circular dependency issues
 */

export class RegisterRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: String,
  })
  email!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: 'User password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)',
    example: 'SecureP@ssw0rd123',
    type: String,
    minLength: 8,
  })
  password!: string;
}

