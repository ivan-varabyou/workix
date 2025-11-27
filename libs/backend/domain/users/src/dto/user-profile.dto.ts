import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Get User Profile Response DTO
 * Updated to work correctly with Swagger (avoids circular dependencies)
 */
export class UserProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: 'uuid', type: String })
  id!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John', type: String, nullable: true })
  firstName?: string | null;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe', type: String, nullable: true })
  lastName?: string | null;

  @ApiPropertyOptional({ description: 'Bio/description', example: 'Software developer', type: String, nullable: true })
  bio?: string | null;

  @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg', type: String, nullable: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890', type: String, nullable: true })
  phoneNumber?: string | null;

  @ApiProperty({ description: 'Account creation date', example: '2025-11-17T23:00:00Z', type: Date })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date', example: '2025-11-17T23:00:00Z', type: Date })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: '2FA enabled status', example: false, type: Boolean, nullable: true })
  twoFactorEnabled?: boolean | null;

  @ApiPropertyOptional({ description: 'Last login time', example: '2025-11-17T23:00:00Z', type: Date, nullable: true })
  lastLoginAt?: Date | null;
}

/**
 * Update User Profile DTO
 */
export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Bio/description',
    example: 'Software developer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

/**
 * User List Response DTO
 * Updated to work correctly with Swagger
 * Matches the structure returned by listUsers service (page/pageSize)
 */
export class UserListResponseDto {
  @ApiProperty({ description: 'List of users', type: () => [UserProfileResponseDto] })
  users!: UserProfileResponseDto[];

  @ApiProperty({ description: 'Total number of users', example: 100, type: Number })
  total!: number;

  @ApiProperty({ description: 'Current page number', example: 1, type: Number })
  page!: number;

  @ApiProperty({ description: 'Number of users per page', example: 10, type: Number })
  pageSize!: number;
}

/**
 * User Search Result DTO
 * Added for Swagger documentation
 */
export class UserSearchResultDto {
  @ApiProperty({ description: 'User ID', example: 'uuid', type: String })
  id!: string;

  @ApiHideProperty() // Hide email from Swagger to avoid circular dependency
  email!: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John', type: String, nullable: true })
  firstName?: string | null;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe', type: String, nullable: true })
  lastName?: string | null;

  @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg', type: String, nullable: true })
  avatarUrl?: string | null;
}

/**
 * Delete User Profile Response DTO
 * Added for Swagger documentation
 */
export class DeleteUserProfileResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Profile deleted successfully',
    type: String,
  })
  message!: string;
}

/**
 * Update Avatar Request Body DTO
 * Added for Swagger documentation
 */
export class UpdateAvatarRequestBodyDto {
  @ApiProperty({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg', type: String })
  avatarUrl!: string;

  @ApiPropertyOptional({ description: 'File storage key (optional)', example: 'avatars/user123.jpg', type: String })
  fileKey?: string;
}

/**
 * User Statistics DTO
 */
export class UserStatsDto {
  @ApiProperty({ description: 'Total users' })
  total: number;

  @ApiProperty({ description: 'Active users (last 30 days)' })
  active: number;

  @ApiProperty({ description: 'Inactive users' })
  inactive: number;

  @ApiProperty({ description: 'Active rate percentage' })
  activeRate: string;

  constructor(total: number, active: number, inactive: number, activeRate: string) {
    this.total = total;
    this.active = active;
    this.inactive = inactive;
    this.activeRate = activeRate;
  }
}

/**
 * Search Users DTO
 */
export class SearchUsersDto {
  @ApiProperty({
    description: 'Search query',
    example: 'john',
  })
  @IsString()
  @MinLength(2)
  query?: string;

  @ApiPropertyOptional({
    description: 'Result limit',
    example: 10,
  })
  @IsOptional()
  limit?: number = 10;
}
