import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@workix.com', description: 'Admin email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Admin password' })
  @IsString()
  password!: string;
}
