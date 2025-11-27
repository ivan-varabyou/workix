import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  accessToken: string = '';
  refreshToken: string = '';
  expiresIn: number = 0;
  user: {
    id: string;
    email: string;
    name: string;
  } = {
    id: '',
    email: '',
    name: '',
  };
}

export class VerifyTokenDto {
  @ApiProperty({ description: 'Whether token is valid', example: true, type: Boolean })
  valid: boolean = false;

  @ApiProperty({ description: 'User ID from token', example: 'user-123', required: false, type: String })
  userId?: string;

  @ApiProperty({ description: 'User email from token', example: 'user@example.com', required: false, type: () => String })
  email?: string;

  @ApiProperty({ description: 'Error message if token is invalid', example: 'Token expired', required: false, type: String })
  error?: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refreshToken: string = '';
}

export class PasswordResetRequestDto {
  email: string = '';
}

export class PasswordResetDto {
  token: string = '';
  newPassword: string = '';
}
