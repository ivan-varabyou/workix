import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * OAuth Callback DTO
 * Data returned from OAuth provider
 */
export class OAuthCallbackDto {
  @ApiProperty({
    description: 'OAuth provider (google, apple, github)',
    example: 'google',
    enum: ['google', 'apple', 'github'],
  })
  @IsString()
  provider?: 'google' | 'apple' | 'github';

  @ApiProperty({
    description: 'OAuth code from provider',
    example: 'code123...',
  })
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'OAuth state for CSRF protection',
    example: 'state123...',
  })
  @IsOptional()
  @IsString()
  state?: string;
}

/**
 * OAuth User Info DTO
 * User information from OAuth provider
 */
export class OAuthUserInfoDto {
  @ApiProperty({
    description: 'Unique provider ID',
    example: '123456789',
  })
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Email from provider',
    example: 'user@example.com',
  })
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Display name from provider',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({
    description: 'Verified email flag',
    example: true,
  })
  @IsOptional()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Locale/language',
    example: 'en_US',
  })
  @IsOptional()
  @IsString()
  locale?: string;
}

/**
 * OAuth User Info Response DTO (simplified for Swagger)
 * Added to avoid circular dependency
 */
export class OAuthUserInfoResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid', type: String })
  id!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;

  @ApiProperty({ description: 'User name', example: 'John Doe', type: String, required: false })
  name?: string;
}

/**
 * OAuth Login Response DTO
 * Updated to work correctly with Swagger (avoids circular dependency)
 */
export class OAuthLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
    type: Number,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'User information',
    type: () => OAuthUserInfoResponseDto,
  })
  user!: OAuthUserInfoResponseDto;
}

/**
 * Social Account DTO
 * Added for Swagger documentation
 * Matches the structure returned by getUserSocialAccounts service
 */
export class SocialAccountDto {
  @ApiProperty({ description: 'Social account ID', type: String })
  id!: string;

  @ApiProperty({ description: 'Provider name', example: 'google', type: String })
  provider!: string;

  @ApiPropertyOptional({ description: 'Email from social account', example: 'user@example.com', type: String, nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ description: 'Display name from social account', example: 'John Doe', type: String, nullable: true })
  displayName?: string | null;

  @ApiPropertyOptional({ description: 'Profile picture URL', example: 'https://example.com/photo.jpg', type: String, nullable: true })
  profilePicture?: string | null;

  @ApiProperty({ description: 'Created at', type: Date })
  createdAt!: Date;
}

/**
 * Unlink Social Account Response DTO
 * Added for Swagger documentation
 */
export class UnlinkSocialAccountResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'google account unlinked successfully',
    type: String,
  })
  message!: string;
}
